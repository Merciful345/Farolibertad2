"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, AlertCircle, Clock, ArrowRight } from "lucide-react";
import { cn, formatRelativo } from "@/lib/utils";
import type { Novedad } from "@/types";

const PRIORIDAD_DOT: Record<string, string> = {
  critica: "bg-red-400",
  alta:    "bg-orange-400",
  media:   "bg-amber-400",
  baja:    "bg-slate-400",
};

const ESTADO_COLOR: Record<string, string> = {
  pendiente: "text-orange-400",
  en_curso:  "text-[#4a9edd]",
};

export function BellButton() {
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [open, setOpen]           = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch pending novedades once on mount
  useEffect(() => {
    fetch("/api/novedades?activas=true")
      .then((r) => r.json())
      .then((j) => setNovedades((j.data ?? []).slice(0, 5)));
  }, []);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const count    = novedades.length;
  const criticas = novedades.filter((n) => n.prioridad === "critica").length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative rounded-md p-1.5 transition-colors",
          open
            ? "text-[#4a9edd] bg-[#4a9edd]/15"
            : "text-slate-400 hover:bg-[#1d3045] hover:text-[#4a9edd]"
        )}
        title="Avisos activos"
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className={cn(
            "absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white",
            criticas > 0 ? "bg-red-500" : "bg-[#4a9edd]"
          )}>
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-80 rounded-lg border border-[#243d57] bg-[#162233] shadow-2xl shadow-black/40 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#243d57]">
            <div className="flex items-center gap-2">
              <Bell className="h-3.5 w-3.5 text-[#4a9edd]" />
              <span className="text-xs font-semibold text-slate-300">Avisos activos</span>
            </div>
            {criticas > 0 && (
              <span className="flex items-center gap-1 text-xs text-red-400">
                <AlertCircle className="h-3 w-3" />
                {criticas} crítico{criticas > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* List */}
          {novedades.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <Clock className="h-6 w-6 text-slate-700" />
              <p className="text-xs text-slate-500">Sin avisos activos</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1d3045]">
              {novedades.map((n) => (
                <Link
                  key={n.id}
                  href={`/novedades/${n.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-[#1d3045]/50 transition-colors"
                >
                  <div className={cn("h-2 w-2 rounded-full shrink-0 mt-1.5", PRIORIDAD_DOT[n.prioridad] ?? "bg-slate-400")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200 truncate font-medium">
                      {n.senal?.nombre ?? "—"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{n.categoria?.label ?? "—"}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{formatRelativo(n.fecha_reporte)}</p>
                  </div>
                  <span className={cn("text-xs font-medium shrink-0", ESTADO_COLOR[n.estado] ?? "text-slate-400")}>
                    {n.estado === "pendiente" ? "Pendiente" : "En curso"}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-[#243d57] px-4 py-2.5">
            <Link
              href="/novedades"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between text-xs text-slate-500 hover:text-[#4a9edd] transition-colors"
            >
              Ver todos los avisos
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
