"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Pencil, X } from "lucide-react";
import type { Senal } from "@/types";

// Leaflet requires browser APIs — load client-side only
const MapaSeñales = dynamic(
  () => import("@/components/mapa/MapaSeñales").then((m) => m.MapaSeñales),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-sm text-slate-500">Cargando mapa...</div> }
);

const ESTADO_COLOR: Record<string, string> = {
  en_servicio:  "#4ade80",
  sin_servicio: "#f87171",
  caido:        "#fb923c",
  dañado:       "#fbbf24",
};

const ESTADO_LABEL: Record<string, string> = {
  en_servicio: "En servicio", sin_servicio: "Sin servicio", caido: "Caído", dañado: "Dañado",
};

export default function MapaPage() {
  const [senales,      setSenales]      = useState<Senal[]>([]);
  const [seleccionada, setSeleccionada] = useState<Senal | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");

  useEffect(() => {
    fetch("/api/senales")
      .then((r) => r.json())
      .then((d) => setSenales(d.data ?? []));
  }, []);

  const senalesFiltradas = filtroEstado === "todos"
    ? senales
    : senales.filter((s) => s.estado?.nombre === filtroEstado);

  const stats = Object.fromEntries(
    Object.keys(ESTADO_COLOR).map((slug) => [slug, senales.filter((s) => s.estado?.nombre === slug).length])
  );

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 56px)" }}>

      {/* Leaflet CSS */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#243d57] bg-[#162233] px-5 py-3 shrink-0">
        <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider">
          Mapa — Costa Argentina · {senalesFiltradas.length} señales visibles
        </p>
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setFiltroEstado("todos")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${filtroEstado === "todos" ? "bg-[#4a9edd]/20 text-[#4a9edd]" : "text-slate-400 hover:text-slate-200"}`}
          >
            Todos ({senales.length})
          </button>
          {Object.entries(stats).map(([slug, count]) => (
            <button
              key={slug}
              onClick={() => setFiltroEstado(slug)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${filtroEstado === slug ? "bg-[#4a9edd]/20 text-[#4a9edd]" : "text-slate-400 hover:text-slate-200"}`}
            >
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: ESTADO_COLOR[slug] }} />
              {ESTADO_LABEL[slug]} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1 min-h-0">
        <MapaSeñales senales={senalesFiltradas} onMarkerClick={setSeleccionada} />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-[#243d57] bg-[#162233]/95 backdrop-blur-sm p-3 text-xs pointer-events-none">
          <p className="font-mono text-[10px] text-[#4a9edd] uppercase tracking-wider mb-2">Estado</p>
          {Object.entries(ESTADO_LABEL).map(([slug, label]) => (
            <div key={slug} className="flex items-center gap-2 mb-1 last:mb-0">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: ESTADO_COLOR[slug] }} />
              <span className="text-slate-300">{label}</span>
            </div>
          ))}
        </div>

        {/* Selected signal card */}
        {seleccionada && (
          <div className="absolute top-4 right-4 z-[1000] w-64 rounded-lg border border-[#243d57] bg-[#162233]/95 backdrop-blur-sm p-4 shadow-xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-slate-200 text-sm leading-tight">{seleccionada.nombre}</p>
                <p className="font-mono text-xs text-[#4a9edd] mt-0.5">{seleccionada.codigo}</p>
              </div>
              <button onClick={() => setSeleccionada(null)} className="text-slate-500 hover:text-slate-200 transition-colors ml-2 shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-500">Tipo</dt>
                <dd className="text-slate-300">{seleccionada.categoria?.label ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Provincia</dt>
                <dd className="text-slate-300">{seleccionada.provincia ?? "—"}</dd>
              </div>
              {seleccionada.encargado && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Encargado</dt>
                  <dd className="text-slate-300">{seleccionada.encargado.nombre} {seleccionada.encargado.apellido}</dd>
                </div>
              )}
              {seleccionada.altura_focal && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Altura focal</dt>
                  <dd className="text-slate-300">{seleccionada.altura_focal} m</dd>
                </div>
              )}
              {seleccionada.alcance_luminoso && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Alcance</dt>
                  <dd className="text-slate-300">{seleccionada.alcance_luminoso} mn</dd>
                </div>
              )}
            </dl>

            <div className="mt-3 pt-3 border-t border-[#243d57] flex items-center justify-between">
              <span
                className="inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium"
                style={{
                  background:  `${ESTADO_COLOR[seleccionada.estado?.nombre ?? ""] ?? "#94a3b8"}22`,
                  color:        ESTADO_COLOR[seleccionada.estado?.nombre ?? ""] ?? "#94a3b8",
                  borderColor: `${ESTADO_COLOR[seleccionada.estado?.nombre ?? ""] ?? "#94a3b8"}44`,
                }}
              >
                {seleccionada.estado?.label ?? "—"}
              </span>
              <Link href={`/senales/${seleccionada.id}/editar`} className="flex items-center gap-1 text-xs text-[#4a9edd] hover:underline">
                <Pencil className="h-3 w-3" /> Editar
              </Link>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
