import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Escudo oficial de Rabí Gamaliel.
 *
 * Archivos en `public/img/` (fondo transparente), generados desde `escudo-original.jpeg` (1024×1024):
 * - `escudo.webp`: formato principal, 256×256 px.
 * - `escudo.png`: respaldo para navegadores sin WebP (256×256 px).
 * - `escudo-512.png`: versión grande para impresos y documentos.
 * Los íconos de la app instalable están en `public/img/icons/` y `favicon.ico`.
 */
@Component({
  selector: 'app-escudo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'escudo', '[style.--escudo-tamano.px]': 'tamano()' },
  template: `
    <picture>
      <source srcset="img/escudo.webp" type="image/webp" />
      <img
        src="img/escudo.png"
        alt="Escudo de la Fundación Educativa Rabí Gamaliel"
        [width]="tamano()"
        [height]="tamano()"
        decoding="async"
      />
    </picture>
  `,
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
      inline-size: var(--escudo-tamano);
      block-size: var(--escudo-tamano);
      background: #fff;
      border-radius: 4px;
      padding: 3px;
      box-sizing: border-box;
      flex: none;
    }
    picture, img { display: block; inline-size: 100%; block-size: 100%; object-fit: contain; }
  `,
})
export class EscudoComponent {
  /** Tamaño en píxeles (lado del cuadrado). */
  readonly tamano = input(62);
}
