import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';

import { INSTITUCION, unirDatos } from '../../core/institucion';
import {
  DocumentoCertificado,
  plantillaDe,
  siglaDocumento,
} from '../../core/models/certificado.model';
import { fechaEnLetras } from '../../core/utils/fechas';

interface DatoPie {
  readonly icono: 'nit' | 'direccion' | 'telefono' | 'correo';
  readonly etiqueta: string;
  readonly valor: string;
}

interface ParrafoDiploma {
  readonly texto: string;
  /** Párrafo completo entre comillas (“…”): nombre del curso o grado, va en un recuadro. */
  readonly destacado: boolean;
}

interface Fragmento {
  readonly texto: string;
  readonly resaltado: boolean;
}

/**
 * Certificado listo para imprimir, con dos plantillas (las de la Fundación):
 * - 'carta': hoja membretada vertical (ondas azul y dorado, lema y pie con NIT, dirección, teléfono y correo).
 * - 'diploma': constancia horizontal de cursos y grados (cinta azul, sello dorado y dos firmas en los cursos).
 *
 * En pantalla se escala al ancho disponible (todas las medidas están en `em` y el tamaño de letra
 * depende del ancho del contenedor); al imprimir ocupa exactamente una hoja carta (vertical u horizontal).
 * Con código muestra el QR de verificación; sin código es una vista previa.
 */
@Component({
  selector: 'app-certificado-documento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  templateUrl: './certificado-documento.component.html',
  styleUrl: './certificado-documento.component.scss',
})
export class CertificadoDocumentoComponent {
  readonly certificado = input.required<DocumentoCertificado>();

  protected readonly institucion = INSTITUCION;
  protected readonly qr = signal<string | null>(null);

  protected readonly formato = computed(
    () => plantillaDe(this.certificado().tipo).formato,
  );
  protected readonly esCurso = computed(
    () => this.certificado().tipo === 'Curso',
  );

  /** Resolución y DANE bajo el encabezado de la hoja membretada (el NIT ya va en el pie). */
  protected readonly lineaLegal = unirDatos(
    ' · ',
    INSTITUCION.membrete.resolucionAprobacion,
    INSTITUCION.membrete.codigoDane &&
      `DANE ${INSTITUCION.membrete.codigoDane}`,
  );

  /** Datos del pie de la hoja membretada; los vacíos no se imprimen. */
  protected readonly datosPie: readonly DatoPie[] = (
    [
      { icono: 'nit', etiqueta: 'NIT', valor: INSTITUCION.membrete.nit },
      {
        icono: 'direccion',
        etiqueta: 'Dirección',
        valor: unirDatos(', ', INSTITUCION.direccion, INSTITUCION.ciudad),
      },
      { icono: 'telefono', etiqueta: 'Teléfono', valor: INSTITUCION.telefonos },
      { icono: 'correo', etiqueta: 'Email', valor: INSTITUCION.correo },
    ] satisfies DatoPie[]
  ).filter((d) => d.valor);

  /** El lema en dos líneas, partido por la coma, como en la hoja membretada. */
  protected readonly lemaLineas = computed(() => {
    const lema = INSTITUCION.lema.trim();
    if (!lema) return null;
    const coma = lema.indexOf(',');
    return coma > 0
      ? [lema.slice(0, coma + 1), lema.slice(coma + 1).trim()]
      : [lema];
  });

  /** Nombre comercial de la escuela partido en dos colores: ENAMOR + ARTE. */
  protected readonly marca = computed(() => {
    const marca = INSTITUCION.escuela.marca.trim().toUpperCase();
    if (!marca) return null;
    const corte =
      marca.endsWith('ARTE') && marca.length > 4
        ? marca.length - 4
        : marca.length;
    return { inicio: marca.slice(0, corte), fin: marca.slice(corte) };
  });

  protected readonly escuelaCompleta = unirDatos(
    ' ',
    INSTITUCION.escuela.nombre,
    INSTITUCION.escuela.marca,
  );

  protected readonly parrafosDiploma = computed<ParrafoDiploma[]>(() =>
    this.certificado()
      .contenido.split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((texto) => ({ texto, destacado: /^[“"].*[”"]$/s.test(texto) })),
  );

  protected readonly cierreDiploma = computed(() => {
    const fecha = this.certificado().fechaExpedicion;
    if (!fecha) return '';
    const lugar = INSTITUCION.ciudad
      ? ` en ${INSTITUCION.ciudad}, Colombia,`
      : '';
    return `Dado${lugar} ${fechaEnLetras(fecha)}.`;
  });

  protected readonly verbo = computed(
    () => plantillaDe(this.certificado().tipo).verbo,
  );
  protected readonly sigla = computed(() =>
    siglaDocumento(this.certificado().tipoDocumento),
  );
  protected readonly cierre = computed(() => {
    const fecha = this.certificado().fechaExpedicion;
    if (!fecha) return '';
    return INSTITUCION.ciudad
      ? `Para constancia se firma en ${INSTITUCION.ciudad}, ${fechaEnLetras(fecha)}.`
      : `Para constancia se firma ${fechaEnLetras(fecha)}.`;
  });

  /** Dirección pública donde cualquiera puede comprobar el código (respeta el base href del sitio). */
  protected readonly urlVerificacion = computed(() => {
    const codigo = this.certificado().codigo;
    return codigo
      ? new URL(`verificar/${codigo}`, document.baseURI).href
      : null;
  });

  /** Párrafos del texto, con el nombre del beneficiario resaltado en negrita donde aparezca. */
  protected readonly parrafos = computed<Fragmento[][]>(() => {
    const { contenido, nombreBeneficiario } = this.certificado();
    const nombre = nombreBeneficiario.trim().toUpperCase();

    return contenido
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((parrafo) => {
        if (!nombre) {
          return [{ texto: parrafo, resaltado: false }];
        }
        return parrafo
          .split(nombre)
          .flatMap((texto, i) => [
            ...(i > 0 ? [{ texto: nombre, resaltado: true }] : []),
            { texto, resaltado: false },
          ])
          .filter((f) => f.texto);
      });
  });

  constructor() {
    effect(() => {
      const url = this.urlVerificacion();
      this.qr.set(null);
      if (url) {
        void this.#generarQr(url);
      }
    });
  }

  /** La librería del QR se descarga solo cuando hay un certificado expedido que mostrar. */
  async #generarQr(url: string): Promise<void> {
    const { toDataURL } = await import('qrcode');
    const imagen = await toDataURL(url, {
      margin: 0,
      width: 240,
      color: { dark: '#0d2a66', light: '#ffffff' },
    });
    // Si cambió el certificado mientras se generaba, se descarta.
    if (this.urlVerificacion() === url) {
      this.qr.set(imagen);
    }
  }
}
