import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { INSTITUCION, NAVEGACION, unirDatos } from '../../core/institucion';

/** Pie de página (propuesta 1a): franja amarilla, navegación, redes, contacto y lema. */
@Component({
  selector: 'app-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <div class="pie">
      <nav aria-label="Navegación del pie de página">
        @for (enlace of enlaces; track enlace.ruta) {
          <a [routerLink]="enlace.ruta" routerLinkActive="activo">{{ enlace.etiqueta }}</a>
        }
        <a routerLink="/verificar" routerLinkActive="activo">Verificar certificado</a>
        <a routerLink="/admin" routerLinkActive="activo">Acceso administrativo</a>
      </nav>

      @if (institucion.redes.facebook || institucion.redes.instagram || institucion.redes.youtube) {
        <div class="redes">
          @if (institucion.redes.facebook) {
            <a [href]="institucion.redes.facebook" target="_blank" rel="noopener" aria-label="Facebook">
              <mat-icon>facebook</mat-icon>
            </a>
          }
          @if (institucion.redes.instagram) {
            <a [href]="institucion.redes.instagram" target="_blank" rel="noopener" aria-label="Instagram">
              <mat-icon>photo_camera</mat-icon>
            </a>
          }
          @if (institucion.redes.youtube) {
            <a [href]="institucion.redes.youtube" target="_blank" rel="noopener" aria-label="YouTube">
              <mat-icon>smart_display</mat-icon>
            </a>
          }
        </div>
      }

      <p class="datos">
        © {{ anio }} {{ datos }}
      </p>
    </div>
    @if (institucion.lema) {
      <p class="lema">{{ institucion.lema }}</p>
    }
  `,
  styles: `
    :host { display: block; background: var(--rg-azul); color: #fff; border-top: 5px solid var(--rg-amarillo); }
    .pie {
      max-inline-size: var(--rg-ancho-maximo);
      margin-inline: auto;
      padding: 1.4rem var(--rg-margen) 1.1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.9rem 1.5rem;
      flex-wrap: wrap;
    }
    nav { display: flex; flex-wrap: wrap; gap: 0.35rem 1.1rem; }
    a {
      color: #fff;
      text-decoration: none;
      font: 700 0.8rem / 1.4 var(--rg-fuente-titulos);
      text-transform: uppercase;
    }
    a:hover, a.activo { color: var(--rg-amarillo); }
    .redes { display: flex; gap: 0.6rem; }
    .redes a { color: var(--rg-amarillo); display: inline-flex; }
    .datos {
      flex-basis: 100%;
      margin: 0;
      padding-block-start: 0.9rem;
      border-top: 1px solid rgb(255 255 255 / 15%);
      color: #c9d4e6;
      font-size: 0.82rem;
    }
    .lema {
      margin: 0;
      background: var(--rg-amarillo);
      color: var(--rg-azul);
      text-align: center;
      padding: 0.45rem;
      font: 700 0.85rem / 1.2 var(--rg-fuente-titulos);
      text-transform: uppercase;
    }
  `,
})
export class SiteFooterComponent {
  protected readonly institucion = INSTITUCION;
  protected readonly datos = unirDatos(' · ', INSTITUCION.nombreCorto, INSTITUCION.direccion, INSTITUCION.telefonos);
  protected readonly anio = new Date().getFullYear();
  /** El pie no repite "Campus Virtual", igual que en la plantilla. */
  protected readonly enlaces = NAVEGACION.filter((e) => e.ruta !== '/campus');
}
