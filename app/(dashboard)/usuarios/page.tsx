"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Perfil } from "@/types";

const ROL_LABEL: Record<string, string> = {
  administrador:      "Administrador",
  inspector_regional: "Inspector Regional",
  encargado_estacion: "Encargado de Estación",
  observador:         "Observador",
};

const ROL_COLOR: Record<string, string> = {
  administrador:      "bg-[#4a9edd]/20 text-[#4a9edd] border-[#4a9edd]/30",
  inspector_regional: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  encargado_estacion: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  observador:         "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(true);
  const [miRol, setMiRol] = useState<string>("");

  useEffect(() => {
    Promise.all([
      fetch("/api/usuarios").then((r) => r.json()),
      fetch("/api/me").then((r) => r.json()),
    ]).then(([uRes, meRes]) => {
      setUsuarios(uRes.data ?? []);
      setMiRol(meRes.data?.rol ?? "");
      setCargando(false);
    });
  }, []);

  const esGestor = miRol === "administrador" || miRol === "encargado_estacion";
  const esAdmin  = miRol === "administrador";

  function puedeEditar(u: Perfil) {
    if (!esGestor) return false;
    if (!esAdmin && u.rol === "administrador") return false;
    return true;
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-sm font-semibold tracking-wider text-slate-200 uppercase">Usuarios</h1>
          <p className="text-xs text-slate-500 mt-0.5">Gestión de accesos y roles del sistema</p>
        </div>
        {esGestor && (
          <Link href="/usuarios/nuevo">
            <Button><Plus className="h-4 w-4" /> Nuevo usuario</Button>
          </Link>
        )}
      </div>

      <div className="rounded-lg border border-[#243d57] overflow-hidden">
        {cargando ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-500">Cargando...</div>
        ) : usuarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <p className="text-sm text-slate-500">No hay usuarios registrados</p>
            {esGestor && (
              <Link href="/usuarios/nuevo" className="text-xs text-[#4a9edd] hover:underline mt-1">+ Agregar el primero</Link>
            )}
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-[#1d3045]">
              <tr>
                {["Nombre", "Email", "Rol", "Estado", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1d3045]">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-[#1d3045]/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-200">{u.nombre} {u.apellido}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROL_COLOR[u.rol] ?? ""}`}>
                      {ROL_LABEL[u.rol] ?? u.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${u.activo ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-500/20 text-slate-400 border-slate-500/30"}`}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {puedeEditar(u) && (
                      <Link href={`/usuarios/${u.id}/editar`} className="rounded p-1.5 text-slate-500 hover:bg-[#243d57] hover:text-slate-200 transition-colors inline-flex">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
