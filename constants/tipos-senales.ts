import type { TipoSenal } from "@/types";

export interface TipoSenalConfig {
  label: string;
  labelPlural: string;
  icono: string;
  color: string;   // dark theme badge classes
}

export const TIPOS_SENAL: Record<TipoSenal, TipoSenalConfig> = {
  faro: {
    label: "Faro",
    labelPlural: "Faros",
    icono: "Anchor",
    color: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
  },
  boya: {
    label: "Boya",
    labelPlural: "Boyas",
    icono: "Waves",
    color: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
  },
  baliza: {
    label: "Baliza",
    labelPlural: "Balizas",
    icono: "Navigation",
    color: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
  },
};

export const PROVINCIAS_MARITIMAS = [
  "Buenos Aires",
  "Río Negro",
  "Chubut",
  "Santa Cruz",
  "Tierra del Fuego",
  "Entre Ríos",
  "Corrientes",
  "Misiones",
  "Formosa",
  "Chaco",
];
