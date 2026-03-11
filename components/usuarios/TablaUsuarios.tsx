"use client";

import { Pencil, UserX } from "lucide-react";
import { RolBadge } from "./RolBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users } from "lucide-react";
import { formatFecha } from "@/lib/utils";
import type { Usuario } from "@/types";

interface TablaUsuariosProps {
  usuarios: Usuario[];
  onEditar?: (usuario: Usuario) => void;
  onDesactivar?: (usuario: Usuario) => void;
}

export function TablaUsuarios({ usuarios, onEditar, onDesactivar }: TablaUsuariosProps) {
  if (usuarios.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No hay usuarios registrados"
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Rol</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Alta</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {usuarios.map((usuario) => (
            <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">
                {usuario.nombre} {usuario.apellido}
              </td>
              <td className="px-4 py-3 text-gray-600">{usuario.email}</td>
              <td className="px-4 py-3">
                <RolBadge rol={usuario.rol} />
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    usuario.activo
                      ? "text-green-700 font-medium"
                      : "text-gray-400"
                  }
                >
                  {usuario.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">{formatFecha(usuario.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  {onEditar && (
                    <button
                      onClick={() => onEditar(usuario)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {onDesactivar && (
                    <button
                      onClick={() => onDesactivar(usuario)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Desactivar"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
