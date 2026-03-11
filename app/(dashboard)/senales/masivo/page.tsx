"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, CheckCircle2, AlertCircle, Loader2, Upload, FileDown } from "lucide-react";
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

interface Fila {
  id:          string;
  nombre:      string;
  codigo:      string;
  categoria_id: string;
  estado_id:   string;
  provincia:   string;
  lat:         string;
  lng:         string;
  estado: "idle" | "loading" | "ok" | "error";
  msg:    string;
}

function filaVacia(): Fila {
  return {
    id: crypto.randomUUID(),
    nombre: "", codigo: "", categoria_id: "",
    estado_id: "", provincia: "", lat: "", lng: "",
    estado: "idle", msg: "",
  };
}

// Convierte DMS (grados minutos segundos) a decimal
// Acepta formatos: "-52 39 08", "52 39 08 S", "52°39'08\"S"
function parseCSVLineMasivo(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function dmsADecimal(raw: string, hemisferio?: string): number {
  const limpio = raw.replace(/[°'"]/g, " ").trim();
  const partes = limpio.split(/\s+/).filter(Boolean);
  let neg = false;

  // Detectar hemisferio S o W en el string
  const ultimo = partes[partes.length - 1].toUpperCase();
  if (ultimo === "S" || ultimo === "W") { neg = true; partes.pop(); }
  if (ultimo === "N" || ultimo === "E") { partes.pop(); }
  if (hemisferio === "S" || hemisferio === "W") neg = true;
  if (partes[0].startsWith("-")) neg = true;

  const nums = partes.map((p) => Math.abs(parseFloat(p)));
  const grados  = nums[0] ?? 0;
  const minutos = nums[1] ?? 0;
  const segundos = nums[2] ?? 0;

  // Si el tercer número tiene 2 dígitos y parece ser décimas de minuto (>59), tratar como decimal de minutos
  const decimal = segundos > 59
    ? grados + (minutos + segundos / 100) / 60
    : grados + minutos / 60 + segundos / 3600;

  return neg ? -decimal : decimal;
}

export default function CargaMasivaPage() {
  const router = useRouter();
  const [lookups, setLookups] = useState<Lookups>({ categorias_senales: [], estados_senales: [], perfiles: [] });
  const [filas, setFilas]     = useState<Fila[]>([filaVacia()]);
  const [guardando, setGuardando] = useState(false);
  const [csvError, setCsvError]   = useState<string | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/lookups")
      .then((r) => r.json())
      .then((d) => setLookups({ categorias_senales: d.categorias_senales, estados_senales: d.estados_senales, perfiles: d.perfiles }));
  }, []);

  function setFila(id: string, field: keyof Fila, value: string) {
    setFilas((fs) => fs.map((f) => f.id === id ? { ...f, [field]: value } : f));
  }

  function agregarFila() {
    setFilas((fs) => [...fs, filaVacia()]);
  }

  function duplicarFila(id: string) {
    setFilas((fs) => {
      const idx = fs.findIndex((f) => f.id === id);
      const copia = { ...fs[idx], id: crypto.randomUUID(), nombre: "", codigo: "", estado: "idle" as const, msg: "" };
      const nueva = [...fs];
      nueva.splice(idx + 1, 0, copia);
      return nueva;
    });
  }

  function eliminarFila(id: string) {
    setFilas((fs) => fs.length === 1 ? fs : fs.filter((f) => f.id !== id));
  }

  async function guardarTodo() {
    // Solo procesar filas que no están ya guardadas
    const pendientes = filas.filter((f) => f.estado !== "ok");
    if (pendientes.length === 0) return;

    // Validar campos obligatorios en las pendientes
    const invalidas = pendientes.filter((f) => !f.nombre || !f.codigo || !f.categoria_id || !f.estado_id || !f.provincia || !f.lat || !f.lng);
    if (invalidas.length > 0) {
      const idsInvalidas = new Set(invalidas.map((f) => f.id));
      setFilas((fs) => fs.map((f) =>
        idsInvalidas.has(f.id) ? { ...f, estado: "error", msg: "Completá todos los campos obligatorios" } : f
      ));
      return;
    }

    setGuardando(true);

    const resultados = await Promise.allSettled(
      pendientes.map((f) =>
        fetch("/api/senales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre:       f.nombre,
            codigo:       f.codigo,
            categoria_id: Number(f.categoria_id),
            estado_id:    Number(f.estado_id),
            provincia:    f.provincia,
            lat:          parseFloat(f.lat) || 0,
            lng:          parseFloat(f.lng) || 0,
            activo:       true,
          }),
        }).then(async (res) => {
          if (!res.ok) {
            const json = await res.json();
            throw new Error(json.error ?? "Error al guardar");
          }
          return f.id;
        })
      )
    );

    const resultMap = new Map(pendientes.map((f, i) => [f.id, resultados[i]]));
    setFilas((fs) =>
      fs.map((f) => {
        if (f.estado === "ok") return f; // ya guardada, no tocar
        const r = resultMap.get(f.id);
        if (!r) return f;
        if (r.status === "fulfilled") return { ...f, estado: "ok", msg: "Guardada correctamente" };
        return { ...f, estado: "error", msg: r.reason?.message ?? "Error desconocido" };
      })
    );

    setGuardando(false);
  }

  function descargarPlantilla() {
    // Reference data placed in cols 14-17 (right of the 13 data cols + 1 spacer)
    const refRows = [
      ["Columna: tipo","Columna: estado","Columna: lat_hemisferio","Columna: lng_hemisferio"],
      ["faro","en_servicio","S (latitud Sur)","W (longitud Oeste)"],
      ["boya","sin_servicio","N (latitud Norte)","E (longitud Este)"],
      ["baliza","caido","",""],
      ["","dañado","",""],
    ];
    const ejemplo = ["Magallanes","1501","faro","en_servicio","Tierra del Fuego","52","39","85","S","68","36","13","W"];
    const maxRows = Math.max(refRows.length, 1);
    const dataRows = Array.from({ length: maxRows }, (_, i) => {
      const ref = refRows[i] ?? ["","","",""];
      const dataCells = i === 0
        ? ejemplo.map((v) => `<td class="ejemplo">${v}</td>`).join("")
        : `<td></td>`.repeat(13);
      const isHeader = i === 0;
      const refCells = ref.map((v) => `<td class="${isHeader ? "ref-header" : "ref-item"}">${v}</td>`).join("");
      return `<tr>${dataCells}<td></td>${refCells}</tr>`;
    }).join("");

    const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8">
<style>
  body { font-family: Calibri, sans-serif; font-size: 11pt; }
  .titulo { background:#0f2d4e; color:white; font-weight:bold; font-size:14pt; padding:8px 12px; }
  .subtitulo { background:#1d3045; color:#7ab3d4; font-size:9pt; padding:4px 12px; }
  .header { background:#1a324d; color:white; font-weight:bold; font-size:10pt; border:1px solid #2d4a6b; padding:6px 10px; }
  .ejemplo { background:#e8f4e8; border:1px solid #b3d9b3; padding:5px 10px; color:#1a5c1a; font-size:10pt; }
  .nota { color:#666; font-style:italic; font-size:9pt; padding:4px 10px; }
  .ref-header { background:#2d4a6b; color:white; font-weight:bold; padding:5px 10px; font-size:10pt; }
  .ref-item { background:#f5f8fc; border:1px solid #dde6f0; padding:4px 10px; font-family:Consolas,monospace; font-size:9pt; }
</style>
</head>
<body>
<table>
  <tr>
    <td colspan="13" class="titulo">FAROLIBERTAD — Plantilla de Carga Masiva de Señales</td>
    <td></td>
    <td colspan="4" class="titulo" style="background:#1a3a5c;font-size:11pt">Valores de Referencia</td>
  </tr>
  <tr>
    <td colspan="13" class="subtitulo">Ministerio de Defensa · Sistema de Señales Marítimas · República Argentina</td>
    <td></td><td></td><td></td><td></td><td></td>
  </tr>
  <tr><td colspan="13" style="padding:4px"></td><td></td><td></td><td></td><td></td><td></td></tr>
  <tr>
    <td class="header">nombre</td>
    <td class="header">codigo</td>
    <td class="header">tipo</td>
    <td class="header">estado</td>
    <td class="header">provincia</td>
    <td class="header">lat_grados</td>
    <td class="header">lat_minutos</td>
    <td class="header">lat_segundos</td>
    <td class="header">lat_hemisferio</td>
    <td class="header">lng_grados</td>
    <td class="header">lng_minutos</td>
    <td class="header">lng_segundos</td>
    <td class="header">lng_hemisferio</td>
    <td></td><td></td><td></td><td></td><td></td>
  </tr>
  ${dataRows}
  <tr><td colspan="13" class="nota">↑ Reemplazá los ejemplos con tus datos. lat/lng_segundos puede ser decimal (ej: 85 = 0.85 minutos).</td><td></td><td></td><td></td><td></td><td></td></tr>
</table>
</body></html>`;

    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "plantilla_senales.xls"; a.click();
    URL.revokeObjectURL(url);
  }

  function importarCSV(e: React.ChangeEvent<HTMLInputElement>) {
    setCsvError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const texto = (ev.target?.result as string).replace(/^\uFEFF/, "");
        const lineas = texto.split(/\r?\n/).filter((l) => l.trim());

        // Find header row dynamically (template has title rows before the actual headers)
        const headerIdx = lineas.findIndex((l) =>
          l.toLowerCase().replace(/"/g, "").includes("nombre") &&
          l.toLowerCase().replace(/"/g, "").includes("codigo")
        );
        if (headerIdx === -1) { setCsvError("No se encontró la fila de encabezados (nombre, codigo)."); return; }

        const encabezado = parseCSVLineMasivo(lineas[headerIdx]).map((h) => h.toLowerCase());

        const idx = (nombre: string) => encabezado.indexOf(nombre);

        // Mapear tipo → categoria_id
        const catMap: Record<string, string> = {};
        lookups.categorias_senales.forEach((c) => {
          catMap[c.nombre.toLowerCase()] = String(c.id);
          catMap[c.label.toLowerCase()]  = String(c.id);
        });
        // Mapear estado → estado_id
        const estMap: Record<string, string> = {};
        lookups.estados_senales.forEach((e) => {
          estMap[e.nombre.toLowerCase()] = String(e.id);
          estMap[e.label.toLowerCase()]  = String(e.id);
        });

        const nuevas: Fila[] = lineas.slice(headerIdx + 1).map((linea) => {
          const cols = parseCSVLineMasivo(linea);
          const get  = (i: number) => cols[i] ?? "";

          // Coordenadas: puede venir como decimal directo o en columnas DMS
          let lat = "", lng = "";
          const iLat = idx("lat");
          const iLng = idx("lng");
          const iLatG = idx("lat_grados");

          if (iLat >= 0 && get(iLat) !== "") {
            lat = get(iLat);
            lng = get(iLng);
          } else if (iLatG >= 0) {
            const latG = get(idx("lat_grados"));
            const latM = get(idx("lat_minutos"));
            const latS = get(idx("lat_segundos"));
            const latH = get(idx("lat_hemisferio"));
            const lngG = get(idx("lng_grados"));
            const lngM = get(idx("lng_minutos"));
            const lngS = get(idx("lng_segundos"));
            const lngH = get(idx("lng_hemisferio"));
            lat = String(dmsADecimal(`${latG} ${latM} ${latS}`, latH).toFixed(6));
            lng = String(dmsADecimal(`${lngG} ${lngM} ${lngS}`, lngH).toFixed(6));
          }

          const tipoRaw   = get(idx("tipo")).toLowerCase();
          const estadoRaw = get(idx("estado")).toLowerCase();

          return {
            ...filaVacia(),
            nombre:       get(idx("nombre")),
            codigo:       get(idx("codigo")),
            categoria_id: catMap[tipoRaw]   ?? "",
            estado_id:    estMap[estadoRaw] ?? "",
            provincia:    get(idx("provincia")),
            lat, lng,
          };
        }).filter((f) => f.nombre && f.codigo && f.categoria_id && f.estado_id);

        if (nuevas.length === 0) { setCsvError("El archivo no tiene filas válidas."); return; }
        setFilas((fs) => {
          const vacias = fs.filter((f) => !f.nombre && !f.codigo);
          return vacias.length === fs.length ? nuevas : [...fs, ...nuevas];
        });
      } catch {
        setCsvError("No se pudo leer el archivo. Verificá que sea un CSV válido.");
      }
      if (csvInputRef.current) csvInputRef.current.value = "";
    };
    reader.readAsText(file, "UTF-8");
  }

  const catOpts  = lookups.categorias_senales.map((c) => ({ value: String(c.id), label: c.label }));
  const estOpts  = lookups.estados_senales.map((e) => ({ value: String(e.id), label: e.label }));
  const provOpts = PROVINCIAS_MARITIMAS.map((p) => ({ value: p, label: p }));

  const ok     = filas.filter((f) => f.estado === "ok").length;
  const errors = filas.filter((f) => f.estado === "error").length;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link href="/senales">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Volver</Button>
          </Link>
          <div>
            <h1 className="font-mono text-sm font-semibold tracking-wider text-slate-200 uppercase">Carga Masiva de Señales</h1>
            <p className="text-xs text-slate-500 mt-0.5">Agregá múltiples señales a la vez — {filas.length} fila{filas.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={descargarPlantilla} title="Descargar plantilla CSV">
            <FileDown className="h-4 w-4" /> Plantilla
          </Button>
          <Button variant="secondary" onClick={() => csvInputRef.current?.click()} disabled={guardando}>
            <Upload className="h-4 w-4" /> Importar CSV
          </Button>
          <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={importarCSV} />
          <Button variant="secondary" onClick={agregarFila} disabled={guardando}>
            <Plus className="h-4 w-4" /> Agregar fila
          </Button>
          <Button onClick={guardarTodo} loading={guardando}>
            <Save className="h-4 w-4" /> Guardar todas
          </Button>
        </div>
      </div>

      {/* Error CSV */}
      {csvError && (
        <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" /> {csvError}
        </div>
      )}

      {/* Resumen resultado */}
      {(ok > 0 || errors > 0) && (
        <div className="flex gap-3 flex-wrap">
          {ok > 0 && (
            <div className="flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">
              <CheckCircle2 className="h-4 w-4" /> {ok} señal{ok !== 1 ? "es" : ""} guardada{ok !== 1 ? "s" : ""} correctamente
            </div>
          )}
          {errors > 0 && (
            <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" /> {errors} con error — revisalas abajo
            </div>
          )}
          <Button onClick={() => router.push("/senales")} size="sm" variant="secondary">
            Ver señales
          </Button>
        </div>
      )}

      {/* Leyenda columnas */}
      <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1fr_1fr_1.5fr_1fr_1fr_auto] gap-2 px-4 text-xs font-mono text-[#4a9edd] uppercase tracking-wider">
        <span>Nombre *</span>
        <span>Nº Nacional *</span>
        <span>Tipo *</span>
        <span>Estado *</span>
        <span>Provincia *</span>
        <span>Latitud *</span>
        <span>Longitud *</span>
        <span></span>
      </div>

      {/* Filas */}
      <div className="flex flex-col gap-3">
        {filas.map((fila, idx) => (
          <div
            key={fila.id}
            className={`rounded-lg border p-4 transition-colors ${
              fila.estado === "ok"
                ? "border-green-500/40 bg-green-500/5"
                : fila.estado === "error"
                ? "border-red-500/40 bg-red-500/5"
                : "border-[#243d57] bg-[#162233]"
            }`}
          >
            {/* Número de fila */}
            <div className="flex items-center justify-between mb-3 lg:hidden">
              <span className="text-xs font-mono text-slate-500">Señal #{idx + 1}</span>
              <div className="flex gap-1">
                <button onClick={() => duplicarFila(fila.id)} title="Duplicar fila" className="p-1.5 text-slate-500 hover:text-[#4a9edd] transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => eliminarFila(fila.id)} title="Eliminar fila" className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1.5fr_1fr_1fr_1.5fr_1fr_1fr_auto] lg:items-end">
              <Input
                label="Nombre *"
                value={fila.nombre}
                onChange={(e) => setFila(fila.id, "nombre", e.target.value)}
                placeholder="Faro San Marcos"
                disabled={fila.estado === "ok"}
              />
              <Input
                label="Nº Nacional *"
                value={fila.codigo}
                onChange={(e) => setFila(fila.id, "codigo", e.target.value)}
                placeholder="FAR-0042"
                disabled={fila.estado === "ok"}
              />
              <Select
                label="Tipo *"
                value={fila.categoria_id}
                onChange={(e) => setFila(fila.id, "categoria_id", e.target.value)}
                options={catOpts}
                placeholder="Tipo..."
                disabled={fila.estado === "ok"}
              />
              <Select
                label="Estado *"
                value={fila.estado_id}
                onChange={(e) => setFila(fila.id, "estado_id", e.target.value)}
                options={estOpts}
                placeholder="Estado..."
                disabled={fila.estado === "ok"}
              />
              <Select
                label="Provincia *"
                value={fila.provincia}
                onChange={(e) => setFila(fila.id, "provincia", e.target.value)}
                options={provOpts}
                placeholder="Provincia..."
                disabled={fila.estado === "ok"}
              />
              <Input
                label="Latitud *"
                type="number"
                step="0.000001"
                value={fila.lat}
                onChange={(e) => setFila(fila.id, "lat", e.target.value)}
                placeholder="-38.123"
                disabled={fila.estado === "ok"}
              />
              <Input
                label="Longitud *"
                type="number"
                step="0.000001"
                value={fila.lng}
                onChange={(e) => setFila(fila.id, "lng", e.target.value)}
                placeholder="-62.123"
                disabled={fila.estado === "ok"}
              />

              {/* Acciones desktop */}
              <div className="hidden lg:flex items-center gap-1 pb-0.5">
                {fila.estado === "loading" && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                {fila.estado === "ok"      && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                {fila.estado === "error"   && <AlertCircle  className="h-4 w-4 text-red-400" />}
                {fila.estado === "idle" && (
                  <>
                    <button onClick={() => duplicarFila(fila.id)} title="Duplicar" className="p-1.5 text-slate-500 hover:text-[#4a9edd] transition-colors">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => eliminarFila(fila.id)} title="Eliminar" className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Mensaje de error/éxito */}
            {fila.msg && (
              <p className={`mt-2 text-xs ${fila.estado === "ok" ? "text-green-400" : "text-red-400"}`}>
                {fila.msg}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Botón agregar al pie */}
      <button
        onClick={agregarFila}
        disabled={guardando}
        className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#243d57] py-4 text-sm text-slate-500 hover:border-[#4a9edd] hover:text-[#4a9edd] transition-colors"
      >
        <Plus className="h-4 w-4" /> Agregar otra señal
      </button>

    </div>
  );
}
