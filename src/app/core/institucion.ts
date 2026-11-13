/**
 * Datos institucionales que aparecen en varias plantillas.
 * Centralizarlos aquí evita repetirlos y facilita actualizarlos.
 *
 * Regla: un dato que la institución aún no ha confirmado se deja vacío ('').
 * Las plantillas solo imprimen los datos que tienen valor; nunca se inventan.
 */
export interface DatosInstitucion {
  readonly nombre: string;
  readonly nombreCorto: string;
  readonly ciudad: string;
  readonly departamento: string;
  readonly lema: string;
  readonly direccion: string;
  readonly telefonos: string;
  readonly correo: string;
  readonly horarioAtencion: string;
  /** Firmante por defecto de los certificados. */
  readonly rectoria: { readonly nombre: string; readonly cargo: string };
  /** Datos legales del membrete de certificados, boletines y reportes. */
  readonly membrete: {
    /** p. ej. 'Aprobada por Resolución No. 0000 de 0000 de la Secretaría de Educación ...' */
    readonly resolucionAprobacion: string;
    readonly codigoDane: string;
    readonly nit: string;
  };
  readonly redes: { readonly facebook: string; readonly instagram: string; readonly youtube: string };
  /** Textos del PEI para la página Nosotros. Cada elemento de `historia` es un párrafo. */
  readonly pei: { readonly historia: readonly string[]; readonly mision: string; readonly vision: string };
}

export const INSTITUCION: DatosInstitucion = {
  nombre: 'Institución Educativa Rabí Gamaliel',
  nombreCorto: 'I.E. Rabí Gamaliel',
  ciudad: '', // PENDIENTE
  departamento: '', // PENDIENTE
  lema: '', // PENDIENTE
  direccion: '', // PENDIENTE
  telefonos: '', // PENDIENTE
  correo: '', // PENDIENTE
  horarioAtencion: '', // PENDIENTE (p. ej. '7:00 a.m. - 3:00 p.m.')
  rectoria: { nombre: '', cargo: 'Rector(a)' }, // PENDIENTE: nombre completo
  membrete: {
    resolucionAprobacion: '', // PENDIENTE
    codigoDane: '', // PENDIENTE
    nit: '', // PENDIENTE
  },
  redes: {
    facebook: '', // PENDIENTE
    instagram: '', // PENDIENTE
    youtube: '', // PENDIENTE
  },
  pei: {
    historia: [], // PENDIENTE
    mision: '', // PENDIENTE
    vision: '', // PENDIENTE
  },
};

/** Une con un separador solo las partes que tienen valor: unirDatos(' · ', 'a', '', 'b') → 'a · b'. */
export function unirDatos(separador: string, ...partes: (string | null | undefined)[]): string {
  return partes.filter((p): p is string => !!p && p.trim() !== '').join(separador);
}

/** "DANE 123 · NIT 456" con lo que haya (vacío si no hay ninguno). */
export function lineaLegal(): string {
  const m = INSTITUCION.membrete;
  return unirDatos(' · ', m.codigoDane && `DANE ${m.codigoDane}`, m.nit && `NIT ${m.nit}`);
}

/** "Ciudad – Departamento" con lo que haya. */
export function lineaUbicacion(): string {
  return unirDatos(' – ', INSTITUCION.ciudad, INSTITUCION.departamento);
}

export interface EnlaceNavegacion {
  readonly ruta: string;
  readonly etiqueta: string;
}

export const NAVEGACION: readonly EnlaceNavegacion[] = [
  { ruta: '/inicio', etiqueta: 'Inicio' },
  { ruta: '/nosotros', etiqueta: 'Nosotros' },
  { ruta: '/academico', etiqueta: 'Académico' },
  { ruta: '/admisiones', etiqueta: 'Admisiones' },
  { ruta: '/servicios', etiqueta: 'Servicios' },
  { ruta: '/contacto', etiqueta: 'Contacto' },
  { ruta: '/campus', etiqueta: 'Campus Virtual' },
];
