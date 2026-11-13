import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { INSTITUCION, NAVEGACION } from '../../core/institucion';

/**
 * Navegación principal del diseño 1d (Portal de servicios): barra lateral azul con el escudo y
 * un ícono por sección. En pantallas pequeñas se convierte en una barra fija en la parte inferior.
 */
@Component({
  selector: 'app-site-rail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <a class="escudo" routerLink="/inicio" [attr.aria-label]="'Inicio · ' + institucion.nombre">
      <picture>
        <source srcset="img/escudo.webp" type="image/webp" />
        <img src="img/escudo.png" alt="" width="72" height="72" decoding="async" />
      </picture>
    </a>
    <nav aria-label="Navegación principal">
      <ul>
        @for (enlace of navegacion; track enlace.ruta) {
          <li>
            <a [routerLink]="enlace.ruta" routerLinkActive="activo" ariaCurrentWhenActive="page">
              <span class="icono"><mat-icon aria-hidden="true">{{ enlace.icono }}</mat-icon></span>
              <span class="etiqueta">{{ enlace.corta ?? enlace.etiqueta }}</span>
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      padding-block: 1.25rem;
      background: linear-gradient(var(--rg-azul), var(--rg-azul-oscuro));
      border-inline-end: 3px solid var(--rg-amarillo);
      position: sticky;
      inset-block-start: 0;
      block-size: 100dvh;
      overflow-y: auto;
      scrollbar-width: none;
    }
    .escudo { display: block; line-height: 0; border-radius: 8px; }
    .escudo img { inline-size: 72px; block-size: 72px; object-fit: contain; }
    ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.9rem; }
    a:not(.escudo) {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      inline-size: 88px;
      color: #c8d3ea;
      text-decoration: none;
      font: 600 12px/1.15 var(--rg-fuente-titulos);
      text-align: center;
      border-radius: 10px;
      padding-block: 2px;
    }
    .icono {
      display: grid;
      place-items: center;
      inline-size: 56px;
      block-size: 32px;
      border-radius: 16px;
      transition: background-color 150ms ease;
    }
    a:not(.escudo):hover .icono { background: rgb(255 255 255 / 10%); }
    a.activo { color: #fff; }
    a.activo .icono { background: var(--rg-amarillo); color: var(--rg-azul); }
    a:focus-visible { outline: 2px solid var(--rg-amarillo); outline-offset: 2px; }

    /* Celular y tableta pequeña: barra inferior fija con los mismos accesos. */
    @media (max-width: 760px) {
      :host {
        position: fixed;
        inset: auto 0 0 0;
        z-index: 20;
        block-size: auto;
        flex-direction: row;
        padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
        border-inline-end: 0;
        border-block-start: 3px solid var(--rg-amarillo);
        overflow: visible;
      }
      .escudo { display: none; }
      nav { inline-size: 100%; }
      ul { flex-direction: row; justify-content: space-around; gap: 0; }
      li { flex: 1; min-inline-size: 0; }
      a:not(.escudo) { inline-size: auto; font-size: 10.5px; gap: 3px; }
      .icono { inline-size: 44px; block-size: 28px; border-radius: 14px; }
      .etiqueta { max-inline-size: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    }
  `,
})
export class SiteRailComponent {
  protected readonly institucion = INSTITUCION;
  protected readonly navegacion = NAVEGACION;
}
