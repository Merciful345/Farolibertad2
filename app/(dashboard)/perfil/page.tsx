"use client";

import { useState, useEffect } from "react";
import { Save, User, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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

export default function PerfilPage() {
  const [cargando, setCargando] = useState(true);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const [perfil, setPerfil] = useState({
    nombre: "", apellido: "", email: "", rol: "",
  });
  const [form, setForm] = useState({ nombre: "", apellido: "" });

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setPerfil(d.data);
          setForm({ nombre: d.data.nombre ?? "", apellido: d.data.apellido ?? "" });
        }
        setCargando(false);
      });
  }, []);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const json = await res.json();
      setPerfil((p) => ({ ...p, ...json.data }));
      setSuccess(true);
    } else {
      const json = await res.json();
      setError(json.error ?? "Error al guardar los cambios");
    }
    setLoading(false);
  }

  if (cargando) return (
    <div className="flex items-center justify-center py-24 text-sm text-slate-500">Cargando...</div>
  );

  return (
    <div className="flex flex-col gap-6 p-6 max-w-lg mx-auto w-full">

      <div>
        <h1 className="font-mono text-sm font-semibold tracking-wider text-slate-200 uppercase">Mi Perfil</h1>
        <p className="text-xs text-slate-500 mt-0.5">Tus datos en el sistema</p>
      </div>

      {/* Avatar + role */}
      <div className="flex items-center gap-4 rounded-lg border border-[#243d57] bg-[#162233] p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#243d57] shrink-0">
          <User className="h-7 w-7 text-slate-400" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-200">{perfil.nombre} {perfil.apellido}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROL_COLOR[perfil.rol] ?? ""}`}>
              {ROL_LABEL[perfil.rol] ?? perfil.rol}
            </span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
          <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-4">Datos Personales</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nombre *"
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              required
            />
            <Input
              label="Apellido *"
              value={form.apellido}
              onChange={(e) => set("apellido", e.target.value)}
              required
            />
          </div>
        </section>

        <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
          <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-4">Cuenta</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-slate-500 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm text-slate-300">{perfil.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-slate-500 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Rol en el sistema</p>
                <p className="text-sm text-slate-300">{ROL_LABEL[perfil.rol] ?? perfil.rol}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-1">El email y el rol son gestionados por un administrador.</p>
          </div>
        </section>

        {error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
        )}
        {success && (
          <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            Perfil actualizado correctamente
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" loading={loading}><Save className="h-4 w-4" /> Guardar cambios</Button>
        </div>
      </form>

    </div>
  );
}
