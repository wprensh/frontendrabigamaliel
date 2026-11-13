import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AREAS, LETRAS, ResultadoIntento, TIPOS_PRUEBA } from '../../../core/models/simulacro.model';
import { CampusAcademicoService } from '../../../core/services/campus-academico.service';
import { mensajeDeError } from '../../../core/utils/http-error';
import { Barra, BarrasComponent } from '../../../shared/graficos/barras.component';
import { EncabezadoCampusComponent } from '../compartido/encabezado-campus.component';

/** Resultado de un simulacro: aciertos, puntaje global estimado (Saber 11), áreas, competencias y revisión. */
@Component({
  selector: 'app-resultado-simulacro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatIconModule, MatProgressBarModule, BarrasComponent, EncabezadoCampusComponent],
  template: `
    <div class="contenedor">
      <app-encabezado-campus
        [titulo]="resultado()?.titulo ?? 'Resultado del simulacro'"
        [subtitulo]="resultado() ? tipos[resultado()!.tipo] : ''"
        icono="insights"
        volverA="/campus/simulacros"
        textoVolver="Simulacros"
      >
        @if (resultado()) {
          <button mat-stroked-button type="button" (click)="imprimir()">
            <mat-icon aria-hidden="true">print</mat-icon>
            Imprimir
          </button>
        }
      </app-encabezado-campus>

      @if (error(); as e) {
        <p class="tarjeta aviso-error" role="alert">{{ e }}</p>
      }

      @if (resultado(); as r) {
        <section class="puntajes">
          <div class="tarjeta destacado">
            <span>Aciertos</span>
            <strong>{{ r.aciertos }} / {{ r.total }}</strong>
            <span>{{ r.porcentaje | number: '1.0-0' }} %</span>
          </div>
          @if (r.global !== null) {
            <div class="tarjeta destacado global">
              <span>Puntaje global estimado</span>
              <strong>{{ r.global }}</strong>
              <span>de 500 puntos</span>
            </div>
          }
          @if (r.entregadoEn) {
            <div class="tarjeta destacado">
              <span>Entregado</span>
              <strong class="fecha">{{ r.entregadoEn | date: 'd MMM y' }}</strong>
              <span>{{ r.entregadoEn | date: 'h:mm a' }}</span>
            </div>
          }
        </section>

        <!-- Plan de refuerzo: áreas y competencias con bajo resultado -->
        <section class="tarjeta refuerzo" aria-labelledby="titulo-refuerzo">
          <h2 id="titulo-refuerzo">
            <mat-icon aria-hidden="true">tips_and_updates</mat-icon>
            Recomendaciones de refuerzo
          </h2>
          @for (rec of r.recomendaciones; track rec.area) {
            <article class="recomendacion" [class]="'prioridad-' + rec.prioridad.toLowerCase()">
              <header>
                <h3>{{ areas[rec.area] }}</h3>
                <span class="nivel">{{ rec.nivel }} · {{ rec.porcentaje | number: '1.0-0' }} %</span>
                <span class="prioridad">Prioridad {{ rec.prioridad.toLowerCase() }}</span>
              </header>
              <p>{{ rec.mensaje }}</p>
              @for (c of rec.competencias; track c.competencia) {
                <div class="competencia">
                  <p class="nombre-competencia">
                    <strong>{{ c.competencia }}</strong> · {{ c.porcentaje | number: '1.0-0' }} % de aciertos
                  </p>
                  <p class="etiqueta-temas">Temas para repasar:</p>
                  <ul>
                    @for (t of c.temas; track t) {
                      <li>{{ t }}</li>
                    }
                  </ul>
                  <p class="estrategia"><mat-icon aria-hidden="true">lightbulb</mat-icon> {{ c.estrategia }}</p>
                </div>
              }
              @if (rec.preguntasFalladas.length) {
                <p class="falladas">
                  Repasa {{ rec.preguntasFalladas.length === 1 ? 'la pregunta' : 'las preguntas' }}
                  {{ rec.preguntasFalladas.join(', ') }}.
                </p>
              }
            </article>
          } @empty {
            <p class="felicitacion">
              <mat-icon aria-hidden="true">emoji_events</mat-icon>
              ¡Excelente trabajo! Obtuviste 60 % o más en todas las áreas y competencias. Sigue practicando para llegar al nivel avanzado.
            </p>
          }
        </section>

        <section class="tarjeta" aria-labelledby="titulo-areas">
          <h2 id="titulo-areas">Por área</h2>
          <app-barras [barras]="barrasArea()" />
        </section>

        @if (r.porCompetencia.length) {
          <section class="tarjeta" aria-labelledby="titulo-competencias">
            <h2 id="titulo-competencias">Por competencia</h2>
            <app-barras [barras]="barrasCompetencia()" />
          </section>
        }

        @if (r.global !== null) {
          <p class="nota">
            El puntaje global se estima como en el ICFES: ((Lectura crítica + Matemáticas + Sociales + Ciencias) × 3 + Inglés) ÷ 13,
            llevado a una escala de 0 a 500. Es una referencia para practicar, no un resultado oficial.
          </p>
        }

        <section class="tarjeta" aria-labelledby="titulo-revision">
          <h2 id="titulo-revision">Revisión de respuestas</h2>
          @if (r.revision; as revision) {
            <ol class="revision">
              @for (q of revision; track q.preguntaId) {
                <li [class.correcta]="q.elegida === q.correcta" [class.incorrecta]="q.elegida !== q.correcta">
                  <p class="meta">
                    Pregunta {{ q.orden }} · {{ areas[q.area] }} ·
                    <strong>{{ q.elegida === q.correcta ? 'Correcta' : q.elegida === null ? 'Sin responder' : 'Incorrecta' }}</strong>
                  </p>
                  @if (q.contexto) {
                    <p class="contexto">{{ q.contexto }}</p>
                  }
                  @if (q.imagenUrl) {
                    <img [src]="q.imagenUrl" alt="Imagen de la pregunta" loading="lazy" />
                  }
                  <p class="enunciado">{{ q.enunciado }}</p>
                  <ul class="opciones">
                    @for (o of q.opciones; track $index) {
                      <li [class.es-correcta]="$index === q.correcta" [class.es-elegida]="$index === q.elegida">
                        <span class="letra">{{ letras[$index] }}</span> {{ o }}
                        @if ($index === q.correcta) {
                          <mat-icon aria-label="Respuesta correcta">check_circle</mat-icon>
                        } @else if ($index === q.elegida) {
                          <mat-icon aria-label="Su respuesta">cancel</mat-icon>
                        }
                      </li>
                    }
                  </ul>
                  @if (q.explicacion) {
                    <p class="explicacion"><strong>Explicación:</strong> {{ q.explicacion }}</p>
                  }
                </li>
              }
            </ol>
          } @else {
            <p class="vacio">{{ r.mensajeRevision ?? 'Las respuestas correctas no se publican para este simulacro.' }}</p>
          }
        </section>
      } @else if (!error()) {
        <mat-progress-bar mode="indeterminate" aria-label="Cargando resultado" />
      }
    </div>
  `,
  styles: `
    section {
      margin-block-end: 1rem;
    }

    h2 {
      margin-block-start: 0;
      color: var(--rg-azul);
      font-size: 1.1rem;
    }

    .puntajes {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 1rem;
    }

    .destacado {
      display: grid;
      justify-items: center;
      text-align: center;

      span {
        color: var(--rg-texto-suave);
      }

      strong {
        color: var(--rg-azul);
        font-family: var(--rg-fuente-titulos);
        font-size: 2.2rem;
        line-height: 1.2;
      }

      .fecha {
        font-size: 1.4rem;
      }

      &.global {
        background: var(--rg-azul);

        span {
          color: #dbe4f3;
        }

        strong {
          color: var(--rg-amarillo);
        }
      }
    }

    .refuerzo {
      h2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    .recomendacion {
      padding: 0.9rem 1rem;
      margin-block-end: 0.75rem;
      border: 1px solid var(--rg-borde);
      border-inline-start: 5px solid var(--rg-amarillo);
      border-radius: 10px;
      background: var(--rg-superficie-suave);

      &.prioridad-alta {
        border-inline-start-color: var(--rg-rojo);
      }

      &.prioridad-baja {
        border-inline-start-color: var(--rg-azul-medio);
      }

      header {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 0.35rem 0.75rem;
      }

      h3 {
        margin: 0;
        color: var(--rg-azul);
        font-size: 1.05rem;
      }

      p {
        margin: 0.5rem 0 0;
      }
    }

    .nivel {
      color: var(--rg-texto-suave);
      font-size: 0.85rem;
    }

    .prioridad {
      margin-inline-start: auto;
      padding: 0.15rem 0.6rem;
      border-radius: 999px;
      background: var(--rg-dorado-suave);
      color: var(--rg-dorado-texto);
      font-size: 0.75rem;
      font-weight: 700;
    }

    .prioridad-alta .prioridad {
      background: #fde2e5;
      color: var(--rg-rojo);
    }

    .competencia {
      margin-block-start: 0.75rem;
      padding-block-start: 0.6rem;
      border-block-start: 1px dashed var(--rg-borde);

      ul {
        margin: 0.25rem 0 0;
        padding-inline-start: 1.25rem;
      }
    }

    .etiqueta-temas {
      color: var(--rg-texto-suave);
      font-size: 0.85rem;
    }

    .estrategia {
      display: flex;
      gap: 0.4rem;
      align-items: flex-start;

      mat-icon {
        flex: none;
        color: var(--rg-dorado-texto);
        font-size: 20px;
        inline-size: 20px;
        block-size: 20px;
      }
    }

    .falladas {
      color: var(--rg-texto-suave);
      font-size: 0.85rem;
    }

    .felicitacion {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;

      mat-icon {
        color: var(--rg-dorado-texto);
      }
    }

    .nota {
      color: var(--rg-texto-suave);
      font-size: 0.85rem;
    }

    .revision {
      display: grid;
      gap: 1rem;
      margin: 0;
      padding: 0;
      list-style: none;

      > li {
        padding: 0.8rem 1rem;
        border: 1px solid var(--rg-borde);
        border-left: 5px solid var(--rg-rojo);
        border-radius: 2px;

        &.correcta {
          border-left-color: #0f7b3f;
        }
      }
    }

    .meta {
      margin: 0;
      color: var(--rg-texto-suave);
      font-size: 0.85rem;
    }

    .contexto,
    .enunciado {
      white-space: pre-line;
    }

    .enunciado {
      font-weight: 600;
    }

    img {
      max-inline-size: 100%;
    }

    .opciones {
      display: grid;
      gap: 0.3rem;
      margin: 0;
      padding: 0;
      list-style: none;

      li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.35rem 0.6rem;
        border-radius: 6px;
      }

      .es-elegida {
        background: #fde2e5;
      }

      .es-correcta {
        background: #e5f5ec;
        font-weight: 600;
      }

      mat-icon {
        margin-inline-start: auto;
      }
    }

    .letra {
      font-weight: 800;
    }

    .explicacion {
      margin-block-end: 0;
      padding: 0.5rem 0.7rem;
      background: var(--rg-superficie-suave);
      border-radius: 6px;
    }

    .vacio {
      color: var(--rg-texto-suave);
    }

    .aviso-error {
      color: var(--rg-rojo);
    }
  `,
})
export class ResultadoSimulacroComponent implements OnInit {
  readonly id = input.required<string>();
  /** ?estudiante= para acudientes. */
  readonly estudiante = input<string>();

  readonly #servicio = inject(CampusAcademicoService);

  protected readonly tipos = TIPOS_PRUEBA;
  protected readonly areas = AREAS;
  protected readonly letras = LETRAS;
  protected readonly resultado = signal<ResultadoIntento | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly barrasArea = computed<Barra[]>(
    () =>
      this.resultado()?.porArea.map((a) => ({
        etiqueta: AREAS[a.area],
        valor: a.porcentaje,
        texto: `${a.aciertos}/${a.total} · ${Math.round(a.porcentaje)} %`,
      })) ?? [],
  );

  protected readonly barrasCompetencia = computed<Barra[]>(
    () =>
      this.resultado()?.porCompetencia.map((c) => ({
        etiqueta: `${AREAS[c.area]}: ${c.competencia}`,
        valor: c.porcentaje,
        texto: `${c.aciertos}/${c.total}`,
      })) ?? [],
  );

  async ngOnInit(): Promise<void> {
    try {
      this.resultado.set(await this.#servicio.resultadoSimulacro(this.id(), this.estudiante()));
    } catch (error) {
      this.error.set(mensajeDeError(error));
    }
  }

  protected imprimir(): void {
    window.print();
  }
}
