/**
 * Datos institucionales que aparecen en varias plantillas.
 * Centralizarlos aquí evita repetirlos y facilita actualizarlos.
 *
 * Regla: un dato que la institución aún no ha confirmado se deja vacío ('').
 * Las plantillas solo imprimen los datos que tienen valor; nunca se inventan.
 */
export interface DatosInstitucion {
  /** Tipo de entidad, como aparece en el escudo (p. ej. "Fundación Educativa"). */
  readonly tipo: string;
  /** Nombre propio sin el tipo (p. ej. "Rabí Gamaliel"). */
  readonly nombrePropio: string;
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
  readonly redes: {
    readonly facebook: string;
    readonly instagram: string;
    readonly youtube: string;
  };
  /** Textos del PEI para la página Nosotros. Cada elemento de `historia` es un párrafo. */
  readonly pei: {
    readonly historia: readonly string[];
    readonly mision: string;
    readonly vision: string;
  };
}

export const INSTITUCION: DatosInstitucion = {
  tipo: 'Fundación Educativa',
  nombrePropio: 'Rabí Gamaliel',
  nombre: 'Fundación Educativa Rabí Gamaliel',
  nombreCorto: 'Fundación Rabí Gamaliel',
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
    mision:
      'La Fundación Educativa Rabí Gamaliel tiene como misión promover el desarrollo integral de las personas y las comunidades mediante la formulación, gestión y ejecución de programas, proyectos y procesos educativos, sociales, culturales, científicos, artísticos y de formación para el trabajo y el desarrollo humano. Orienta su labor bajo principios éticos, morales y espirituales inspirados en las Sagradas Escrituras, fortaleciendo las competencias ciudadanas, axiológicas, laborales y académicas, la formación de líderes con vocación de servicio, la investigación, la convivencia pacífica, los derechos humanos y la transformación social, en articulación con instituciones y organizaciones del ámbito local, nacional e internacional.',
    vision:
      'Para el año 2035, la Fundación Educativa Rabí Gamaliel se proyecta como una organización educativa y social reconocida por su contribución al desarrollo integral, la transformación cultural y el fortalecimiento de las comunidades, mediante una educación de calidad con fundamento ético y espiritual. Será referente en la formación de líderes competentes y comprometidos con el servicio a la sociedad, en la promoción del talento humano, la investigación, la innovación educativa, la cultura de paz, los derechos humanos y el rescate de los valores y expresiones culturales de las regiones, consolidando alianzas estratégicas que amplíen el impacto y la sostenibilidad de sus programas y proyectos a nivel nacional e internacional.',
  },
};

/** Une con un separador solo las partes que tienen valor: unirDatos(' · ', 'a', '', 'b') → 'a · b'. */
export function unirDatos(
  separador: string,
  ...partes: (string | null | undefined)[]
): string {
  return partes
    .filter((p): p is string => !!p && p.trim() !== '')
    .join(separador);
}

/** "DANE 123 · NIT 456" con lo que haya (vacío si no hay ninguno). */
export function lineaLegal(): string {
  const m = INSTITUCION.membrete;
  return unirDatos(
    ' · ',
    m.codigoDane && `DANE ${m.codigoDane}`,
    m.nit && `NIT ${m.nit}`,
  );
}

/** "Ciudad – Departamento" con lo que haya. */
export function lineaUbicacion(): string {
  return unirDatos(' – ', INSTITUCION.ciudad, INSTITUCION.departamento);
}

export interface EnlaceNavegacion {
  readonly ruta: string;
  readonly etiqueta: string;
  /** Ícono de Material (barra lateral del diseño 1d). */
  readonly icono: string;
  /** Etiqueta corta para la barra lateral (si difiere de `etiqueta`). */
  readonly corta?: string;
}

export const NAVEGACION: readonly EnlaceNavegacion[] = [
  { ruta: '/inicio', etiqueta: 'Inicio', icono: 'home' },
  { ruta: '/nosotros', etiqueta: 'Nosotros', icono: 'diversity_3' },
  { ruta: '/academico', etiqueta: 'Académico', icono: 'school' },
  { ruta: '/admisiones', etiqueta: 'Admisiones', icono: 'how_to_reg' },
  { ruta: '/servicios', etiqueta: 'Servicios', icono: 'volunteer_activism' },
  { ruta: '/contacto', etiqueta: 'Contacto', icono: 'forum' },
  {
    ruta: '/campus',
    etiqueta: 'Campus Virtual',
    icono: 'laptop_chromebook',
    corta: 'Campus',
  },
];
