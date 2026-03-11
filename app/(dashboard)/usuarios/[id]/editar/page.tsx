"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const ROLES = [
  { value: "administrador",      label: "Administrador" },
  { value: "inspector_regional", label: "Inspector Regional" },
  { value: "encargado_estacion", label: "Encargado de Estación" },
  { value: "observador",         label: "Observador" },
];

const ESTADO_OPTS = [
  { value: "true",  label: "Activo" },
  { value: "false", label: "Inactivo" },
];

export default function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading,    setLoading]    = useState(false);
  const [cargando,   setCargando]   = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [miRol,      setMiRol]      = useState<string>("");
  const [targetRol,  setTargetRol]  = useState<string>("");

  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", rol: "observador", activo: "true",
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/usuarios/${id}`).then((r) => r.json()),
      fetch("/api/me").then((r) => r.json()),
    ]).then(([uRes, meRes]) => {
      const data = uRes.data;
      if (data) {
        setTargetRol(data.rol ?? "");
        setForm({
          nombre:   data.nombre   ?? "",
          apellido: data.apellido ?? "",
          email:    data.email    ?? "",
          rol:      data.rol      ?? "observador",
          activo:   String(data.activo ?? true),
        });
      }
      setMiRol(meRes.data?.rol ?? "");
      setCargando(false);
    });
  }, [id]);

  const esAdmin     = miRol === "administrador";
  const esEncargado = miRol === "encargado_estacion";
  const esGestor    = esAdmin || esEncargado;

  // Encargado cannot manage admins
  const sinPermiso = !esGestor || (esEncargado && targetRol === "administrador");

  // Encargado cannot assign admin role
  const rolesDisponibles = esAdmin
    ? ROLES
    : ROLES.filter((r) => r.value !== "administrador");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sinPermiso) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/usuarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre:   form.nombre,
        apellido: form.apellido,
        email:    form.email,
        rol:      form.rol,
        activo:   form.activo === "true",
      }),
    });

    if (res.ok) {
      router.push("/usuarios");
    } else {
      const json = await res.json();
      setError(json.error ?? "Error al actualizar el usuario");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (sinPermiso) return;
    setLoading(true);
    const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/usuarios");
    } else {
      const json = await res.json();
      setError(json.error ?? "Error al dar de baja el usuario");
      setLoading(false);
      setConfirmDel(false);
    }
  }

  if (cargando) {
    return <div className="flex items-center justify-center py-24 text-sm text-slate-500">Cargando...</div>;
  }

  if (sinPermiso) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <p className="text-sm text-slate-400">No tenés permiso para editar este usuario.</p>
        <Link href="/usuarios"><Button variant="secondary" size="sm"><ArrowLeft className="h-4 w-4" /> Volver</Button></Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-xl mx-auto w-full">

      <div className="flex items-center gap-4">
        <Link href="/usuarios">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Volver</Button>
        </Link>
        <div>
          <h1 className="font-mono text-sm font-semibold tracking-wider text-slate-200 uppercase">Editar Usuario</h1>
          <p className="text-xs text-slate-500 mt-0.5">{form.nombre} {form.apellido}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
          <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-4">Datos del Usuario</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nombre *" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} required />
            <Input label="Apellido *" value={form.apellido} onChange={(e) => set("apellido", e.target.value)} required />
            <div className="sm:col-span-2">
              <Input label="Email *" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
            </div>
            <Select label="Rol *" value={form.rol} onChange={(e) => set("rol", e.target.value)} options={rolesDisponibles} required />
            <Select label="Estado *" value={form.activo} onChange={(e) => set("activo", e.target.value)} options={ESTADO_OPTS} required />
          </div>
        </section>

        {error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
        )}

        <div className="flex items-center justify-between gap-3">
          {/* Delete */}
          {confirmDel ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">¿Confirmar baja?</span>
              <Button variant="danger" size="sm" type="button" onClick={handleDelete} loading={loading}>Sí, dar de baja</Button>
              <Button variant="secondary" size="sm" type="button" onClick={() => setConfirmDel(false)}>Cancelar</Button>
            </div>
          ) : (
            <Button variant="danger" size="sm" type="button" onClick={() => setConfirmDel(true)}>
              <Trash2 className="h-4 w-4" /> Dar de baja
            </Button>
          )}

          <div className="flex items-center gap-3">
            <Link href="/usuarios"><Button variant="secondary" type="button">Cancelar</Button></Link>
            <Button type="submit" loading={loading}><Save className="h-4 w-4" /> Guardar cambios</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
