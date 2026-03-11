"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { CATEGORIAS_NOVEDADES } from "@/constants/categorias-novedades";

interface Senal    { id: string; nombre: string; codigo: string; }
interface Perfil   { id: string; nombre: string; apellido: string; }

const PRIORIDADES = [
  { value: "critica", label: "Crítica" },
  { value: "alta",    label: "Alta" },
  { value: "media",   label: "Media" },
  { value: "baja",    label: "Baja" },
];

export default function NuevaNovedadPage() {
  const router = useRouter();

  const [senales,  setSenales]  = useState<Senal[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const [form, setForm] = useState({
    senal_id:      "",
    categoria:     "",      // slug from CATEGORIAS_NOVEDADES
    opcion:        "",      // slug from opciones
    descripcion:   "",
    prioridad:     "media",
    asignado_a_id: "",
  });

  const categoriaSeleccionada = CATEGORIAS_NOVEDADES.find((c) => c.id === form.categoria);

  useEffect(() => {
    Promise.all([
      fetch("/api/senales").then((r) => r.json()),
      fetch("/api/lookups").then((r) => r.json()),
    ]).then(([senRes, lookRes]) => {
      setSenales(senRes.data ?? []);
      setPerfiles(lookRes.perfiles ?? []);
    });
  }, []);

  function set(field: string, value: string) {
    setForm((f) => {
      const updated = { ...f, [field]: value };
      // Reset opción when category changes
      if (field === "categoria") updated.opcion = "";
      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.senal_id || !form.categoria || !form.descripcion || !form.prioridad) {
      setError("Completá los campos obligatorios");
      return;
    }
    setLoading(true);
    setError(null);

    const body = {
      senal_id:      form.senal_id,
      categoria:     form.categoria,
      opcion:        form.opcion     || null,
      descripcion:   form.descripcion,
      prioridad:     form.prioridad,
      asignado_a_id: form.asignado_a_id || null,
    };

    const res = await fetch("/api/novedades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/novedades");
    } else {
      const json = await res.json();
      setError(json.error ?? "Error al registrar la novedad");
      setLoading(false);
    }
  }

  const senalOpts    = senales.map((s) => ({ value: s.id,  label: `${s.codigo} — ${s.nombre}` }));
  const catOpts      = CATEGORIAS_NOVEDADES.map((c) => ({ value: c.id, label: c.label }));
  const opcionOpts   = (categoriaSeleccionada?.opciones ?? []).map((o) => ({ value: o.id, label: o.label }));
  const perOpts      = perfiles.map((p) => ({ value: p.id, label: `${p.nombre} ${p.apellido}` }));

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">

      <div className="flex items-center gap-4">
        <Link href="/novedades">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Volver</Button>
        </Link>
        <div>
          <h1 className="font-mono text-sm font-semibold tracking-wider text-slate-200 uppercase">
            Registrar Aviso / Novedad
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Documentá un problema o novedad en una señal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Señal afectada */}
        <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
          <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-4">Señal Afectada</p>
          <Select
            label="Señal *"
            value={form.senal_id}
            onChange={(e) => set("senal_id", e.target.value)}
            options={senalOpts}
            placeholder="Seleccionar señal..."
            required
          />
        </section>

        {/* Categoría y opción */}
        <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
          <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-4">Tipo de Novedad</p>
          <div className="flex flex-col gap-4">
            <Select
              label="Categoría *"
              value={form.categoria}
              onChange={(e) => set("categoria", e.target.value)}
              options={catOpts}
              placeholder="Seleccionar categoría..."
              required
            />
            {categoriaSeleccionada && opcionOpts.length > 0 && (
              <Select
                label="Opción"
                value={form.opcion}
                onChange={(e) => set("opcion", e.target.value)}
                options={opcionOpts}
                placeholder="Seleccionar opción..."
              />
            )}
          </div>
        </section>

        {/* Detalle */}
        <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
          <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-4">Detalle</p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Descripción *
              </label>
              <textarea
                value={form.descripcion}
                onChange={(e) => set("descripcion", e.target.value)}
                placeholder="Describa la novedad con detalle..."
                rows={4}
                required
                className="rounded-md border border-[#243d57] bg-[#0f1923] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-[#4a9edd] focus:outline-none focus:ring-1 focus:ring-[#4a9edd]/50 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Prioridad *"
                value={form.prioridad}
                onChange={(e) => set("prioridad", e.target.value)}
                options={PRIORIDADES}
                required
              />
              <Select
                label="Asignar a"
                value={form.asignado_a_id}
                onChange={(e) => set("asignado_a_id", e.target.value)}
                options={perOpts}
                placeholder="Sin asignar"
              />
            </div>
          </div>
        </section>

        {error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link href="/novedades"><Button variant="secondary" type="button">Cancelar</Button></Link>
          <Button type="submit" loading={loading}><Save className="h-4 w-4" /> Registrar novedad</Button>
        </div>

      </form>
    </div>
  );
}
