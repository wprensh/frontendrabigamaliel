import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { INSTITUCION } from '../../core/institucion';
import { PageHeadingComponent } from '../../shared/page-heading/page-heading.component';

/** Plantilla 1: Nosotros y Misión Institucional. */
@Component({
  selector: 'app-nosotros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, PageHeadingComponent],
  template: `
    <div class="contenedor">
      <app-page-heading
        titulo="Nosotros & Misión Institucional"
        subtitulo="Historia, filosofía y valores educativos"
        etiqueta="Módulo institucional"
      />

      <div class="rejilla">
        <div class="columna">
          @if (pei.historia.length) {
            <section class="tarjeta-lateral franja-azul resena">
              <h2><mat-icon aria-hidden="true">account_balance</mat-icon> Reseña Histórica</h2>
              @for (parrafo of pei.historia; track $index) {
                <p>{{ parrafo }}</p>
              }
            </section>
          }

          @if (pei.mision || pei.vision) {
            <div class="mision-vision">
              @if (pei.mision) {
                <section class="tarjeta-franja franja-amarilla">
                  <h2>Misión</h2>
                  <p>{{ pei.mision }}</p>
                </section>
              }
              @if (pei.vision) {
                <section class="tarjeta-franja franja-roja">
                  <h2>Visión</h2>
                  <p>{{ pei.vision }}</p>
                </section>
              }
            </div>
          }

          @if (!pei.historia.length && !pei.mision && !pei.vision) {
            <section class="tarjeta-lateral franja-azul resena">
              <h2><mat-icon aria-hidden="true">account_balance</mat-icon> {{ institucion.nombre }}</h2>
              <p>Muy pronto publicaremos aquí nuestra historia, misión y visión institucional.</p>
            </section>
          }
        </div>

        <figure class="tarjeta sede">
          <!-- Foto propia: copie public/img/sede.jpg y defina la variable CSS rg-foto-sede en styles.scss -->
          <div class="sede-foto" role="img" aria-label="Estudiantes de la sede principal">
            <mat-icon aria-hidden="true">school</mat-icon>
          </div>
          <figcaption>
            <strong>Sede principal</strong>
            @if (institucion.direccion) {
              <span>{{ institucion.direccion }}</span>
            }
          </figcaption>
        </figure>
      </div>
    </div>
  `,
  styles: `
    .rejilla {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
      gap: 1.5rem;
      align-items: start;
    }
    .columna { display: grid; gap: 1rem; }
    h2 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem; margin: 0 0 0.5rem; }
    h2 mat-icon { color: var(--rg-amarillo); }
    p { margin: 0 0 0.4rem; color: var(--rg-texto-suave); }
    .resena p { color: var(--rg-texto); }
    .mision-vision { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .sede { margin: 0; padding: 1rem; }
    .sede-foto {
      display: grid;
      place-items: center;
      aspect-ratio: 16 / 6.5;
      border-radius: 6px;
      background: var(--rg-foto-sede, none) center / cover, linear-gradient(135deg, var(--rg-azul-medio), var(--rg-azul));
      color: rgb(255 255 255 / 70%);
    }
    .sede-foto mat-icon { font-size: 64px; inline-size: 64px; block-size: 64px; }
    figcaption {
      display: grid;
      text-align: center;
      margin-block-start: 0.75rem;
      background: var(--rg-superficie-suave);
      border-radius: 6px;
      padding: 0.6rem;
    }
    figcaption strong { font: 700 0.9rem / 1.4 var(--rg-fuente-titulos); text-transform: uppercase; color: var(--rg-azul); }
    figcaption span { font-size: 0.85rem; color: var(--rg-texto-suave); }
    @media (max-width: 900px) {
      .rejilla, .mision-vision { grid-template-columns: 1fr; }
    }
  `,
})
export class NosotrosComponent {
  protected readonly institucion = INSTITUCION;
  protected readonly pei = INSTITUCION.pei;
}
