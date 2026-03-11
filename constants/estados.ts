import type { EstadoSenalSlug, EstadoNovedad, PrioridadNovedad } from "@/types";

export interface EstadoConfig {
  label: string;
  color: string;       // Tailwind classes for badge (dark theme)
  colorMapa: string;   // Hex for map markers
}

export const ESTADOS_SENAL: Record<EstadoSenalSlug, EstadoConfig> = {
  en_servicio: {
    label: "En servicio",
    color: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    colorMapa: "#4ade80",
  },
  sin_servicio: {
    label: "Sin servicio",
    color: "bg-red-500/20 text-red-400 border border-red-500/30",
    colorMapa: "#f87171",
  },
  caido: {
    label: "Caído",
    color: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    colorMapa: "#fb923c",
  },
  dañado: {
    label: "Dañado",
    color: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    colorMapa: "#fbbf24",
  },
};

export const ESTADOS_NOVEDAD: Record<EstadoNovedad, EstadoConfig> = {
  pendiente: {
    label: "Pendiente",
    color: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    colorMapa: "#fb923c",
  },
  en_curso: {
    label: "En curso",
    color: "bg-[#4a9edd]/20 text-[#4a9edd] border border-[#4a9edd]/30",
    colorMapa: "#4a9edd",
  },
  resuelta: {
    label: "Resuelta",
    color: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    colorMapa: "#4ade80",
  },
  cancelada: {
    label: "Cancelada",
    color: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
    colorMapa: "#64748b",
  },
};

export const PRIORIDADES_NOVEDAD: Record<PrioridadNovedad, EstadoConfig> = {
  critica: {
    label: "Crítica",
    color: "bg-red-500/20 text-red-400 border border-red-500/30 font-semibold",
    colorMapa: "#f87171",
  },
  alta: {
    label: "Alta",
    color: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    colorMapa: "#fb923c",
  },
  media: {
    label: "Media",
    color: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    colorMapa: "#fbbf24",
  },
  baja: {
    label: "Baja",
    color: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
    colorMapa: "#94a3b8",
  },
};
