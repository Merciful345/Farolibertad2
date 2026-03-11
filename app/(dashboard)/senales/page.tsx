"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Eye, Pencil, Anchor, Waves, Navigation } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Senal } from "@/types";

const TIPOS = [
  { id: "faro",   label: "Faros",   icon: Anchor,     activeColor: "text-indigo-400", activeBg: "bg-indigo-500/10 border-indigo-500/40" },
  { id: "boya",   label: "Boyas",   icon: Waves,      activeColor: "text-cyan-400",   activeBg: "bg-cyan-500/10 border-cyan-500/40" },
  { id: "baliza", label: "Balizas", icon: Navigation, activeColor: "text-violet-400", activeBg: "bg-violet-500/10 border-violet-500/40" },
] as const;

type TipoId = "faro" | "boya" | "baliza";

const CHART_COLORS = ["#4ade80", "#f87171", "#fb923c", "#fbbf24"];
const CHART_LABELS = ["En servicio", "Sin servicio", "Caído", "Dañado"];
const ESTADO_SLUGS = ["en_servicio", "sin_servicio", "caido", "dañado"];

function buildChart(senales: Senal[]) {
  const counts = [0, 0, 0, 0];
  for (const s of senales) {
    const i = ESTADO_SLUGS.indexOf(s.estado?.nombre ?? "");
    if (i >= 0) counts[i]++;
  }
  return counts.map((v, i) => ({ name: CHART_LABELS[i], value: v, color: CHART_COLORS[i] }));
}

function SeñalesContent() {
  const searchParams = useSearchParams();
  const initialTipo  = (searchParams.get("tipo") ?? "faro") as TipoId;

  const [tipoActivo, setTipoActivo] = useState<TipoId>(initialTipo);
  const [busqueda,   setBusqueda]   = useState("");
  const [senales,    setSenales]    = useState<Senal[]>([]);
  const [cargando,   setCargando]   = useState(false);

  const fetch_ = useCallback(async (tipo: TipoId, q: string) => {
    setCargando(true);
    const p = new URLSearchParams({ tipo });
    if (q) p.set("q", q);
    const res = await fetch(`/api/senales?${p}`);
    if (res.ok) setSenales((await res.json()).data ?? []);
    setCargando(false);
  }, []);

  useEffect(() => { fetch_(tipoActivo, ""); }, [tipoActivo, fetch_]);

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    fetch_(tipoActivo, busqueda);
  }

  const chartData   = buildChart(senales);
  const totalCero   = chartData.every((d) => d.value === 0);
  const displayData = totalCero ? [{ name: "Sin datos", value: 1, color: "#243d57" }] : chartData;
  const tipoConfig  = TIPOS.find((t) => t.id === tipoActivo)!;

  return (
    <div className="flex flex-col gap-5 p-6">

      {/* Type selector cards */}
      <div className="grid grid-cols-3 gap-3">
        {TIPOS.map(({ id, label, icon: Icon, activeColor, activeBg }) => (
          <button
            key={id}
            onClick={() => { setTipoActivo(id); setBusqueda(""); }}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border py-5 transition-all",
              tipoActivo === id ? activeBg : "border-[#243d57] bg-[#162233] hover:bg-[#1d3045]"
            )}
          >
            <Icon className={cn("h-7 w-7", tipoActivo === id ? activeColor : "text-slate-500")} />
            <span className={cn("font-mono text-xs tracking-widest uppercase", tipoActivo === id ? activeColor : "text-slate-500")}>
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Ring chart */}
      <div className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
        <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-5">
          {tipoConfig.label} — {senales.length} registradas
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="w-40 h-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={displayData} cx="50%" cy="50%" innerRadius={48} outerRadius={68} dataKey="value" paddingAngle={totalCero ? 0 : 3}>
                  {displayData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                </Pie>
                {!totalCero && (
                  <Tooltip contentStyle={{ background: "#162233", border: "1px solid #243d57", borderRadius: 8, fontSize: 12 }} itemStyle={{ color: "#e2e8f0" }} />
                )}
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 flex-1 w-full">
            {chartData.map(({ name, value, color }) => (
              <div key={name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-xs text-slate-400 flex-1">{name}</span>
                <span className="font-mono text-sm font-bold text-slate-200">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search + add */}
      <div className="flex gap-3">
        <form onSubmit={handleBuscar} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={`Buscar ${tipoConfig.label.toLowerCase()} por Número Nacional o nombre...`}
              className="w-full rounded-md border border-[#243d57] bg-[#0f1923] pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-[#4a9edd] focus:outline-none"
            />
          </div>
          <Button type="submit" variant="secondary">Buscar</Button>
        </form>
        <div className="flex gap-2">
          <Link href="/senales/masivo">
            <Button variant="secondary"><Plus className="h-4 w-4" /> Carga masiva</Button>
          </Link>
          <Link href="/senales/nueva">
            <Button><Plus className="h-4 w-4" /> Nueva señal</Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#243d57] overflow-hidden">
        {cargando ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-500">Cargando...</div>
        ) : senales.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <tipoConfig.icon className="h-8 w-8 text-slate-700" />
            <p className="text-sm text-slate-500">No se encontraron {tipoConfig.label.toLowerCase()}</p>
            <Link href="/senales/nueva" className="text-xs text-[#4a9edd] hover:underline mt-1">
              + Agregar la primera
            </Link>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-[#1d3045]">
              <tr>
                {["Nro. Nacional", "Nombre", "Estado", "Provincia", "Encargado", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1d3045]">
              {senales.map((senal) => {
                const slug  = senal.estado?.nombre ?? "";
                const label = senal.estado?.label  ?? "—";
                const cls   =
                  slug === "en_servicio"  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                  slug === "sin_servicio" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                  slug === "caido"        ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                  slug === "dañado"       ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                  "bg-slate-500/20 text-slate-400 border-slate-500/30";
                return (
                  <tr key={senal.id} className="hover:bg-[#1d3045]/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#4a9edd]">{senal.codigo}</td>
                    <td className="px-4 py-3 font-medium text-slate-200">{senal.nombre}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium", cls)}>{label}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{senal.provincia}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {senal.encargado ? `${senal.encargado.nombre} ${senal.encargado.apellido}` : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/senales/${senal.id}`} className="rounded p-1.5 text-slate-500 hover:bg-[#243d57] hover:text-slate-200 transition-colors">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link href={`/senales/${senal.id}/editar`} className="rounded p-1.5 text-slate-500 hover:bg-[#243d57] hover:text-slate-200 transition-colors">
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function SeñalesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Cargando...</div>}>
      <SeñalesContent />
    </Suspense>
  );
}
