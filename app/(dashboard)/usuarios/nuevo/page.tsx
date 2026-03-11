"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const ROLES = [
  { value: "administrador",       label: "Administrador" },
  { value: "inspector_regional",  label: "Inspector Regional" },
  { value: "encargado_estacion",  label: "Encargado de Estación" },
  { value: "observador",          label: "Observador" },
];

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const [loading, setLoading]  = useState(false);
  const [error,   setError]    = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", rol: "encargado_estacion",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, activo: true }),
    });

    if (res.ok) {
      router.push("/usuarios");
    } else {
      const json = await res.json();
      setError(json.error ?? "Error al crear el usuario");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-xl mx-auto w-full">

      <div className="flex items-center gap-4">
        <Link href="/usuarios">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Volver</Button>
        </Link>
        <div>
          <h1 className="font-mono text-sm font-semibold tracking-wider text-slate-200 uppercase">Nuevo Usuario</h1>
          <p className="text-xs text-slate-500 mt-0.5">Crear perfil de acceso al sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
          <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-4">Datos del Usuario</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nombre *" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Juan" required />
            <Input label="Apellido *" value={form.apellido} onChange={(e) => set("apellido", e.target.value)} placeholder="García" required />
            <div className="sm:col-span-2">
              <Input label="Email *" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="juan@ejemplo.com" required />
            </div>
            <div className="sm:col-span-2">
              <Select label="Rol *" value={form.rol} onChange={(e) => set("rol", e.target.value)} options={ROLES} required />
            </div>
          </div>
        </section>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs text-amber-400">
            <strong>Nota:</strong> El perfil se crea manualmente aquí. Para que el usuario pueda
            iniciar sesión debe registrarse en el sistema con este mismo email y el perfil se vinculará automáticamente.
          </p>
        </div>

        {error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link href="/usuarios"><Button variant="secondary" type="button">Cancelar</Button></Link>
          <Button type="submit" loading={loading}><Save className="h-4 w-4" /> Crear usuario</Button>
        </div>
      </form>
    </div>
  );
}
