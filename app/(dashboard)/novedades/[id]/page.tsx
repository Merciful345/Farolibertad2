"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, PlayCircle, XCircle,
  Clock, User, MapPin, Tag, FileText, Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, formatFechaHora, formatRelativo } from "@/lib/utils";
import type { Novedad } from "@/types";

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
  pendiente: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  en_curso:  "bg-[#4a9edd]/20 text-[#4a9edd] border-[#4a9edd]/30",
  resuelta:  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelada: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};
const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente", en_curso: "En curso", resuelta: "Resuelta", cancelada: "Cancelada",
};

export default function DetalleNovedadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [novedad,       setNovedad]       = useState<Novedad | null>(null);
  const [cargando,      setCargando]      = useState(true);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [miRol,         setMiRol]         = useState<string>("");
  const [miId,          setMiId]          = useState<string>("");
  const [confirmCancel, setConfirmCancel] = useState(false);

  function reloadNovedad() {
    fetch(`/api/novedades/${id}`)
      .then((r) => r.json())
      .then((d) => setNovedad(d.data ?? null));
  }

  useEffect(() => {
    Promise.all([
      fetch(`/api/novedades/${id}`).then((r) => r.json()),
      fetch("/api/me").then((r) => r.json()),
    ]).then(([novRes, meRes]) => {
      setNovedad(novRes.data ?? null);
      setMiRol(meRes.data?.rol ?? "");
      setMiId(meRes.data?.id ?? "");
      setCargando(false);
    });
  }, [id]);

  async function cambiarEstado(nuevoEstado: string) {
    setLoading(true);
    setError(null);
    const body: Record<string, string> = { estado: nuevoEstado };
    if (nuevoEstado === "resuelta") body.fecha_resolucion = new Date().toISOString();

    const res = await fetch(`/api/novedades/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setConfirmCancel(false);
      reloadNovedad();
    } else {
      const json = await res.json();
      setError(json.error ?? "Error al actualizar el estado");
    }
    setLoading(false);
  }

  if (cargando) return (
    <div className="flex items-center justify-center py-24 text-sm text-slate-500">Cargando...</div>
  );
  if (!novedad) return (
    <div className="flex items-center justify-center py-24 text-sm text-slate-500">Novedad no encontrada</div>
  );

  const esGestor    = miRol === "administrador" || miRol === "encargado_estacion";
  const esAsignado  = novedad.asignado_a_id === miId;
  const puedeActuar = esGestor || esAsignado;
  const cerrada     = novedad.estado === "resuelta" || novedad.estado === "cancelada";

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/novedades">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Volver</Button>
          </Link>
          <div>
            <h1 className="font-mono text-sm font-semibold tracking-wider text-slate-200 uppercase">
              Detalle de Novedad
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {novedad.senal?.nombre ?? "—"} · {novedad.senal?.codigo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-medium", PRIORIDAD_COLOR[novedad.prioridad] ?? "")}>
            {PRIORIDAD_LABEL[novedad.prioridad] ?? novedad.prioridad}
          </span>
          <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-medium", ESTADO_COLOR[novedad.estado] ?? "")}>
            {ESTADO_LABEL[novedad.estado] ?? novedad.estado}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Left column */}
        <div className="flex flex-col gap-4">

          <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
            <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-4">Información</p>
            <dl className="flex flex-col gap-4">

              <div className="flex gap-3">
                <Tag className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-slate-500 mb-0.5">Categoría</dt>
                  <dd className="text-sm text-slate-200">{novedad.categoria?.label ?? "—"}</dd>
                  {novedad.opcion && (
                    <dd className="text-xs text-slate-400 mt-0.5">› {novedad.opcion.label}</dd>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-slate-500 mb-0.5">Señal afectada</dt>
                  <dd className="text-sm text-slate-200">{novedad.senal?.nombre ?? "—"}</dd>
                  <dd className="font-mono text-xs text-[#4a9edd] mt-0.5">{novedad.senal?.codigo}</dd>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-slate-500 mb-0.5">Fecha de reporte</dt>
                  <dd className="text-sm text-slate-200">{formatFechaHora(novedad.fecha_reporte)}</dd>
                  <dd className="text-xs text-slate-500 mt-0.5">{formatRelativo(novedad.fecha_reporte)}</dd>
                </div>
              </div>

              {novedad.fecha_resolucion && (
                <div className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs text-slate-500 mb-0.5">Fecha de resolución</dt>
                    <dd className="text-sm text-slate-200">{formatFechaHora(novedad.fecha_resolucion)}</dd>
                  </div>
                </div>
              )}

            </dl>
          </section>

          <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
            <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-4">Personas</p>
            <dl className="flex flex-col gap-4">

              <div className="flex gap-3">
                <User className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-slate-500 mb-0.5">Reportado por</dt>
                  <dd className="text-sm text-slate-200">
                    {novedad.reportado_por
                      ? `${novedad.reportado_por.nombre} ${novedad.reportado_por.apellido}`
                      : "—"}
                  </dd>
                </div>
              </div>

              <div className="flex gap-3">
                <User className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-slate-500 mb-0.5">Asignado a</dt>
                  <dd className="text-sm text-slate-200">
                    {novedad.asignado_a
                      ? `${novedad.asignado_a.nombre} ${novedad.asignado_a.apellido}`
                      : <span className="text-slate-500">Sin asignar</span>}
                  </dd>
                </div>
              </div>

            </dl>
          </section>

        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-slate-500" />
              <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider">Descripción</p>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {novedad.descripcion || <span className="text-slate-500">Sin descripción</span>}
            </p>
          </section>

          {/* State actions */}
          {!cerrada && puedeActuar && (
            <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
              <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-4">Acciones</p>

              {error && (
                <p className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-2">
                {novedad.estado === "pendiente" && (
                  <Button loading={loading} onClick={() => cambiarEstado("en_curso")} className="w-full justify-center">
                    <PlayCircle className="h-4 w-4" /> Iniciar atención
                  </Button>
                )}
                {novedad.estado === "en_curso" && (
                  <Button loading={loading} onClick={() => cambiarEstado("resuelta")} className="w-full justify-center">
                    <CheckCircle2 className="h-4 w-4" /> Marcar como resuelta
                  </Button>
                )}

                {confirmCancel ? (
                  <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 flex flex-col gap-2">
                    <p className="text-xs text-red-400">¿Confirmar cancelación de la novedad?</p>
                    <div className="flex gap-2">
                      <Button variant="danger" size="sm" loading={loading} onClick={() => cambiarEstado("cancelada")}>
                        Sí, cancelar
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setConfirmCancel(false)}>
                        No
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="secondary" onClick={() => setConfirmCancel(true)} className="w-full justify-center">
                    <XCircle className="h-4 w-4" /> Cancelar novedad
                  </Button>
                )}
              </div>
            </section>
          )}

          {cerrada && (
            <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
              <div className={cn(
                "flex items-center gap-2 rounded-md px-3 py-3",
                novedad.estado === "resuelta" ? "bg-emerald-500/10" : "bg-slate-700/30"
              )}>
                {novedad.estado === "resuelta"
                  ? <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  : <XCircle className="h-5 w-5 text-slate-400 shrink-0" />
                }
                <span className="text-sm text-slate-300">
                  {novedad.estado === "resuelta"
                    ? "Esta novedad fue resuelta exitosamente"
                    : "Esta novedad fue cancelada"}
                </span>
              </div>
            </section>
          )}

          {/* Edit shortcut for gestores */}
          {esGestor && !cerrada && (
            <Link href={`/novedades/nueva?edit=${novedad.id}`} className="text-xs text-slate-500 hover:text-[#4a9edd] flex items-center gap-1 self-end transition-colors">
              <Pencil className="h-3 w-3" /> Editar detalles
            </Link>
          )}

        </div>
      </div>
    </div>
  );
}
