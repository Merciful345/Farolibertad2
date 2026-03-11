"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Pencil, MapPin, Zap, Eye, Plus,
  AlertCircle, Calendar, Ruler, Radio, FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, formatFecha, formatFechaHora, formatRelativo } from "@/lib/utils";
import type { Senal, Novedad } from "@/types";

const ESTADO_COLOR: Record<string, string> = {
  en_servicio:  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  sin_servicio: "bg-red-500/20 text-red-400 border-red-500/30",
  caido:        "bg-orange-500/20 text-orange-400 border-orange-500/30",
  dañado:       "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const PRIORIDAD_DOT: Record<string, string> = {
  critica: "bg-red-400",
  alta:    "bg-orange-400",
  media:   "bg-amber-400",
  baja:    "bg-slate-400",
};

const ESTADO_NOV_COLOR: Record<string, string> = {
  pendiente: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  en_curso:  "bg-[#4a9edd]/20 text-[#4a9edd] border-[#4a9edd]/30",
  resuelta:  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelada: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};
const ESTADO_NOV_LABEL: Record<string, string> = {
  pendiente: "Pendiente", en_curso: "En curso", resuelta: "Resuelta", cancelada: "Cancelada",
};

function Campo({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <dt className="text-xs text-slate-500 mb-0.5">{label}</dt>
      <dd className="text-sm text-slate-200">{value}</dd>
    </div>
  );
}

export default function DetalleSenalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [senal,    setSenal]    = useState<Senal | null>(null);
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/senales/${id}`).then((r) => r.json()),
      fetch(`/api/novedades?senal_id=${id}&activas=true`).then((r) => r.json()),
    ]).then(([senRes, novRes]) => {
      setSenal(senRes.data ?? null);
      setNovedades(novRes.data ?? []);
      setCargando(false);
    });
  }, [id]);

  if (cargando) return (
    <div className="flex items-center justify-center py-24 text-sm text-slate-500">Cargando...</div>
  );
  if (!senal) return (
    <div className="flex items-center justify-center py-24 text-sm text-slate-500">Señal no encontrada</div>
  );

  const estadoSlug = senal.estado?.nombre ?? "";
  const tipoLabel  = senal.categoria?.label ?? "—";

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/senales">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Volver</Button>
          </Link>
          <div>
            <h1 className="font-mono text-sm font-semibold tracking-wider text-slate-200 uppercase">
              {senal.nombre}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs text-[#4a9edd]">{senal.codigo}</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-500">{tipoLabel}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-medium", ESTADO_COLOR[estadoSlug] ?? "bg-slate-500/20 text-slate-400 border-slate-500/30")}>
            {senal.estado?.label ?? "—"}
          </span>
          <Link href={`/reportes?ficha=${senal.id}`}>
            <Button variant="secondary" size="sm"><FileDown className="h-4 w-4" /> Ficha PDF</Button>
          </Link>
          <Link href={`/senales/${senal.id}/editar`}>
            <Button variant="secondary" size="sm"><Pencil className="h-4 w-4" /> Editar</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left: General info */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
            <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-4">Datos Generales</p>
            <dl className="grid grid-cols-2 gap-4">
              <Campo label="Tipo"       value={tipoLabel} />
              <Campo label="Provincia"  value={senal.provincia} />
              <div className="col-span-2">
                <Campo label="Ubicación" value={senal.ubicacion_descripcion} />
              </div>
              <Campo label="Encargado" value={senal.encargado ? `${senal.encargado.nombre} ${senal.encargado.apellido}` : "—"} />
              <Campo label="Año de instalación" value={senal.año_instalacion} />
              {senal.ultima_revision && (
                <Campo label="Última revisión" value={formatFecha(senal.ultima_revision)} />
              )}
              {senal.lat && senal.lng && (
                <div>
                  <dt className="text-xs text-slate-500 mb-0.5">Coordenadas</dt>
                  <dd className="font-mono text-sm text-slate-300">
                    {senal.lat.toFixed(5)}, {senal.lng.toFixed(5)}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* Technical data */}
          {(senal.altura_focal || senal.alcance_luminoso || senal.caracteristica_luz || senal.color_luz || senal.tipo_estructura) && (
            <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
              <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-4">Datos Técnicos</p>
              <dl className="grid grid-cols-2 gap-4">
                <Campo label="Altura focal (m)"   value={senal.altura_focal} />
                <Campo label="Alcance luminoso (MN)" value={senal.alcance_luminoso} />
                <Campo label="Característica de luz" value={senal.caracteristica_luz} />
                <Campo label="Color de luz"          value={senal.color_luz} />
                <Campo label="Tipo de estructura"    value={senal.tipo_estructura} />
              </dl>
            </section>
          )}

          {/* Observations */}
          {senal.observaciones && (
            <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
              <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-3">Observaciones</p>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{senal.observaciones}</p>
            </section>
          )}

        </div>

        {/* Right: Active novedades */}
        <div className="flex flex-col gap-4">
          <section className="rounded-lg border border-[#243d57] bg-[#162233] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#243d57] flex items-center justify-between">
              <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider">Avisos Activos</p>
              <Link href={`/novedades/nueva?senal=${senal.id}`}>
                <button className="text-xs text-slate-500 hover:text-[#4a9edd] flex items-center gap-1 transition-colors">
                  <Plus className="h-3 w-3" /> Nuevo
                </button>
              </Link>
            </div>

            {novedades.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10">
                <AlertCircle className="h-6 w-6 text-slate-700" />
                <p className="text-xs text-slate-500">Sin avisos activos</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1d3045]">
                {novedades.map((nov) => (
                  <Link
                    key={nov.id}
                    href={`/novedades/${nov.id}`}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-[#1d3045]/40 transition-colors"
                  >
                    <div className={cn("h-2 w-2 rounded-full shrink-0 mt-1.5", PRIORIDAD_DOT[nov.prioridad] ?? "bg-slate-400")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 truncate">{nov.categoria?.label ?? "—"}</p>
                      {nov.opcion && <p className="text-xs text-slate-500 truncate">› {nov.opcion.label}</p>}
                      <p className="text-xs text-slate-600 mt-1">{formatRelativo(nov.fecha_reporte)}</p>
                    </div>
                    <span className={cn("inline-flex rounded-full border px-1.5 py-0.5 text-xs font-medium shrink-0", ESTADO_NOV_COLOR[nov.estado] ?? "")}>
                      {ESTADO_NOV_LABEL[nov.estado]}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {novedades.length > 0 && (
              <div className="px-4 py-2.5 border-t border-[#243d57]">
                <Link href={`/novedades?senal_id=${senal.id}`} className="text-xs text-slate-500 hover:text-[#4a9edd] transition-colors">
                  Ver historial completo →
                </Link>
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  );
}
