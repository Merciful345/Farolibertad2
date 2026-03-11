"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FileDown, Filter, Loader2, Search, X, MapPin, Zap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatFecha, formatFechaHora } from "@/lib/utils";
import type { Senal, Novedad } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type TipoReporte = "novedades" | "senales" | "ficha";

interface FiltrosNov {
  desde:     string;
  hasta:     string;
  estado:    string;
  prioridad: string;
}

interface FiltrosSen {
  tipo:      string;
  estado:    string;
  provincia: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADOS_NOV = ["", "pendiente", "en_curso", "resuelta", "cancelada"];
const PRIORIDADES = ["", "critica", "alta", "media", "baja"];
const TIPOS_SEN   = ["", "faro", "boya", "baliza"];
const ESTADOS_SEN = ["", "en_servicio", "sin_servicio", "caido", "dañado"];

const LABEL_ESTADO_NOV: Record<string, string> = {
  pendiente:  "Pendiente",
  en_curso:   "En curso",
  resuelta:   "Resuelta",
  cancelada:  "Cancelada",
};

const LABEL_PRIORIDAD: Record<string, string> = {
  critica: "Crítica",
  alta:    "Alta",
  media:   "Media",
  baja:    "Baja",
};

const LABEL_TIPO: Record<string, string> = {
  faro:    "Faro",
  boya:    "Boya",
  baliza:  "Baliza",
};

const LABEL_ESTADO_SEN: Record<string, string> = {
  en_servicio:  "En servicio",
  sin_servicio: "Sin servicio",
  caido:        "Caído",
  dañado:       "Dañado",
};

function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}

function haceTreintaDias(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

// ─── Instrucciones por tipo ────────────────────────────────────────────────────

function getInstrucciones(tipo: string): { titulo: string; lineas: string[] }[] {
  const comunes = [
    {
      titulo: "Funciones Generales",
      lineas: [
        "Contribuir a la seguridad de la navegación marítima y fluvial en aguas jurisdiccionales argentinas.",
        "Mantener operativa la señal en las condiciones establecidas por la Armada Argentina.",
        "Registrar toda novedad, avería o anomalía en el sistema de gestión FAROLIBERTAD.",
        "Informar de inmediato al Jefe de Zona cualquier interrupción del servicio.",
        "Conservar el libro de guardia actualizado con relevos, incidencias y trabajos realizados.",
        "Cumplir con las inspecciones periódicas y el plan de mantenimiento preventivo asignado.",
      ],
    },
    {
      titulo: "Obligaciones del Encargado",
      lineas: [
        "Realizar inspección visual diaria de la instalación al inicio y al fin de cada jornada.",
        "Verificar el correcto funcionamiento del sistema de iluminación (encendido/apagado automático).",
        "Mantener el área de la señal despejada, limpia y libre de obstrucciones.",
        "No permitir el acceso de personal no autorizado a las instalaciones.",
        "Asistir a las capacitaciones y simulacros programados por la Autoridad Marítima.",
        "Elaborar el informe mensual de estado y remitirlo antes del día 5 de cada mes.",
      ],
    },
    {
      titulo: "Procedimientos ante Emergencias",
      lineas: [
        "Ante falla de la señal: intentar restablecimiento según protocolo local; si no es posible, notificar al Centro de Control en forma inmediata.",
        "Ante condiciones meteorológicas extremas: asegurar estructuras móviles y resguardar el personal.",
        "Ante daños por vandalismo o accidente: preservar la escena, documentar fotográficamente y reportar.",
        "Toda emergencia debe quedar registrada con hora, descripción y acciones tomadas.",
      ],
    },
    {
      titulo: "Normativa Aplicable",
      lineas: [
        "Reglamento General de Balizamiento — Prefectura Naval Argentina.",
        "IALA Maritime Buoyage System — Región B (América, Japón, Corea, Filipinas).",
        "Reglamento de Seguridad de la Vida Humana en el Mar (SOLAS).",
        "Ordenanza Marítima N° 1/2019 — Señales Marítimas en aguas argentinas.",
        "Disposiciones vigentes del Ministerio de Defensa de la República Argentina.",
      ],
    },
  ];

  if (tipo === "faro") {
    return [
      {
        titulo: "Funciones Específicas del Faro",
        lineas: [
          "Emitir la característica de luz asignada en la carta náutica de manera continua durante las horas de oscuridad.",
          "Servir como referencia visual primaria para la navegación de cabotaje y de altura.",
          "Proveer información de posición a embarcaciones en proximidad costera.",
          "Alertar sobre zonas de peligro, costas o bajíos en la vecindad.",
          "Operar el sistema de señales sonoras (sirena/campana) en condiciones de niebla o baja visibilidad.",
        ],
      },
      ...comunes,
      {
        titulo: "Mantenimiento de la Óptica y Sistema de Iluminación",
        lineas: [
          "Limpiar los vidrios de la linterna mensualmente o ante acumulación de suciedad.",
          "Verificar el estado de la lámpara principal y de la lámpara de emergencia semanalmente.",
          "Lubricar el mecanismo rotatorio de la óptica según el cronograma del fabricante.",
          "Controlar el nivel de aceite del motor (si aplica) y reemplazar según especificaciones.",
          "Chequear el sistema de alimentación eléctrica (red, grupo electrógeno, paneles solares, baterías).",
          "Anotar las horas de funcionamiento del equipo en el registro correspondiente.",
        ],
      },
    ];
  }

  if (tipo === "boya") {
    return [
      {
        titulo: "Funciones Específicas de la Boya",
        lineas: [
          "Delimitar canales de navegación, zonas de peligro y áreas de fondeo.",
          "Indicar puntos de referencia en rutas de acceso a puertos y rada.",
          "Señalizar costados de canal, bajos, obstáculos y zonas de restricción.",
          "Operar sistema de luz y/o marca de tope según especificación de la carta náutica.",
          "Proporcionar referencia visual diurna mediante color, forma y marca de tope.",
        ],
      },
      ...comunes,
      {
        titulo: "Mantenimiento e Inspección de la Boya",
        lineas: [
          "Verificar desde tierra o embarcación que la boya permanezca en posición nominal.",
          "Inspeccionar el estado del cuerpo flotante, cadenas y muerto de fondeo periódicamente.",
          "Controlar el funcionamiento de la linterna y reemplazar la batería según cronograma.",
          "Revisar la pintura y los colores de identificación; retintar si hay decoloración significativa.",
          "Verificar integridad de la marca de tope (topmark) y escalerilla de acceso si la tuviere.",
          "Ante deriva detectada, notificar inmediatamente para fondeo correctivo.",
        ],
      },
    ];
  }

  if (tipo === "baliza") {
    return [
      {
        titulo: "Funciones Específicas de la Baliza",
        lineas: [
          "Señalizar obstáculos, bajos fondos, rompientes y zonas de restricción.",
          "Orientar la navegación en canales estrechos, ríos y accesos portuarios.",
          "Marcar los extremos de bancos de arena o zonas de dragado.",
          "Funcionar como referencia diurna mediante color, forma y marca de tope.",
          "En caso de baliza luminosa: emitir la característica de luz asignada.",
        ],
      },
      ...comunes,
      {
        titulo: "Mantenimiento e Inspección de la Baliza",
        lineas: [
          "Inspeccionar visualmente la estructura, pintura y anclaje mensualmente.",
          "Verificar la verticalidad de la estructura; ante inclinación mayor a 5°, notificar.",
          "Controlar el funcionamiento del sistema de iluminación (si aplica).",
          "Revisar estado de la marca de tope y reemplazar si presenta deterioro.",
          "Limpiar la estructura de depósitos salinos, algas e incrustaciones marinas.",
          "Verificar el estado del sistema de anclaje y la condición del concreto de base.",
        ],
      },
    ];
  }

  return comunes;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportesPage() {
  return (
    <Suspense>
      <ReportesInner />
    </Suspense>
  );
}

function ReportesInner() {
  const searchParams = useSearchParams();

  const [tipo, setTipo]       = useState<TipoReporte>("novedades");
  const [filtNov, setFiltNov] = useState<FiltrosNov>({ desde: haceTreintaDias(), hasta: hoy(), estado: "", prioridad: "" });
  const [filtSen, setFiltSen] = useState<FiltrosSen>({ tipo: "", estado: "", provincia: "" });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [datos, setDatos]         = useState<any[]>([]);
  const [cargando, setCargando]   = useState(false);
  const [generando, setGenerando] = useState(false);
  const [buscado, setBuscado]     = useState(false);

  // ─── Ficha state ──────────────────────────────────────────────────────────
  const [fichaQuery,      setFichaQuery]      = useState("");
  const [fichaResultados, setFichaResultados] = useState<Senal[]>([]);
  const [buscandoSenal,   setBuscandoSenal]   = useState(false);
  const [fichaSenal,      setFichaSenal]      = useState<Senal | null>(null);
  const [fichaNovedades,  setFichaNovedades]  = useState<Novedad[]>([]);
  // notas por señal: Record<senal.id, texto>
  const [fichaTextos,     setFichaTextos]     = useState<Record<string, string>>({});
  const [showResultados,  setShowResultados]  = useState(false);
  const [showInstrucciones, setShowInstrucciones] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pre-load signal from URL param ?ficha=<id>
  useEffect(() => {
    const fichaId = searchParams.get("ficha");
    if (fichaId) {
      setTipo("ficha");
      fetch(`/api/senales/${fichaId}`)
        .then((r) => r.json())
        .then((j) => j.data && seleccionarSenal(j.data));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close results on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResultados(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced signal search
  const buscarSenales = useCallback((q: string) => {
    setFichaQuery(q);
    setShowResultados(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setFichaResultados([]); return; }
    debounceRef.current = setTimeout(async () => {
      setBuscandoSenal(true);
      try {
        const res  = await fetch(`/api/senales?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        setFichaResultados((json.data ?? []).slice(0, 8));
      } finally {
        setBuscandoSenal(false);
      }
    }, 300);
  }, []);

  async function seleccionarSenal(s: Senal) {
    setFichaSenal(s);
    setFichaQuery(`${s.codigo} — ${s.nombre}`);
    setShowResultados(false);
    setFichaResultados([]);
    // Load active novedades
    const res  = await fetch(`/api/novedades?senal_id=${s.id}&activas=true`);
    const json = await res.json();
    setFichaNovedades(json.data ?? []);
  }

  function limpiarFicha() {
    setFichaSenal(null);
    setFichaQuery("");
    setFichaResultados([]);
    setFichaNovedades([]);
    setShowInstrucciones(false);
  }

  // ─── CSV export ───────────────────────────────────────────────────────────

  function descargarCSV() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filas: string[][];
    let cabecera: string[];
    let filename: string;

    if (tipo === "novedades") {
      cabecera = ["Fecha", "Señal (código)", "Señal (nombre)", "Categoría", "Prioridad", "Estado", "Reportado por", "Asignado a", "Descripción"];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filas = datos.map((n: any) => [
        formatFechaHora(n.fecha_reporte),
        n.senal?.codigo  ?? "",
        n.senal?.nombre  ?? "",
        n.categoria?.label ?? "",
        LABEL_PRIORIDAD[n.prioridad] ?? n.prioridad,
        LABEL_ESTADO_NOV[n.estado]   ?? n.estado,
        n.reportado_por ? `${n.reportado_por.nombre} ${n.reportado_por.apellido}` : "",
        n.asignado_a    ? `${n.asignado_a.nombre} ${n.asignado_a.apellido}` : "",
        n.descripcion ?? "",
      ]);
      filename = `novedades_${filtNov.desde}_${filtNov.hasta}.csv`;
    } else {
      cabecera = ["Código", "Nombre", "Tipo", "Estado", "Provincia", "Ubicación", "Lat", "Lng", "Altura focal (m)", "Alcance (MN)", "Caract. de luz", "Color de luz", "Tipo estructura", "Año instalación", "Última revisión", "Encargado"];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filas = datos.map((s: any) => [
        s.codigo,
        s.nombre,
        s.categoria?.label ?? "",
        s.estado?.label    ?? "",
        s.provincia ?? "",
        s.ubicacion_descripcion ?? "",
        s.lat  != null ? String(s.lat)  : "",
        s.lng  != null ? String(s.lng)  : "",
        s.altura_focal     != null ? String(s.altura_focal)     : "",
        s.alcance_luminoso != null ? String(s.alcance_luminoso) : "",
        s.caracteristica_luz ?? "",
        s.color_luz          ?? "",
        s.tipo_estructura    ?? "",
        s.año_instalacion    != null ? String(s.año_instalacion) : "",
        s.ultima_revision ? formatFecha(s.ultima_revision) : "",
        s.encargado ? `${s.encargado.nombre} ${s.encargado.apellido}` : "",
      ]);
      filename = `senales_${new Date().toISOString().slice(0, 10)}.csv`;
    }

    const escCell = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [cabecera, ...filas].map((r) => r.map(escCell).join(",")).join("\r\n");
    // BOM UTF-8 para que Excel lo abra correctamente
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  // ─── Fetch tabular data ────────────────────────────────────────────────────

  async function buscar() {
    setCargando(true);
    setBuscado(false);
    try {
      if (tipo === "novedades") {
        const params = new URLSearchParams();
        if (filtNov.estado)    params.set("estado", filtNov.estado);
        if (filtNov.prioridad) params.set("prioridad", filtNov.prioridad);
        const res  = await fetch(`/api/novedades?${params}`);
        const json = await res.json();
        const desde = new Date(filtNov.desde + "T00:00:00");
        const hasta = new Date(filtNov.hasta + "T23:59:59");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setDatos((json.data ?? []).filter((n: any) => {
          const f = new Date(n.fecha_reporte);
          return f >= desde && f <= hasta;
        }));
      } else {
        const params = new URLSearchParams();
        if (filtSen.tipo)      params.set("tipo", filtSen.tipo);
        if (filtSen.estado)    params.set("estado", filtSen.estado);
        if (filtSen.provincia) params.set("provincia", filtSen.provincia);
        const res  = await fetch(`/api/senales?${params}`);
        const json = await res.json();
        setDatos(json.data ?? []);
      }
    } finally {
      setCargando(false);
      setBuscado(true);
    }
  }

  // ─── PDF: tabular report ───────────────────────────────────────────────────

  async function descargarPDF() {
    setGenerando(true);
    try {
      const jsPDF     = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;

      const doc    = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const titulo = tipo === "novedades" ? "Reporte de Avisos / Novedades" : "Reporte de Señales Marítimas";

      doc.setFontSize(16);
      doc.setTextColor(30, 50, 70);
      doc.text("FAROLIBERTAD — Sistema de Gestión de Señales Marítimas", 14, 16);

      doc.setFontSize(12);
      doc.setTextColor(60, 80, 100);
      doc.text(titulo, 14, 24);

      doc.setFontSize(8);
      doc.setTextColor(120, 130, 140);
      doc.text(`Generado: ${formatFechaHora(new Date().toISOString())}    Total registros: ${datos.length}`, 14, 30);

      const filtrosTexto: string[] = [];
      if (tipo === "novedades") {
        filtrosTexto.push(`Período: ${formatFecha(filtNov.desde + "T00:00:00")} — ${formatFecha(filtNov.hasta + "T00:00:00")}`);
        if (filtNov.estado)    filtrosTexto.push(`Estado: ${LABEL_ESTADO_NOV[filtNov.estado]}`);
        if (filtNov.prioridad) filtrosTexto.push(`Prioridad: ${LABEL_PRIORIDAD[filtNov.prioridad]}`);
      } else {
        if (filtSen.tipo)      filtrosTexto.push(`Tipo: ${LABEL_TIPO[filtSen.tipo]}`);
        if (filtSen.estado)    filtrosTexto.push(`Estado: ${LABEL_ESTADO_SEN[filtSen.estado]}`);
        if (filtSen.provincia) filtrosTexto.push(`Provincia: ${filtSen.provincia}`);
      }
      if (filtrosTexto.length) {
        doc.text(`Filtros: ${filtrosTexto.join("  |  ")}`, 14, 35);
      }

      if (tipo === "novedades") {
        autoTable(doc, {
          startY: 40,
          head: [["Fecha", "Señal", "Categoría", "Prioridad", "Estado", "Reportado por", "Asignado a", "Descripción"]],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: datos.map((n: any) => [
            formatFechaHora(n.fecha_reporte),
            n.senal ? `${n.senal.codigo} — ${n.senal.nombre}` : n.senal_id,
            n.categoria?.label ?? "—",
            LABEL_PRIORIDAD[n.prioridad] ?? n.prioridad,
            LABEL_ESTADO_NOV[n.estado] ?? n.estado,
            n.reportado_por ? `${n.reportado_por.nombre} ${n.reportado_por.apellido}` : "—",
            n.asignado_a    ? `${n.asignado_a.nombre} ${n.asignado_a.apellido}` : "—",
            n.descripcion ?? "—",
          ]),
          styles:     { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [26, 50, 77], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [245, 248, 252] },
          columnStyles: { 7: { cellWidth: 60 } },
          margin: { left: 14, right: 14 },
        });
      } else {
        autoTable(doc, {
          startY: 40,
          head: [["Código", "Nombre", "Tipo", "Estado", "Provincia", "Ubicación", "Altura focal", "Alcance", "Año inst."]],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: datos.map((s: any) => [
            s.codigo,
            s.nombre,
            s.categoria?.label ?? "—",
            s.estado?.label    ?? "—",
            s.provincia,
            s.ubicacion_descripcion ?? "—",
            s.altura_focal     != null ? `${s.altura_focal} m`  : "—",
            s.alcance_luminoso != null ? `${s.alcance_luminoso} mn` : "—",
            s.año_instalacion ?? "—",
          ]),
          styles:     { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [26, 50, 77], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [245, 248, 252] },
          margin: { left: 14, right: 14 },
        });
      }

      addPageNumbers(doc);

      const filename = tipo === "novedades"
        ? `novedades_${filtNov.desde}_${filtNov.hasta}.pdf`
        : `senales_${new Date().toISOString().slice(0, 10)}.pdf`;

      doc.save(filename);
    } finally {
      setGenerando(false);
    }
  }

  // ─── PDF: ficha de señal ───────────────────────────────────────────────────

  async function descargarFichaPDF() {
    if (!fichaSenal) return;
    setGenerando(true);
    try {
      const jsPDF     = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;

      const doc  = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W    = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 14;
      const contentW = W - margin * 2;
      let y = 14;

      // ── Encabezado institucional ──────────────────────────────────────────
      doc.setFillColor(26, 50, 77);
      doc.rect(0, 0, W, 22, "F");

      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("MINISTERIO DE DEFENSA — ARMADA ARGENTINA", W / 2, 9, { align: "center" });

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(180, 200, 220);
      doc.text("Sistema de Gestión de Señales Marítimas — FAROLIBERTAD", W / 2, 15, { align: "center" });

      y = 30;

      // ── Título del documento ──────────────────────────────────────────────
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 50, 77);
      doc.text("FICHA TÉCNICA DE SEÑAL MARÍTIMA", W / 2, y, { align: "center" });
      y += 6;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 120, 140);
      doc.text(
        `Generado el ${formatFechaHora(new Date().toISOString())}`,
        W / 2, y, { align: "center" }
      );
      y += 3;

      doc.setDrawColor(200, 215, 230);
      doc.line(margin, y, W - margin, y);
      y += 7;

      // ── Datos de identificación ───────────────────────────────────────────
      sectionTitle(doc, "1. IDENTIFICACIÓN DE LA SEÑAL", margin, y);
      y += 7;

      const tipoNombre = fichaSenal.categoria?.nombre ?? "";

      autoTable(doc, {
        startY: y,
        body: [
          ["Código",         fichaSenal.codigo,                       "Nombre",    fichaSenal.nombre],
          ["Tipo",           fichaSenal.categoria?.label ?? "—",      "Estado",    fichaSenal.estado?.label ?? "—"],
          ["Provincia",      fichaSenal.provincia ?? "—",             "Año inst.", fichaSenal.año_instalacion?.toString() ?? "—"],
          ["Encargado",      fichaSenal.encargado ? `${fichaSenal.encargado.nombre} ${fichaSenal.encargado.apellido}` : "—",
           "Últ. revisión",  fichaSenal.ultima_revision ? formatFecha(fichaSenal.ultima_revision) : "—"],
          ["Ubicación",      fichaSenal.ubicacion_descripcion ?? "—", "", ""],
          ...(fichaSenal.lat && fichaSenal.lng ? [["Coordenadas", `${fichaSenal.lat.toFixed(5)}, ${fichaSenal.lng.toFixed(5)}`, "", ""]] : []),
        ],
        styles:      { fontSize: 8, cellPadding: 2.5 },
        columnStyles: {
          0: { fontStyle: "bold", fillColor: [237, 244, 252], cellWidth: 30 },
          1: { cellWidth: 60 },
          2: { fontStyle: "bold", fillColor: [237, 244, 252], cellWidth: 30 },
          3: { cellWidth: 60 },
        },
        theme:  "grid",
        margin: { left: margin, right: margin },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 8;

      // ── Datos técnicos ────────────────────────────────────────────────────
      if (
        fichaSenal.altura_focal     != null ||
        fichaSenal.alcance_luminoso != null ||
        fichaSenal.caracteristica_luz ||
        fichaSenal.color_luz ||
        fichaSenal.tipo_estructura
      ) {
        checkPageBreak(doc, y, pageH, margin);
        y = ensureY(doc, y, pageH, margin);

        sectionTitle(doc, "2. DATOS TÉCNICOS", margin, y);
        y += 7;

        const techRows: string[][] = [];
        if (fichaSenal.altura_focal     != null) techRows.push(["Altura focal",          `${fichaSenal.altura_focal} m`,          "Alcance luminoso", fichaSenal.alcance_luminoso != null ? `${fichaSenal.alcance_luminoso} MN` : "—"]);
        if (fichaSenal.caracteristica_luz)        techRows.push(["Característica de luz", fichaSenal.caracteristica_luz,           "Color de luz",     fichaSenal.color_luz ?? "—"]);
        if (fichaSenal.tipo_estructura)            techRows.push(["Tipo de estructura",    fichaSenal.tipo_estructura,              "", ""]);

        autoTable(doc, {
          startY: y,
          body: techRows,
          styles:       { fontSize: 8, cellPadding: 2.5 },
          columnStyles: {
            0: { fontStyle: "bold", fillColor: [237, 244, 252], cellWidth: 40 },
            1: { cellWidth: 50 },
            2: { fontStyle: "bold", fillColor: [237, 244, 252], cellWidth: 40 },
            3: { cellWidth: 50 },
          },
          theme:  "grid",
          margin: { left: margin, right: margin },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 8;
      }

      // ── Observaciones de la señal ─────────────────────────────────────────
      let sectionNum = 3;

      if (fichaSenal.observaciones) {
        y = ensureY(doc, y, pageH, margin);
        sectionTitle(doc, `${sectionNum}. OBSERVACIONES DE LA SEÑAL`, margin, y);
        y += 7;
        sectionNum++;

        const lines = doc.splitTextToSize(fichaSenal.observaciones, contentW);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 60, 80);

        for (const line of lines) {
          if (y > pageH - 20) { doc.addPage(); y = 20; }
          doc.text(line, margin, y);
          y += 5;
        }
        y += 5;
      }

      // ── Avisos activos ────────────────────────────────────────────────────
      y = ensureY(doc, y, pageH, margin);
      sectionTitle(doc, `${sectionNum}. AVISOS ACTIVOS`, margin, y);
      y += 7;
      sectionNum++;

      if (fichaNovedades.length === 0) {
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 120, 140);
        doc.text("Sin avisos activos al momento de la generación.", margin, y);
        y += 10;
      } else {
        autoTable(doc, {
          startY: y,
          head: [["Fecha", "Categoría", "Prioridad", "Estado", "Reportado por", "Descripción"]],
          body: fichaNovedades.map((n) => [
            formatFechaHora(n.fecha_reporte),
            n.categoria?.label ?? "—",
            LABEL_PRIORIDAD[n.prioridad] ?? n.prioridad,
            LABEL_ESTADO_NOV[n.estado]   ?? n.estado,
            n.reportado_por ? `${n.reportado_por.nombre} ${n.reportado_por.apellido}` : "—",
            n.descripcion ?? "—",
          ]),
          styles:     { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [26, 50, 77], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [245, 248, 252] },
          margin: { left: margin, right: margin },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 8;
      }

      // ── Texto libre del usuario ───────────────────────────────────────────
      const fichaTexto = fichaTextos[fichaSenal.id] ?? "";
      if (fichaTexto.trim()) {
        y = ensureY(doc, y, pageH, margin);
        sectionTitle(doc, `${sectionNum}. NOTAS / OBSERVACIONES DEL INSPECTOR`, margin, y);
        y += 7;
        sectionNum++;

        // Box
        const textLines = doc.splitTextToSize(fichaTexto.trim(), contentW - 8);
        const boxH = textLines.length * 5 + 8;

        if (y + boxH > pageH - 20) { doc.addPage(); y = 20; }

        doc.setDrawColor(200, 215, 230);
        doc.setFillColor(250, 252, 255);
        doc.roundedRect(margin, y, contentW, boxH, 2, 2, "FD");

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 60, 80);
        let ty = y + 6;
        for (const line of textLines) {
          if (ty > pageH - 14) { doc.addPage(); ty = 20; }
          doc.text(line, margin + 4, ty);
          ty += 5;
        }
        y = ty + 6;
      }

      // ── Instrucciones y Funciones ─────────────────────────────────────────
      doc.addPage();
      y = 20;

      doc.setFillColor(26, 50, 77);
      doc.rect(0, 0, W, 14, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(`INSTRUCCIONES Y FUNCIONES — ${fichaSenal.categoria?.label?.toUpperCase() ?? "SEÑAL MARÍTIMA"}`, W / 2, 9, { align: "center" });

      y = 22;

      const instrucciones = getInstrucciones(tipoNombre);

      for (const seccion of instrucciones) {
        y = ensureY(doc, y, pageH, margin);

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 50, 77);
        doc.text(seccion.titulo.toUpperCase(), margin, y);
        y += 1.5;
        doc.setDrawColor(74, 158, 221);
        doc.setLineWidth(0.4);
        doc.line(margin, y, W - margin, y);
        y += 5;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 60, 80);

        for (let i = 0; i < seccion.lineas.length; i++) {
          const bullet = `${i + 1}.  `;
          const wrapped = doc.splitTextToSize(seccion.lineas[i], contentW - 10);

          if (y + wrapped.length * 4.5 > pageH - 16) {
            doc.addPage();
            y = 20;
          }

          doc.text(bullet, margin, y);
          doc.text(wrapped, margin + 8, y);
          y += wrapped.length * 4.5 + 1;
        }

        y += 6;
      }

      // ── Firma ─────────────────────────────────────────────────────────────
      if (y + 30 > pageH - 14) { doc.addPage(); y = 20; }
      y = Math.max(y, pageH - 50);

      doc.setDrawColor(180, 195, 210);
      doc.setLineWidth(0.3);
      const col1 = margin;
      const col2 = W / 2 + 5;
      const lineW = contentW / 2 - 10;

      doc.line(col1, y, col1 + lineW, y);
      doc.line(col2, y, col2 + lineW, y);
      y += 4;

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 120, 140);
      doc.text("Firma y sello del Inspector / Encargado", col1, y);
      doc.text("Firma y sello de la Autoridad Supervisora", col2, y);
      y += 4;
      doc.text("Fecha: ______ / ______ / __________", col1, y);
      doc.text("Fecha: ______ / ______ / __________", col2, y);

      // ── Números de página ─────────────────────────────────────────────────
      addPageNumbers(doc);

      doc.save(`ficha_${fichaSenal.codigo}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setGenerando(false);
    }
  }

  // Reset datos when tipo changes
  useEffect(() => {
    setDatos([]);
    setBuscado(false);
  }, [tipo]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 p-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-sm font-semibold tracking-wider text-slate-200 uppercase">Reportes</h1>
          <p className="text-xs text-slate-500 mt-0.5">Generá y descargá reportes en PDF o Excel (CSV)</p>
        </div>

        {tipo !== "ficha" ? (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={descargarCSV}
              disabled={datos.length === 0}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Excel / CSV
            </Button>
            <Button
              onClick={descargarPDF}
              disabled={datos.length === 0 || generando}
              className="flex items-center gap-2"
            >
              {generando ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              {generando ? "Generando…" : `PDF (${datos.length})`}
            </Button>
          </div>
        ) : (
          <Button
            onClick={descargarFichaPDF}
            disabled={!fichaSenal || generando}
            className="flex items-center gap-2"
          >
            {generando ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            {generando ? "Generando…" : "Descargar Ficha PDF"}
          </Button>
        )}
      </div>

      {/* Type selector */}
      <div className="flex gap-2">
        {(["novedades", "senales", "ficha"] as TipoReporte[]).map((t) => (
          <button
            key={t}
            onClick={() => setTipo(t)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              tipo === t
                ? "bg-[#4a9edd]/15 text-[#4a9edd] border border-[#4a9edd]/30"
                : "text-slate-400 hover:bg-[#1d3045] hover:text-slate-200 border border-transparent"
            }`}
          >
            {t === "novedades" ? "Avisos / Novedades" : t === "senales" ? "Señales" : "Ficha de Señal"}
          </button>
        ))}
      </div>

      {/* ── Tabular filters ────────────────────────────────────────────────── */}
      {tipo !== "ficha" && (
        <div className="rounded-lg border border-[#243d57] bg-[#162233] p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Filtros</span>
          </div>

          {tipo === "novedades" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Desde</label>
                <input type="date" value={filtNov.desde}
                  onChange={(e) => setFiltNov((f) => ({ ...f, desde: e.target.value }))}
                  className="rounded-md border border-[#243d57] bg-[#1d3045] px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[#4a9edd]/60" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Hasta</label>
                <input type="date" value={filtNov.hasta}
                  onChange={(e) => setFiltNov((f) => ({ ...f, hasta: e.target.value }))}
                  className="rounded-md border border-[#243d57] bg-[#1d3045] px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[#4a9edd]/60" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Estado</label>
                <select value={filtNov.estado}
                  onChange={(e) => setFiltNov((f) => ({ ...f, estado: e.target.value }))}
                  className="rounded-md border border-[#243d57] bg-[#1d3045] px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[#4a9edd]/60">
                  {ESTADOS_NOV.map((e) => <option key={e} value={e}>{e ? LABEL_ESTADO_NOV[e] : "Todos"}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Prioridad</label>
                <select value={filtNov.prioridad}
                  onChange={(e) => setFiltNov((f) => ({ ...f, prioridad: e.target.value }))}
                  className="rounded-md border border-[#243d57] bg-[#1d3045] px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[#4a9edd]/60">
                  {PRIORIDADES.map((p) => <option key={p} value={p}>{p ? LABEL_PRIORIDAD[p] : "Todas"}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Tipo</label>
                <select value={filtSen.tipo}
                  onChange={(e) => setFiltSen((f) => ({ ...f, tipo: e.target.value }))}
                  className="rounded-md border border-[#243d57] bg-[#1d3045] px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[#4a9edd]/60">
                  {TIPOS_SEN.map((t) => <option key={t} value={t}>{t ? LABEL_TIPO[t] : "Todos"}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Estado</label>
                <select value={filtSen.estado}
                  onChange={(e) => setFiltSen((f) => ({ ...f, estado: e.target.value }))}
                  className="rounded-md border border-[#243d57] bg-[#1d3045] px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[#4a9edd]/60">
                  {ESTADOS_SEN.map((e) => <option key={e} value={e}>{e ? LABEL_ESTADO_SEN[e] : "Todos"}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Provincia</label>
                <input type="text" placeholder="Ej: Buenos Aires" value={filtSen.provincia}
                  onChange={(e) => setFiltSen((f) => ({ ...f, provincia: e.target.value }))}
                  className="rounded-md border border-[#243d57] bg-[#1d3045] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#4a9edd]/60" />
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button onClick={buscar} disabled={cargando} className="flex items-center gap-2">
              {cargando && <Loader2 className="h-4 w-4 animate-spin" />}
              {cargando ? "Cargando…" : "Aplicar filtros"}
            </Button>
          </div>
        </div>
      )}

      {/* ── Ficha de señal ──────────────────────────────────────────────────── */}
      {tipo === "ficha" && (
        <div className="flex flex-col gap-4">

          {/* Search */}
          <div className="rounded-lg border border-[#243d57] bg-[#162233] p-4">
            <p className="text-sm font-medium text-slate-300 mb-3">Seleccionar señal</p>

            <div className="relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar por código o nombre…"
                  value={fichaQuery}
                  onChange={(e) => buscarSenales(e.target.value)}
                  onFocus={() => fichaQuery && setShowResultados(true)}
                  className="w-full rounded-md border border-[#243d57] bg-[#1d3045] pl-9 pr-9 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#4a9edd]/60"
                />
                {fichaQuery && (
                  <button onClick={limpiarFicha} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {showResultados && (fichaResultados.length > 0 || buscandoSenal) && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-[#243d57] bg-[#162233] shadow-2xl shadow-black/40 overflow-hidden">
                  {buscandoSenal ? (
                    <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Buscando…
                    </div>
                  ) : (
                    fichaResultados.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => seleccionarSenal(s)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1d3045] transition-colors text-left"
                      >
                        <span className="font-mono text-xs text-[#4a9edd] shrink-0 w-20">{s.codigo}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-200 truncate">{s.nombre}</p>
                          <p className="text-xs text-slate-500">{s.categoria?.label} · {s.provincia}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${ESTADO_BADGE[s.estado?.nombre ?? ""] ?? "bg-slate-500/20 text-slate-400 border-slate-500/30"}`}>
                          {s.estado?.label ?? "—"}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {fichaSenal && (
            <>
              <div className="rounded-lg border border-[#243d57] bg-[#162233] p-4">
                <p className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider mb-4">Vista previa de la señal</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <InfoCell label="Código"   value={<span className="font-mono text-[#4a9edd]">{fichaSenal.codigo}</span>} />
                  <InfoCell label="Tipo"     value={fichaSenal.categoria?.label ?? "—"} />
                  <InfoCell label="Estado"   value={
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${ESTADO_BADGE[fichaSenal.estado?.nombre ?? ""] ?? ""}`}>
                      {fichaSenal.estado?.label ?? "—"}
                    </span>
                  } />
                  <InfoCell label="Provincia" value={fichaSenal.provincia} />
                </div>

                {fichaSenal.ubicacion_descripcion && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="h-3 w-3 text-slate-600" />
                    {fichaSenal.ubicacion_descripcion}
                  </div>
                )}

                {(fichaSenal.altura_focal != null || fichaSenal.alcance_luminoso != null) && (
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    {fichaSenal.altura_focal     != null && <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-slate-600" /> {fichaSenal.altura_focal} m focal</span>}
                    {fichaSenal.alcance_luminoso != null && <span>{fichaSenal.alcance_luminoso} MN alcance</span>}
                  </div>
                )}

                {fichaNovedades.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#243d57]">
                    <p className="text-xs text-amber-400 font-medium">{fichaNovedades.length} aviso{fichaNovedades.length > 1 ? "s" : ""} activo{fichaNovedades.length > 1 ? "s" : ""}</p>
                  </div>
                )}
              </div>

              {/* Texto libre */}
              <div className="rounded-lg border border-[#243d57] bg-[#162233] p-4">
                <label className="text-sm font-medium text-slate-300 block mb-2">
                  Notas / Observaciones del inspector
                  <span className="ml-2 text-xs text-slate-500 font-normal">(opcional — se incluye en el PDF)</span>
                </label>
                <textarea
                  value={fichaTextos[fichaSenal.id] ?? ""}
                  onChange={(e) =>
                    setFichaTextos((prev) => ({ ...prev, [fichaSenal.id]: e.target.value }))
                  }
                  rows={6}
                  placeholder="Escribí acá tus observaciones, conclusiones de la inspección, recomendaciones de mantenimiento, etc."
                  className="w-full rounded-md border border-[#243d57] bg-[#1d3045] px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#4a9edd]/60 resize-none"
                />
                <p className="text-right text-xs text-slate-600 mt-1">{(fichaTextos[fichaSenal.id] ?? "").length} caracteres</p>
              </div>

              {/* Instructions toggle */}
              <div className="rounded-lg border border-[#243d57] bg-[#162233] overflow-hidden">
                <button
                  onClick={() => setShowInstrucciones((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#1d3045]/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#4a9edd] uppercase tracking-wider">
                      Instrucciones y Funciones
                    </span>
                    <span className="text-xs text-slate-500">
                      ({fichaSenal.categoria?.label ?? "Señal"}) — se incluyen en el PDF
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showInstrucciones ? "rotate-180" : ""}`} />
                </button>

                {showInstrucciones && (
                  <div className="border-t border-[#243d57] px-4 py-4 flex flex-col gap-5">
                    {getInstrucciones(fichaSenal.categoria?.nombre ?? "").map((sec) => (
                      <div key={sec.titulo}>
                        <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <span className="h-px flex-1 bg-[#243d57]" />
                          {sec.titulo}
                          <span className="h-px flex-1 bg-[#243d57]" />
                        </p>
                        <ol className="flex flex-col gap-1.5 pl-1">
                          {sec.lineas.map((l, i) => (
                            <li key={i} className="text-xs text-slate-400 flex gap-2.5 leading-relaxed">
                              <span className="text-[#4a9edd] shrink-0 font-mono">{i + 1}.</span>
                              {l}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {!fichaSenal && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-10 w-10 text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">Buscá y seleccioná una señal para generar su ficha técnica</p>
              <p className="text-xs text-slate-600 mt-1">El PDF incluirá todos los datos técnicos, avisos activos, tus notas e instrucciones operacionales</p>
            </div>
          )}
        </div>
      )}

      {/* ── Tabular preview ──────────────────────────────────────────────────── */}
      {tipo !== "ficha" && buscado && (
        <div className="rounded-lg border border-[#243d57] overflow-hidden">
          {datos.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-500">
              No hay registros para los filtros seleccionados
            </div>
          ) : tipo === "novedades" ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#1d3045]">
                  <tr>
                    {["Fecha", "Señal", "Categoría", "Prioridad", "Estado", "Reportado por", "Descripción"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1d3045]">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {datos.map((n: any) => (
                    <tr key={n.id} className="hover:bg-[#1d3045]/50 transition-colors">
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap text-xs">{formatFechaHora(n.fecha_reporte)}</td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                        {n.senal ? <span className="font-mono text-xs text-[#4a9edd]">{n.senal.codigo}</span> : "—"}
                        {n.senal?.nombre && <span className="ml-1 text-slate-400 text-xs">— {n.senal.nombre}</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{n.categoria?.label ?? "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><PrioridadBadge p={n.prioridad} /></td>
                      <td className="px-4 py-3 whitespace-nowrap"><EstadoNovBadge e={n.estado} /></td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                        {n.reportado_por ? `${n.reportado_por.nombre} ${n.reportado_por.apellido}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs max-w-xs truncate">{n.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#1d3045]">
                  <tr>
                    {["Código", "Nombre", "Tipo", "Estado", "Provincia", "Altura focal", "Alcance"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1d3045]">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {datos.map((s: any) => (
                    <tr key={s.id} className="hover:bg-[#1d3045]/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#4a9edd]">{s.codigo}</td>
                      <td className="px-4 py-3 text-slate-200">{s.nombre}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{s.categoria?.label ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-300">{s.estado?.label ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{s.provincia}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{s.altura_focal != null ? `${s.altura_focal} m` : "—"}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{s.alcance_luminoso != null ? `${s.alcance_luminoso} mn` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PDF helpers ──────────────────────────────────────────────────────────────

import type jsPDF from "jspdf";

function sectionTitle(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 50, 77);
  doc.text(text, x, y);
}

function ensureY(doc: jsPDF, y: number, pageH: number, margin: number): number {
  if (y > pageH - 40) {
    doc.addPage();
    return margin + 6;
  }
  return y;
}

function checkPageBreak(doc: jsPDF, y: number, pageH: number, _margin: number): void {
  if (y > pageH - 40) doc.addPage();
}

function addPageNumbers(doc: jsPDF) {
  const pageCount = (doc as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160);
    doc.text(
      `Página ${i} de ${pageCount}  —  Ministerio de Defensa — República Argentina`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: "center" }
    );
  }
}

// ─── Badge colors ─────────────────────────────────────────────────────────────

const ESTADO_BADGE: Record<string, string> = {
  en_servicio:  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  sin_servicio: "bg-red-500/20 text-red-400 border-red-500/30",
  caido:        "bg-orange-500/20 text-orange-400 border-orange-500/30",
  dañado:       "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

// ─── Small UI components ──────────────────────────────────────────────────────

function InfoCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm text-slate-200">{value}</p>
    </div>
  );
}

function PrioridadBadge({ p }: { p: string }) {
  const map: Record<string, string> = {
    critica: "bg-red-500/20 text-red-400 border-red-500/30",
    alta:    "bg-orange-500/20 text-orange-400 border-orange-500/30",
    media:   "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    baja:    "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };
  const labels: Record<string, string> = { critica: "Crítica", alta: "Alta", media: "Media", baja: "Baja" };
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${map[p] ?? ""}`}>
      {labels[p] ?? p}
    </span>
  );
}

function EstadoNovBadge({ e }: { e: string }) {
  const map: Record<string, string> = {
    pendiente:  "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    en_curso:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
    resuelta:   "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    cancelada:  "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };
  const labels: Record<string, string> = { pendiente: "Pendiente", en_curso: "En curso", resuelta: "Resuelta", cancelada: "Cancelada" };
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${map[e] ?? ""}`}>
      {labels[e] ?? e}
    </span>
  );
}
