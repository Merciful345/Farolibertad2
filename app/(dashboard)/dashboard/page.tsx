"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Radio, AlertCircle, CheckCircle2, WifiOff, ArrowRight, Anchor, Waves, Navigation } from "lucide-react";
import type { Senal, Novedad } from "@/types";
import { cn, formatRelativo } from "@/lib/utils";

const ESTADO_NOV_COLOR: Record<string, string> = {
  pendiente: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  en_curso:  "bg-[#4a9edd]/20 text-[#4a9edd] border-[#4a9edd]/30",
};
const ESTADO_NOV_LABEL: Record<string, string> = {
  pendiente: "Pendiente", en_curso: "En curso",
};

export default function DashboardPage() {
  const [senales,   setSenales]   = useState<Senal[]>([]);
  const [novedades, setNovedades] = useState<Novedad[]>([]);

  useEffect(() => {
    fetch("/api/senales").then((r) => r.json()).then((d) => setSenales(d.data ?? []));
    fetch("/api/novedades?activas=true").then((r) => r.json()).then((d) => setNovedades(d.data ?? []));
  }, []);

  const enServicio  = senales.filter((s) => s.estado?.nombre === "en_servicio").length;
  const sinServicio = senales.filter((s) => s.estado?.nombre === "sin_servicio").length;
  const faros   = senales.filter((s) => s.categoria?.nombre === "faro").length;
  const boyas   = senales.filter((s) => s.categoria?.nombre === "boya").length;
  const balizas = senales.filter((s) => s.categoria?.nombre === "baliza").length;

  const criticas = novedades.filter((n) => n.prioridad === "critica").length;
  const altas    = novedades.filter((n) => n.prioridad === "alta").length;
  const medias   = novedades.filter((n) => n.prioridad === "media").length;
  const bajas    = novedades.filter((n) => n.prioridad === "baja").length;

  const stats = [
    { label: "Señales totales",  valor: senales.length   || "—", sub: "Faros, boyas y balizas",     icon: Radio,        color: "text-[#4a9edd]",    border: "border-[#4a9edd]/30" },
    { label: "En servicio",      valor: senales.length ? enServicio  : "—", sub: "Operando con normalidad",    icon: CheckCircle2, color: "text-emerald-400",  border: "border-emerald-400/30" },
    { label: "Sin servicio",     valor: senales.length ? sinServicio : "—", sub: "Requieren atención urgente", icon: WifiOff,      color: "text-red-400",      border: "border-red-400/30" },
    { label: "Avisos activos",   valor: novedades.length || "—", sub: "Pendientes o en curso",      icon: AlertCircle,  color: "text-amber-400",    border: "border-amber-400/30" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`rounded-lg border ${stat.border} bg-[#162233] px-5 py-4`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className={`text-3xl font-bold font-mono ${stat.color}`}>{stat.valor}</p>
              <p className="mt-1 text-xs text-slate-500">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Breakdown row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Senales por tipo */}
        <div className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider">Señales por tipo</p>
            <Link href="/senales" className="text-xs text-slate-500 hover:text-[#4a9edd] transition-colors">Ver todas →</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Faros",   valor: faros,   icon: Anchor,     href: "/senales?tipo=faro",   color: "text-indigo-400" },
              { label: "Boyas",   valor: boyas,   icon: Waves,      href: "/senales?tipo=boya",   color: "text-cyan-400" },
              { label: "Balizas", valor: balizas, icon: Navigation, href: "/senales?tipo=baliza", color: "text-violet-400" },
            ].map(({ label, valor, icon: Icon, href, color }) => (
              <Link key={label} href={href}
                className="flex flex-col items-center gap-2 rounded-lg border border-[#243d57] bg-[#0f1923] py-4 hover:border-[#4a9edd]/30 hover:bg-[#1d3045] transition-colors">
                <Icon className={cn("h-5 w-5", color)} />
                <span className="font-mono text-lg font-bold text-slate-200">{senales.length ? valor : "—"}</span>
                <span className="text-xs text-slate-500">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Novedades por prioridad */}
        <div className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider">Avisos por prioridad</p>
            <Link href="/novedades" className="text-xs text-slate-500 hover:text-[#4a9edd] transition-colors">Ver todos →</Link>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: "Crítica", valor: criticas, dot: "bg-red-400",    bar: "bg-red-400" },
              { label: "Alta",    valor: altas,    dot: "bg-orange-400", bar: "bg-orange-400" },
              { label: "Media",   valor: medias,   dot: "bg-amber-400",  bar: "bg-amber-400" },
              { label: "Baja",    valor: bajas,    dot: "bg-slate-400",  bar: "bg-slate-500" },
            ].map(({ label, valor, dot, bar }) => {
              const pct = novedades.length ? Math.round((valor / novedades.length) * 100) : 0;
              return (
                <div key={label} className="flex items-center gap-3">
                  <div className={cn("h-2 w-2 rounded-full shrink-0", dot)} />
                  <span className="text-xs text-slate-400 w-12">{label}</span>
                  <div className="flex-1 rounded-full bg-[#1d3045] h-1.5 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all opacity-60", bar)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-slate-300 w-4 text-right">
                    {novedades.length ? valor : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Map shortcut */}
      <div className="rounded-lg border border-[#243d57] bg-[#162233] p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider">Estado geográfico — costa argentina</p>
          <Link href="/mapa" className="flex items-center gap-1 text-xs text-[#4a9edd] hover:underline">
            Abrir mapa <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <Link href="/mapa" className="flex h-24 flex-col items-center justify-center gap-2 rounded border border-dashed border-[#243d57] text-sm text-slate-500 hover:border-[#4a9edd]/40 hover:text-[#4a9edd] transition-colors">
          Ver mapa interactivo
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      {/* Recent novedades */}
      <div className="rounded-lg border border-[#243d57] bg-[#162233] p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider">Últimos Avisos / Novedades</p>
          <Link href="/novedades" className="flex items-center gap-1 text-xs text-[#4a9edd] hover:underline">
            Ver todos <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {novedades.length === 0 ? (
          <div className="flex h-20 items-center justify-center rounded border border-dashed border-[#243d57] text-sm text-slate-500">
            Sin novedades activas
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#1d3045]">
            {novedades.slice(0, 6).map((nov) => (
              <Link key={nov.id} href={`/novedades/${nov.id}`}
                className="flex items-center gap-3 py-2.5 -mx-4 px-4 hover:bg-[#1d3045]/30 transition-colors">
                <div className={cn("h-2 w-2 rounded-full shrink-0", {
                  "bg-red-400":    nov.prioridad === "critica",
                  "bg-orange-400": nov.prioridad === "alta",
                  "bg-amber-400":  nov.prioridad === "media",
                  "bg-slate-400":  nov.prioridad === "baja",
                })} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{nov.senal?.nombre ?? "—"}</p>
                  <p className="text-xs text-slate-500 truncate">{nov.categoria?.label ?? "—"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-600 hidden sm:block">{formatRelativo(nov.fecha_reporte)}</span>
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", ESTADO_NOV_COLOR[nov.estado] ?? "")}>
                    {ESTADO_NOV_LABEL[nov.estado] ?? nov.estado}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
