import { DatePipe, Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  LOCALE_ID,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { INSTITUCION } from '../../core/institucion';
import { PagedResult, paginaVacia } from '../../core/models/api.models';
import { ArchivoMes, CategoriaNoticia, Noticia, estiloDeCategoria } from '../../core/models/noticia.model';
import { resolverUrlRecurso } from '../../core/utils/url-recurso';
import { analizarYoutube, urlMiniaturaYoutube } from '../../core/utils/youtube';
import { paginadorEnEspanol } from '../../core/paginador-intl';
import { NoticiasService } from '../../core/services/noticias.service';
import { desdeFechaIso } from '../../core/utils/fechas';
import { mensajeDeError } from '../../core/utils/http-error';
import {
  FILTRO_FECHAS_INICIAL,
  FiltroFechasNoticias,
  describirPeriodo,
  filtroAParametrosUrl,
  filtroDesdeUrl,
  rangoDelFiltro,
} from '../../core/utils/periodo-noticias';
import { NoticiaDetalleDialogComponent } from '../../shared/noticia-detalle/noticia-detalle-dialog.component';
import { FiltroFechasNoticiasComponent } from './filtro-fechas-noticias/filtro-fechas-noticias.component';

interface AccesoRapido {
  readonly titulo: string;
  readonly descripcion: string;
  readonly icono: string;
  readonly ruta: string;
  readonly consulta?: Record<string, string | number>;
  readonly tono: 'azul' | 'dorado' | 'crema';
}

/** Noticias por página en el inicio: una destacada y cuatro compactas. */
const NOTICIAS_POR_PAGINA = 5;

const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

/**
 * Inicio · diseño 1d (Portal de servicios): accesos rápidos, noticias con filtro por categoría,
 * búsqueda (?buscar=) y fechas, proceso de admisión y próximos eventos.
 */
@Component({
  selector: 'app-inicio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatPaginatorModule,
    FiltroFechasNoticiasComponent,
  ],
  providers: [{ provide: MatPaginatorIntl, useFactory: paginadorEnEspanol }],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss',
})
export class InicioComponent implements OnInit {
  readonly #noticiasService = inject(NoticiasService);
  readonly #dialog = inject(MatDialog);
  readonly #location = inject(Location);
  readonly #locale = inject(LOCALE_ID);
  private readonly seccionNoticias = viewChild<ElementRef<HTMLElement>>('seccionNoticias');

  protected readonly institucion = INSTITUCION;
  protected readonly noticiasPorPagina = NOTICIAS_POR_PAGINA;
  readonly #ruta = inject(ActivatedRoute);

  protected readonly accesos: readonly AccesoRapido[] = [
    { titulo: 'Inscripción de cupos', descripcion: 'Radica tu solicitud', icono: 'how_to_reg', ruta: '/admisiones', tono: 'dorado' },
    { titulo: 'Campus virtual', descripcion: 'Clases y tareas', icono: 'laptop_chromebook', ruta: '/campus', tono: 'azul' },
    { titulo: 'Radicar PQRS', descripcion: 'Atención ciudadana', icono: 'support_agent', ruta: '/contacto', tono: 'crema' },
    { titulo: 'Calendario escolar', descripcion: 'Fechas clave del año', icono: 'event', ruta: '/calendario', tono: 'dorado' },
  ];

  protected readonly categorias: readonly { valor: CategoriaNoticia | null; etiqueta: string }[] = [
    { valor: null, etiqueta: 'Todas' },
    { valor: 'Academica', etiqueta: 'Académico' },
    { valor: 'Cultural', etiqueta: 'Cultura' },
    { valor: 'Deportiva', etiqueta: 'Deportes' },
  ];

  protected readonly pasosAdmision: readonly string[] = [
    'Pre-inscripción en línea',
    'Entrega de documentos',
    'Entrevista con coordinación',
    'Matrícula',
  ];

  protected readonly categoria = signal<CategoriaNoticia | null>(null);
  protected readonly busqueda = signal<string>(this.#ruta.snapshot.queryParamMap.get('buscar')?.trim() ?? '');

  // ---- Noticias recientes (paginadas en la API, las más nuevas primero) ----
  protected readonly paginaNoticias = signal<PagedResult<Noticia>>(paginaVacia<Noticia>());
  protected readonly noticias = computed(() => this.paginaNoticias().items);
  protected readonly destacada = computed(() => this.noticias()[0] ?? null);
  protected readonly restantes = computed(() => this.noticias().slice(1));
  protected readonly cargandoNoticias = signal(true);
  protected readonly primeraCarga = signal(true);
  protected readonly errorNoticias = signal<string | null>(null);
  #ultimaSolicitud = 0;

  // ---- Filtro por fechas (se conserva en la URL para poder compartir el enlace) ----
  protected readonly filtro = signal<FiltroFechasNoticias>(filtroDesdeUrl(inject(ActivatedRoute).snapshot.queryParamMap));
  protected readonly archivo = signal<readonly ArchivoMes[]>([]);
  protected readonly hayFiltroDeFechas = computed(() => {
    const { periodo, desde, hasta } = this.filtro();
    return periodo !== 'todas' && (periodo !== 'personalizado' || desde !== null || hasta !== null);
  });
  protected readonly descripcionPeriodo = computed(() => describirPeriodo(this.filtro(), this.#locale));
  /** El filtro por fechas se despliega con el botón "Fechas" (abierto si la URL ya trae un periodo). */
  protected readonly mostrarFechas = signal(false);
  protected readonly hayFiltros = computed(() => this.hayFiltroDeFechas() || !!this.categoria() || !!this.busqueda());

  constructor() {
    // El buscador del encabezado navega a /inicio?buscar=…; si ya estamos aquí, se recarga con el nuevo texto.
    this.#ruta.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const texto = params.get('buscar')?.trim() ?? '';
      if (texto !== this.busqueda()) {
        this.busqueda.set(texto);
        void this.cargarNoticias(1);
      }
    });
  }

  // ---- Eventos próximos ----
  protected readonly eventos = signal<readonly Noticia[]>([]);
  protected readonly cargandoEventos = signal(true);

  protected readonly aFecha = desdeFechaIso;

  ngOnInit(): void {
    this.mostrarFechas.set(this.hayFiltroDeFechas());
    void this.cargarNoticias(1);
    void this.cargarEventos();
    void this.cargarArchivo();
  }

  protected async cargarNoticias(pagina: number): Promise<void> {
    const solicitud = ++this.#ultimaSolicitud;
    this.cargandoNoticias.set(true);
    this.errorNoticias.set(null);

    try {
      const { desde, hasta } = rangoDelFiltro(this.filtro());
      const resultado = await this.#noticiasService.buscar({
        soloPublicadas: true,
        buscar: this.busqueda() || undefined,
        categoria: this.categoria() ?? undefined,
        desde: desde ?? undefined,
        hasta: hasta ?? undefined,
        orden: this.filtro().orden,
        pagina,
        tamanoPagina: NOTICIAS_POR_PAGINA,
      });
      // Si el usuario cambió de página otra vez mientras tanto, se ignora esta respuesta antigua.
      if (solicitud === this.#ultimaSolicitud) {
        this.paginaNoticias.set(resultado);
      }
    } catch (error) {
      if (solicitud === this.#ultimaSolicitud) {
        this.errorNoticias.set(mensajeDeError(error));
      }
    } finally {
      if (solicitud === this.#ultimaSolicitud) {
        this.cargandoNoticias.set(false);
        this.primeraCarga.set(false);
      }
    }
  }

  protected cambiarPagina(evento: PageEvent): void {
    void this.cargarNoticias(evento.pageIndex + 1);
    // Lleva la vista al inicio de la sección para que el lector vea la nueva página desde arriba.
    this.seccionNoticias()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Aplica un nuevo filtro: vuelve a la primera página y actualiza la URL sin navegar (no mueve el scroll). */
  protected cambiarFiltro(filtro: FiltroFechasNoticias): void {
    this.filtro.set(filtro);
    const parametros: Record<string, string> = { ...filtroAParametrosUrl(filtro) };
    if (this.busqueda()) {
      parametros['buscar'] = this.busqueda();
    }
    const consulta = new HttpParams({ fromObject: parametros }).toString();
    this.#location.replaceState(this.#location.path().split('?')[0], consulta);
    void this.cargarNoticias(1);
  }

  protected quitarFiltro(): void {
    this.cambiarFiltro({ ...FILTRO_FECHAS_INICIAL, orden: this.filtro().orden });
  }

  protected cambiarCategoria(categoria: CategoriaNoticia | null): void {
    this.categoria.set(categoria);
    void this.cargarNoticias(1);
  }

  protected quitarBusqueda(): void {
    this.busqueda.set('');
    this.cambiarFiltro(this.filtro());
  }

  protected quitarTodo(): void {
    this.categoria.set(null);
    this.busqueda.set('');
    this.cambiarFiltro({ ...FILTRO_FECHAS_INICIAL, orden: this.filtro().orden });
  }

  protected estilo(noticia: Noticia) {
    return estiloDeCategoria(noticia.categoria);
  }

  /** Portada del video de YouTube, la imagen de la noticia o null (se muestra el ícono de la categoría). */
  protected miniaturaDe(noticia: Noticia): string | null {
    const video = analizarYoutube(noticia.imagenUrl);
    if (video) {
      return urlMiniaturaYoutube(video);
    }
    const url = noticia.imagenUrl?.trim();
    return url ? resolverUrlRecurso(url) : null;
  }

  protected mesCorto(fechaIso: string): string {
    return MESES_CORTOS[desdeFechaIso(fechaIso).getMonth()];
  }

  protected async cargarArchivo(): Promise<void> {
    try {
      this.archivo.set(await this.#noticiasService.archivo());
    } catch {
      // Sin archivo el filtro sigue funcionando con los atajos y el rango personalizado.
      this.archivo.set([]);
    }
  }

  protected async cargarEventos(): Promise<void> {
    try {
      const resultado = await this.#noticiasService.buscar({ soloPublicadas: true, categoria: 'Evento', tamanoPagina: 3 });
      this.eventos.set(resultado.items);
    } catch {
      // Si falla, el bloque de eventos muestra su mensaje vacío; el error ya se informa en las noticias.
      this.eventos.set([]);
    } finally {
      this.cargandoEventos.set(false);
    }
  }

  /** Abre el detalle en el modal; el estilo se ajusta según la categoría de la noticia. */
  protected verNoticia(noticia: Noticia): void {
    NoticiaDetalleDialogComponent.abrir(this.#dialog, noticia);
  }
}
