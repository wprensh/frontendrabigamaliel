import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

import { INSTITUCION } from '../../core/institucion';

/**
 * Encabezado del diseño 1d: tipo de entidad en dorado, nombre en azul y buscador.
 * La búsqueda lleva al inicio con ?buscar=… y filtra las noticias publicadas.
 */
@Component({
  selector: 'app-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <header class="cabecera">
      <a class="marca" routerLink="/inicio">
        <picture class="escudo-movil">
          <source srcset="img/escudo.webp" type="image/webp" />
          <img src="img/escudo.png" alt="" width="52" height="52" decoding="async" />
        </picture>
        <span class="marca-texto">
          <span class="tipo">{{ institucion.tipo }}</span>
          <span class="nombre">{{ institucion.nombrePropio }}</span>
        </span>
      </a>

      <form class="buscador" role="search" (submit)="buscar($event, campo.value)">
        <label class="visualmente-oculto" for="buscar-sitio">Buscar en el sitio</label>
        <mat-icon aria-hidden="true">search</mat-icon>
        <input
          #campo
          id="buscar-sitio"
          type="search"
          name="buscar"
          placeholder="Buscar noticias, trámites o docentes"
          autocomplete="off"
          [value]="textoActual()"
        />
      </form>
    </header>
  `,
  styles: `
    :host { display: block; }
    .cabecera {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem 1.5rem;
      flex-wrap: wrap;
      padding: 1.75rem var(--rg-margen) 0;
      max-inline-size: var(--rg-ancho-maximo);
      margin-inline: auto;
    }
    .marca { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
    .marca:focus-visible { outline: 2px solid var(--rg-azul-medio); outline-offset: 4px; border-radius: 6px; }
    .escudo-movil { display: none; line-height: 0; }
    .escudo-movil img { inline-size: 52px; block-size: 52px; object-fit: contain; }
    .marca-texto { display: flex; flex-direction: column; gap: 6px; }
    .tipo {
      font: 700 13px/1 var(--rg-fuente-titulos);
      color: var(--rg-dorado-texto);
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .nombre { font: 800 28px/1.1 var(--rg-fuente-titulos); color: var(--rg-azul); }
    .buscador {
      flex: 1 1 280px;
      max-inline-size: 460px;
      block-size: 52px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-inline: 1.25rem;
      background: var(--rg-superficie);
      border: 1px solid var(--rg-borde);
      border-radius: 26px;
      color: var(--rg-texto-suave);
    }
    .buscador:focus-within { border-color: var(--rg-azul-medio); box-shadow: 0 0 0 3px rgb(30 86 176 / 18%); }
    input {
      flex: 1;
      min-inline-size: 0;
      border: 0;
      outline: 0;
      background: transparent;
      font: 400 15px/1.2 var(--rg-fuente-texto);
      color: var(--rg-texto);
    }
    input::placeholder { color: var(--rg-texto-suave); opacity: 1; }

    @media (max-width: 760px) {
      .cabecera { padding-block-start: 1rem; }
      .escudo-movil { display: block; }
      .tipo { font-size: 11px; }
      .nombre { font-size: 22px; }
      .buscador { flex-basis: 100%; max-inline-size: none; block-size: 46px; }
    }
  `,
})
export class SiteHeaderComponent {
  readonly #router = inject(Router);
  protected readonly institucion = INSTITUCION;

  /** Texto buscado actualmente (se conserva en el campo al navegar). */
  protected readonly textoActual = toSignal(
    this.#router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.#router.parseUrl(this.#router.url).queryParamMap.get('buscar') ?? ''),
    ),
    { initialValue: '' },
  );

  protected buscar(evento: Event, texto: string): void {
    evento.preventDefault();
    const buscar = texto.trim();
    void this.#router.navigate(['/inicio'], {
      queryParams: { buscar: buscar || null },
      fragment: 'noticias',
    });
  }
}
