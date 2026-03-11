"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PROVINCIAS_MARITIMAS } from "@/constants/tipos-senales";

interface LookupItem { id: number; nombre: string; label: string; }
interface Perfil     { id: string; nombre: string; apellido: string; }

interface Lookups {
  categorias_senales: LookupItem[];
  estados_senales:    LookupItem[];
  perfiles:           Perfil[];
}

export default function NuevaSenalPage() {
  const router = useRouter();
  const [lookups,  setLookups]  = useState<Lookups>({ categorias_senales: [], estados_senales: [], perfiles: [] });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: "", codigo: "", categoria_id: "", estado_id: "",
    provincia: "", lat: "", lng: "", ubicacion_descripcion: "",
    encargado_id: "", altura_focal: "", alcance_luminoso: "",
    caracteristica_luz: "", color_luz: "", tipo_estructura: "",
    año_instalacion: "", observaciones: "",
  });

  useEffect(() => {
    fetch("/api/lookups")
      .then((r) => r.json())
      .then((d) => setLookups({ categorias_senales: d.categorias_senales, estados_senales: d.estados_senales, perfiles: d.perfiles }));
  }, []);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = {
      nombre: form.nombre, codigo: form.codigo,
      categoria_id: Number(form.categoria_id),
      estado_id:    Number(form.estado_id),
      provincia:    form.provincia,
      lat:          parseFloat(form.lat)  || 0,
      lng:          parseFloat(form.lng)  || 0,
      ubicacion_descripcion: form.ubicacion_descripcion || null,
      encargado_id:          form.encargado_id          || null,
      altura_focal:          form.altura_focal   ? parseFloat(form.altura_focal)   : null,
      alcance_luminoso:      form.alcance_luminoso ? parseFloat(form.alcance_luminoso) : null,
      caracteristica_luz:    form.caracteristica_luz  || null,
      color_luz:             form.color_luz           || null,
      tipo_estructura:       form.tipo_estructura      || null,
      año_instalacion:       form.año_instalacion ? parseInt(form.año_instalacion) : null,
      observaciones:         form.observaciones        || null,
      activo: true,
    };

    const res = await fetch("/api/senales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/senales");
    } else {
      const json = await res.json();
      setError(json.error ?? "Error al crear la señal");
      setLoading(false);
    }
  }

  const catOpts  = lookups.categorias_senales.map((c) => ({ value: String(c.id), label: c.label }));
  const estOpts  = lookups.estados_senales.map((e) => ({ value: String(e.id), label: e.label }));
  const perOpts  = lookups.perfiles.map((p) => ({ value: p.id, label: `${p.nombre} ${p.apellido}` }));
  const provOpts = PROVINCIAS_MARITIMAS.map((p) => ({ value: p, label: p }));

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">

      <div className="flex items-center gap-4">
        <Link href="/senales">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Volver</Button>
        </Link>
        <div>
          <h1 className="font-mono text-sm font-semibold tracking-wider text-slate-200 uppercase">Nueva Señal</h1>
          <p className="text-xs text-slate-500 mt-0.5">Complete los datos de la señal marítima</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Identificación */}
        <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
          <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-4">Identificación</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nombre *" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Faro San Marcos" required />
            <Input label="Número Nacional *" value={form.codigo} onChange={(e) => set("codigo", e.target.value)} placeholder="FAR-0042" required />
            <Select label="Tipo de señal *" value={form.categoria_id} onChange={(e) => set("categoria_id", e.target.value)} options={catOpts} placeholder="Seleccionar tipo..." required />
            <Select label="Estado *" value={form.estado_id} onChange={(e) => set("estado_id", e.target.value)} options={estOpts} placeholder="Seleccionar estado..." required />
          </div>
        </section>

        {/* Ubicación */}
        <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
          <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-4">Ubicación</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Provincia *" value={form.provincia} onChange={(e) => set("provincia", e.target.value)} options={provOpts} placeholder="Seleccionar..." required />
            <Input label="Descripción" value={form.ubicacion_descripcion} onChange={(e) => set("ubicacion_descripcion", e.target.value)} placeholder="Descripción de la ubicación" />
            <Input label="Latitud *" type="number" step="0.000001" value={form.lat} onChange={(e) => set("lat", e.target.value)} placeholder="-38.123456" required />
            <Input label="Longitud *" type="number" step="0.000001" value={form.lng} onChange={(e) => set("lng", e.target.value)} placeholder="-62.123456" required />
          </div>
        </section>

        {/* Datos técnicos */}
        <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
          <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-4">Datos Técnicos</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Altura focal (m)" type="number" step="0.1" value={form.altura_focal} onChange={(e) => set("altura_focal", e.target.value)} placeholder="28.5" />
            <Input label="Alcance luminoso (mn)" type="number" step="0.1" value={form.alcance_luminoso} onChange={(e) => set("alcance_luminoso", e.target.value)} placeholder="12.0" />
            <Input label="Característica de luz" value={form.caracteristica_luz} onChange={(e) => set("caracteristica_luz", e.target.value)} placeholder="Oc(2) 10s" />
            <Input label="Color de luz" value={form.color_luz} onChange={(e) => set("color_luz", e.target.value)} placeholder="Blanco / Rojo" />
            <Input label="Tipo de estructura" value={form.tipo_estructura} onChange={(e) => set("tipo_estructura", e.target.value)} placeholder="Torre de hormigón" />
            <Input label="Año de instalación" type="number" value={form.año_instalacion} onChange={(e) => set("año_instalacion", e.target.value)} placeholder="1985" />
          </div>
        </section>

        {/* Responsable y observaciones */}
        <section className="rounded-lg border border-[#243d57] bg-[#162233] p-5">
          <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-4">Responsable</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Encargado de estación" value={form.encargado_id} onChange={(e) => set("encargado_id", e.target.value)} options={perOpts} placeholder="Sin asignar" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Observaciones</label>
              <textarea
                value={form.observaciones}
                onChange={(e) => set("observaciones", e.target.value)}
                placeholder="Notas adicionales..."
                rows={3}
                className="rounded-md border border-[#243d57] bg-[#0f1923] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-[#4a9edd] focus:outline-none focus:ring-1 focus:ring-[#4a9edd]/50 resize-none"
              />
            </div>
          </div>
        </section>

        {error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link href="/senales"><Button variant="secondary" type="button">Cancelar</Button></Link>
          <Button type="submit" loading={loading}><Save className="h-4 w-4" /> Guardar señal</Button>
        </div>

      </form>
    </div>
  );
}
