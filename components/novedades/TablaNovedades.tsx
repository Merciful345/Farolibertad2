"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { PrioridadBadge } from "./PrioridadBadge";
import { EstadoNovedadBadge } from "./EstadoNovedadBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { AlertCircle } from "lucide-react";
import { formatFechaHora } from "@/lib/utils";
import type { Novedad } from "@/types";

interface TablaNovedadesProps {
  novedades: Novedad[];
}

export function TablaNovedades({ novedades }: TablaNovedadesProps) {
  if (novedades.length === 0) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No hay novedades registradas"
        description="Cuando se registren problemas aparecerán aquí"
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Señal</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Categoría</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Prioridad</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Reportado por</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Fecha</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {novedades.map((novedad) => (
            <tr key={novedad.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">
                {novedad.senal?.nombre ?? novedad.senal_id}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {novedad.categoria?.label ?? "—"}
              </td>
              <td className="px-4 py-3">
                <PrioridadBadge prioridad={novedad.prioridad} />
              </td>
              <td className="px-4 py-3">
                <EstadoNovedadBadge estado={novedad.estado} />
              </td>
              <td className="px-4 py-3 text-gray-600">
                {novedad.reportado_por
                  ? `${novedad.reportado_por.nombre} ${novedad.reportado_por.apellido}`
                  : "—"}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {formatFechaHora(novedad.fecha_reporte)}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <Link
                    href={`/novedades/${novedad.id}`}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    title="Ver detalle"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
