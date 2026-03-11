export interface OpcionNovedad {
  id: string;
  label: string;
}

export interface CategoriaNovedadDef {
  id: string;
  label: string;
  opciones: OpcionNovedad[];
}

export const CATEGORIAS_NOVEDADES: CategoriaNovedadDef[] = [
  {
    id: "cableado",
    label: "Cableado",
    opciones: [
      { id: "cableado_buen_estado",  label: "Buen estado" },
      { id: "cableado_corroido",     label: "Corroído" },
      { id: "cableado_cortado",      label: "Cortado" },
    ],
  },
  {
    id: "visibilidad",
    label: "Visibilidad",
    opciones: [
      { id: "visibilidad_reducida",  label: "Reducida" },
    ],
  },
  {
    id: "vientos",
    label: "Vientos",
    opciones: [
      { id: "vientos_buen_estado",   label: "Buen estado" },
      { id: "vientos_mal_estado",    label: "Mal estado" },
    ],
  },
  {
    id: "tensores",
    label: "Tensores",
    opciones: [
      { id: "tensores_buen_estado",  label: "Buen estado" },
      { id: "tensores_mal_estado",   label: "Mal estado" },
    ],
  },
  {
    id: "caja_estanca",
    label: "Caja estanca",
    opciones: [
      { id: "caja_fisurada",         label: "Fisurada" },
      { id: "caja_recambio_juntas",  label: "Recambio de juntas" },
    ],
  },
  {
    id: "escaleras",
    label: "Escaleras",
    opciones: [
      { id: "escaleras_sueltas",     label: "Sueltas" },
      { id: "escaleras_faltantes",   label: "Faltantes" },
    ],
  },
  {
    id: "guarda_hombre",
    label: "Guarda hombre",
    opciones: [
      { id: "gh_fijaciones_flojas",  label: "Con fijaciones flojas" },
      { id: "gh_deteriorado",        label: "Deteriorado" },
      { id: "gh_corroido",           label: "Corroído" },
    ],
  },
  {
    id: "bateria",
    label: "Batería",
    opciones: [
      { id: "bat_sulfatada",         label: "Sulfatada" },
      { id: "bat_no_recupera",       label: "No recupera carga" },
      { id: "bat_rota",              label: "Rota" },
      { id: "bat_faltante",          label: "Faltante" },
    ],
  },
  {
    id: "puertas",
    label: "Puertas",
    opciones: [
      { id: "puerta_faltante",       label: "Faltantes" },
      { id: "puerta_no_cierra",      label: "No puede cerrarse" },
    ],
  },
  {
    id: "vidrios",
    label: "Vidrios",
    opciones: [
      { id: "vidrio_faltante",       label: "Faltantes" },
      { id: "vidrio_roto",           label: "Rotos" },
      { id: "vidrio_fisurado",       label: "Fisurados" },
    ],
  },
  {
    id: "paneles",
    label: "Paneles",
    opciones: [
      { id: "panel_faltante",        label: "Faltantes" },
      { id: "panel_fisurado",        label: "Fisurados" },
      { id: "panel_soporte",         label: "Mal estado de soportes" },
    ],
  },
  {
    id: "optico",
    label: "Óptico",
    opciones: [
      { id: "optico_deteriorado",    label: "Deteriorado" },
    ],
  },
  {
    id: "caracteristica_diurna",
    label: "Característica diurna",
    opciones: [
      { id: "cd_faltante",           label: "Faltantes" },
      { id: "cd_pintura",            label: "Pintura deteriorada" },
    ],
  },
  {
    id: "caracteristica_nocturna",
    label: "Característica nocturna",
    opciones: [
      { id: "cn_caracteristica",     label: "Característica" },
      { id: "cn_lampara",            label: "Lámpara" },
      { id: "cn_plaqueta",           label: "Plaqueta" },
      { id: "cn_fotocelula",         label: "Fotocélula" },
      { id: "cn_estanquidad",        label: "Estanquidad" },
    ],
  },
  {
    id: "estructura",
    label: "Estructura",
    opciones: [
      { id: "est_corroida",          label: "Corroída" },
      { id: "est_base_superior",     label: "Faltantes en base superior" },
      { id: "est_base_inferior",     label: "Base inferior" },
      { id: "est_filtraciones",      label: "Filtraciones" },
      { id: "est_fisurada",          label: "Fisurada" },
    ],
  },
];

export const CATEGORIAS_MAP = Object.fromEntries(
  CATEGORIAS_NOVEDADES.map((c) => [c.id, c])
);
