import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';

import { SiteFooterComponent } from './layout/site-footer/site-footer.component';
import { SiteHeaderComponent } from './layout/site-header/site-header.component';
import { SiteRailComponent } from './layout/site-rail/site-rail.component';

/**
 * Estructura común (diseño 1d · Portal de servicios): barra lateral con escudo y menú de íconos,
 * encabezado con buscador, contenido de la ruta, pie de página y botón flotante "Escríbenos".
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, MatIconModule, SiteRailComponent, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <a class="saltar-contenido" href="#contenido">Saltar al contenido</a>
    <div class="portal">
      <app-site-rail />
      <div class="columna">
        <app-site-header />
        <main id="contenido" tabindex="-1">
          <router-outlet />
        </main>
        <app-site-footer />
      </div>
    </div>
    <a class="escribenos" routerLink="/contacto">
      <mat-icon aria-hidden="true">chat</mat-icon>
      <span>Escríbenos</span>
    </a>
  `,
  styles: `
    /* El fondo pinta la franja azul de la barra lateral en toda la altura de la página. */
    .portal {
      display: grid;
      grid-template-columns: 96px minmax(0, 1fr);
      min-block-size: 100dvh;
      background: linear-gradient(90deg, var(--rg-azul-oscuro) 0 93px, var(--rg-amarillo) 93px 96px, transparent 96px);
    }
    app-site-rail { align-self: start; }
    .columna { display: flex; flex-direction: column; min-inline-size: 0; }
    main { flex: 1; outline: none; }
    .escribenos {
      position: fixed;
      inset: auto 2.25rem 2rem auto;
      z-index: 15;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 1rem 1.35rem;
      border-radius: 18px;
      background: var(--rg-amarillo);
      color: var(--rg-azul);
      font: 700 15px/1 var(--rg-fuente-titulos);
      text-decoration: none;
      box-shadow: 0 6px 18px rgb(13 42 102 / 22%);
    }
    .escribenos:hover { filter: brightness(1.05); }
    .escribenos:focus-visible { outline: 3px solid var(--rg-azul); outline-offset: 3px; }

    @media (max-width: 760px) {
      .portal { grid-template-columns: minmax(0, 1fr); padding-block-end: 72px; background: none; }
      .escribenos { inset: auto 1rem calc(84px + env(safe-area-inset-bottom)) auto; padding: 0.85rem; border-radius: 50%; }
      .escribenos span { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); }
    }
    @media print {
      .portal { display: block; }
      app-site-rail, app-site-header, app-site-footer, .escribenos { display: none; }
    }
  `,
})
export class AppComponent {}
