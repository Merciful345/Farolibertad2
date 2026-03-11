"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, ChevronDown, Eye, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CATEGORIAS_NOVEDADES } from "@/constants/categorias-novedades";
import { cn, formatFechaHora } from "@/lib/utils";
import type { Novedad } from "@/types";

const ESTADO_TABS = [
  { id: "activas",   label: "Activas",   desc: "Pendientes y en curso" },
  { id: "inactivas", label: "Inactivas", desc: "Resueltas y canceladas" },
];

const PRIORIDAD_COLOR: Record<string, string> = {
  critica: "bg-red-500/20 text-red-400 border-red-500/30",
  alta:    "bg-orange-500/20 text-orange-400 border-orange-500/30",
  media:   "bg-amber-500/20 text-amber-400 border-amber-500/30",
  baja:    "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const PRIORIDAD_LABEL: Record<string, string> = {
  critica: "Crítica", alta: "Alta", media: "Media", baja: "Baja",
};

const ESTADO_COLOR: Record<string, string> = {
  pendiente:  "bg-orange-500/20 text-orange-400 border-orange-500/30",
  en_curso:   "bg-[#4a9edd]/20 text-[#4a9edd] border-[#4a9edd]/30",
  resuelta:   "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelada:  "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente", en_curso: "En curso", resuelta: "Resuelta", cancelada: "Cancelada",
};

export default function NovedadesPage() {
  const [tabActivo,     setTabActivo]     = useState<"activas" | "inactivas">("activas");
  const [categoriaOpen, setCategoriaOpen] = useState<string | null>(null);
  const [catFiltro,     setCatFiltro]     = useState<string | null>(null);
  const [opcionFiltro,  setOpcionFiltro]  = useState<string | null>(null);
  const [novedades,     setNovedades]     = useState<Novedad[]>([]);
  const [cargando,      setCargando]      = useState(false);

  const fetchNovedades = useCallback(async (activas: "activas" | "inactivas", cat: string | null) => {
    setCargando(true);
    const p = new URLSearchParams({ activas: activas === "activas" ? "true" : "false" });
    if (cat) p.set("categoria", cat);
    const res = await fetch(`/api/novedades?${p}`);
    if (res.ok) setNovedades((await res.json()).data ?? []);
    setCargando(false);
  }, []);

  useEffect(() => {
    fetchNovedades(tabActivo, catFiltro);
  }, [tabActivo, catFiltro, fetchNovedades]);

  function selectCategoria(id: string) {
    setCatFiltro((prev) => (prev === id ? null : id));
    setOpcionFiltro(null);
  }

  function toggleAccordion(id: string) {
    setCategoriaOpen((prev) => (prev === id ? null : id));
  }

  const novedadesFiltradas = opcionFiltro
    ? novedades.filter((n) => n.opcion?.label === opcionFiltro)
    : novedades;

  return (
    <div className="flex flex-col gap-5 p-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-sm font-semibold tracking-wider text-slate-200 uppercase">
            Avisos / Novedades
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Registro de incidencias en señales marítimas</p>
        </div>
        <Link href="/novedades/nueva">
          <Button><Plus className="h-4 w-4" /> Registrar novedad</Button>
        </Link>
      </div>

      {/* Active / Inactive tabs */}
      <div className="flex gap-1 rounded-lg border border-[#243d57] bg-[#162233] p-1 w-fit">
        {ESTADO_TABS.map(({ id, label, desc }) => (
          <button
            key={id}
            onClick={() => setTabActivo(id as "activas" | "inactivas")}
            className={cn(
              "flex flex-col items-start rounded-md px-4 py-2 transition-all text-left",
              tabActivo === id ? "bg-[#4a9edd]/20 text-[#4a9edd]" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs opacity-60">{desc}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* Category accordion (left panel) */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-[#243d57] bg-[#162233] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#243d57]">
              <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider">Categorías</p>
            </div>
            <div className="divide-y divide-[#1d3045]">
              {/* All option */}
              <button
                onClick={() => { setCatFiltro(null); setOpcionFiltro(null); }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-sm transition-colors text-left",
                  catFiltro === null ? "text-[#4a9edd] bg-[#4a9edd]/10" : "text-slate-400 hover:text-slate-200 hover:bg-[#1d3045]"
                )}
              >
                <span>Todas</span>
                <span className="font-mono text-xs text-slate-500">{novedades.length}</span>
              </button>

              {CATEGORIAS_NOVEDADES.map((cat) => {
                const count   = novedades.filter((n) => n.categoria?.nombre === cat.id || (n as unknown as { categoria: string }).categoria === cat.id).length;
                const isOpen  = categoriaOpen === cat.id;
                const isActve = catFiltro === cat.id;

                return (
                  <div key={cat.id}>
                    <button
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 text-sm transition-colors",
                        isActve ? "text-[#4a9edd] bg-[#4a9edd]/10" : "text-slate-300 hover:bg-[#1d3045]"
                      )}
                      onClick={() => { selectCategoria(cat.id); toggleAccordion(cat.id); }}
                    >
                      <span className="text-left">{cat.label}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        {count > 0 && <span className="font-mono text-xs text-slate-500">{count}</span>}
                        <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="bg-[#0f1923] divide-y divide-[#1d3045]">
                        {cat.opciones.map((op) => (
                          <button
                            key={op.id}
                            onClick={() => setOpcionFiltro((prev) => (prev === op.label ? null : op.label))}
                            className={cn(
                              "w-full text-left px-6 py-2 text-xs transition-colors",
                              opcionFiltro === op.label
                                ? "text-[#4a9edd] bg-[#4a9edd]/10"
                                : "text-slate-500 hover:text-slate-300 hover:bg-[#1d3045]"
                            )}
                          >
                            › {op.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Novedades list (right panel) */}
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-[#243d57] overflow-hidden">
            {cargando ? (
              <div className="flex items-center justify-center py-16 text-sm text-slate-500">Cargando...</div>
            ) : novedadesFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16">
                <AlertCircle className="h-8 w-8 text-slate-700" />
                <p className="text-sm text-slate-500">
                  {catFiltro
                    ? `Sin novedades en "${CATEGORIAS_NOVEDADES.find((c) => c.id === catFiltro)?.label}"`
                    : "No hay novedades registradas"}
                </p>
                <Link href="/novedades/nueva" className="text-xs text-[#4a9edd] hover:underline mt-1">
                  + Registrar la primera
                </Link>
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-[#1d3045]">
                  <tr>
                    {["Señal", "Categoría / Opción", "Prioridad", "Estado", "Fecha", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1d3045]">
                  {novedadesFiltradas.map((nov) => {
                    const catLabel = nov.categoria?.label ?? (nov as unknown as { categoria: string }).categoria ?? "—";
                    const opLabel  = nov.opcion?.label;
                    return (
                      <tr key={nov.id} className="hover:bg-[#1d3045]/40 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-200 text-xs">{nov.senal?.nombre ?? "—"}</p>
                          <p className="font-mono text-xs text-slate-500">{nov.senal?.codigo}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-300 text-xs">{catLabel}</p>
                          {opLabel && <p className="text-slate-500 text-xs mt-0.5">› {opLabel}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium", PRIORIDAD_COLOR[nov.prioridad] ?? "")}>
                            {PRIORIDAD_LABEL[nov.prioridad] ?? nov.prioridad}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium", ESTADO_COLOR[nov.estado] ?? "")}>
                            {ESTADO_LABEL[nov.estado] ?? nov.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{formatFechaHora(nov.fecha_reporte)}</td>
                        <td className="px-4 py-3">
                          <Link href={`/novedades/${nov.id}`} className="rounded p-1.5 text-slate-500 hover:bg-[#243d57] hover:text-slate-200 transition-colors inline-flex">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
