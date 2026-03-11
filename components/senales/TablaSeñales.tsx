"use client";

import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { EstadoBadge } from "./EstadoBadge";
import { TipoSenalBadge } from "./TipoSenalBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Radio } from "lucide-react";
import type { Senal } from "@/types";

interface TablaSeñalesProps {
  senales: Senal[];
}

export function TablaSeñales({ senales }: TablaSeñalesProps) {
  if (senales.length === 0) {
    return (
      <EmptyState
        icon={Radio}
        title="No se encontraron señales"
        description="Ajustá los filtros o agregá una nueva señal"
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Código</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Tipo</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Provincia</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Encargado</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {senales.map((senal) => (
            <tr key={senal.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-gray-500">{senal.codigo}</td>
              <td className="px-4 py-3 font-medium text-gray-900">{senal.nombre}</td>
              <td className="px-4 py-3">
                <TipoSenalBadge tipo={senal.tipo} />
              </td>
              <td className="px-4 py-3">
                <EstadoBadge estado={senal.estado} />
              </td>
              <td className="px-4 py-3 text-gray-600">{senal.provincia}</td>
              <td className="px-4 py-3 text-gray-600">
                {senal.encargado
                  ? `${senal.encargado.nombre} ${senal.encargado.apellido}`
                  : <span className="text-gray-400 italic">Sin asignar</span>}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/senales/${senal.id}`}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    title="Ver detalle"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/senales/${senal.id}/editar`}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
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
