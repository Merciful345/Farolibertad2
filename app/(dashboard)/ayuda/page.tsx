"use client";

import { useState } from "react";
import {
  LayoutDashboard, Anchor, Map, AlertCircle, Users,
  FileDown, ChevronDown, BookOpen, CheckCircle2,
  Search, PenLine, Bell, UserCircle, Shield,
} from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────────────────────

interface Paso {
  titulo: string;
  detalle: string;
}

interface Seccion {
  id:      string;
  icono:   React.ReactNode;
  titulo:  string;
  resumen: string;
  pasos:   Paso[];
  roles?:  string;
}

const SECCIONES: Seccion[] = [
  {
    id:      "dashboard",
    icono:   <LayoutDashboard className="h-5 w-5" />,
    titulo:  "Dashboard",
    resumen: "Pantalla de inicio con el resumen general del sistema.",
    pasos: [
      {
        titulo:  "Ver estadísticas globales",
        detalle: "Al ingresar al Dashboard verás tarjetas con el total de señales activas, faros, boyas, balizas y el conteo de avisos pendientes, en curso y resueltos. Estos datos se actualizan automáticamente cada vez que entrás.",
      },
      {
        titulo:  "Últimas novedades",
        detalle: "Debajo de las estadísticas encontrás una tabla con las novedades más recientes del sistema, ordenadas por fecha. Hacé click en cualquier fila para ir al detalle del aviso.",
      },
      {
        titulo:  "Navegar desde el Dashboard",
        detalle: "Usá los botones o links de las tarjetas para ir directamente a la sección correspondiente. Por ejemplo, la tarjeta de avisos pendientes te lleva a la lista filtrada.",
      },
    ],
  },
  {
    id:      "senales",
    icono:   <Anchor className="h-5 w-5" />,
    titulo:  "Estaciones (Señales)",
    resumen: "Gestión de faros, boyas y balizas. Podés ver, filtrar, crear y editar señales marítimas.",
    pasos: [
      {
        titulo:  "Ver la lista de señales",
        detalle: "Ingresá a 'Estaciones' desde la barra superior. Las señales aparecen en tabs: Faros, Boyas y Balizas. Cada tab muestra una tabla con código, nombre, estado, provincia y encargado.",
      },
      {
        titulo:  "Filtrar señales",
        detalle: "Usá la barra de búsqueda para buscar por nombre o código. También podés filtrar por estado (En servicio, Sin servicio, Caído, Dañado) usando el selector correspondiente.",
      },
      {
        titulo:  "Ver el detalle de una señal",
        detalle: "Hacé click en cualquier fila de la tabla para abrir la página de detalle. Ahí verás todos los datos técnicos (altura focal, alcance luminoso, característica de luz), la ubicación, el encargado y los avisos activos asociados.",
      },
      {
        titulo:  "Crear una señal nueva",
        detalle: "Hacé click en el botón 'Nueva señal' (esquina superior derecha de la lista). Completá el formulario con todos los datos requeridos: nombre, tipo, provincia, coordenadas y estado. El código se asigna automáticamente.",
      },
      {
        titulo:  "Editar una señal",
        detalle: "Desde el detalle de la señal, hacé click en 'Editar'. Modificá los campos necesarios y guardá. También podés dar de baja lógica la señal desde esa pantalla (la señal no se elimina, solo se marca como inactiva).",
      },
      {
        titulo:  "Descargar la ficha técnica",
        detalle: "Desde el detalle de la señal, hacé click en 'Ficha PDF'. Esto te lleva a la sección de Reportes con esa señal preseleccionada, donde podés agregar notas y descargar el PDF completo.",
      },
    ],
    roles: "Crear y editar: Administrador y Encargado de estación. Ver: todos los roles.",
  },
  {
    id:      "mapa",
    icono:   <Map className="h-5 w-5" />,
    titulo:  "Mapa",
    resumen: "Visualización geográfica de todas las señales marítimas con filtros por estado.",
    pasos: [
      {
        titulo:  "Ver las señales en el mapa",
        detalle: "El mapa muestra todas las señales activas como marcadores con colores según su estado: verde (en servicio), rojo (sin servicio), naranja (caído), amarillo (dañado). Hacé zoom con la rueda del mouse o los botones + / −.",
      },
      {
        titulo:  "Filtrar por estado",
        detalle: "Usá los checkboxes del panel lateral para mostrar u ocultar señales según su estado. Por ejemplo, podés ver solo las que están 'Caídas' para priorizar intervenciones.",
      },
      {
        titulo:  "Ver info de una señal",
        detalle: "Hacé click sobre cualquier marcador del mapa para ver un popup con el nombre, código, tipo y estado de la señal. Desde ese popup podés ir directamente al detalle.",
      },
    ],
  },
  {
    id:      "avisos",
    icono:   <AlertCircle className="h-5 w-5" />,
    titulo:  "Avisos / Novedades",
    resumen: "Registro y seguimiento de incidencias, novedades operacionales y problemas en las señales.",
    pasos: [
      {
        titulo:  "Ver los avisos",
        detalle: "La sección de Avisos muestra todas las novedades organizadas por categoría (cableado, batería, óptico, vientos, etc.). Usá los tabs 'Activos' e 'Inactivos' para diferenciar los avisos en curso de los ya resueltos o cancelados.",
      },
      {
        titulo:  "Crear un aviso nuevo",
        detalle: "Hacé click en 'Nuevo aviso'. Seleccioná la señal afectada, elegí la categoría del problema y luego la opción específica dentro de esa categoría. Completá la descripción, asigná una prioridad (Crítica, Alta, Media, Baja) y guardá.",
      },
      {
        titulo:  "Categorías disponibles",
        detalle: "Las categorías de novedades son: Cableado, Visibilidad, Vientos, Tensores, Caja estanca, Escaleras, Guarda hombre, Batería, Puertas, Vidrios, Paneles, Óptico, Característica diurna, Característica nocturna y Estructura.",
      },
      {
        titulo:  "Cambiar el estado de un aviso",
        detalle: "Desde el detalle del aviso podés avanzar su estado: Pendiente → En curso → Resuelta o Cancelada. Cada cambio queda registrado con la fecha correspondiente.",
      },
      {
        titulo:  "Ver avisos de una señal específica",
        detalle: "Desde el detalle de una señal, el panel derecho muestra sus avisos activos. Hacé click en 'Ver historial completo' para ver todos los avisos (activos e inactivos) de esa señal.",
      },
    ],
    roles: "Crear avisos: todos los roles. Cambiar estado: Administrador y Encargado. Solo lectura: Inspector regional y Observador.",
  },
  {
    id:      "usuarios",
    icono:   <Users className="h-5 w-5" />,
    titulo:  "Usuarios",
    resumen: "Gestión de cuentas de usuario y asignación de roles dentro del sistema.",
    pasos: [
      {
        titulo:  "Ver la lista de usuarios",
        detalle: "La sección Usuarios muestra todos los perfiles registrados con nombre, email, rol y estado (activo/inactivo). Los roles están codificados por color para identificarlos rápidamente.",
      },
      {
        titulo:  "Roles del sistema",
        detalle: "Existen 4 roles: Administrador (acceso total), Inspector regional (puede ver todo, solo lectura), Encargado de estación (gestiona señales y avisos de su zona), Observador (solo lectura).",
      },
      {
        titulo:  "Crear un usuario nuevo",
        detalle: "Hacé click en 'Nuevo usuario'. Completá nombre, apellido, email y seleccioná el rol. El usuario recibirá una invitación para activar su cuenta.",
      },
      {
        titulo:  "Editar un usuario",
        detalle: "Hacé click en el botón de edición de la fila. Podés cambiar nombre, apellido y rol. Los Encargados no pueden modificar cuentas de Administradores.",
      },
      {
        titulo:  "Dar de baja un usuario",
        detalle: "Desde la pantalla de edición, usá la opción 'Dar de baja'. El usuario queda inactivo y no puede ingresar al sistema, pero sus datos históricos se conservan.",
      },
    ],
    roles: "Administrador y Encargado de estación. Los Encargados no pueden gestionar Administradores.",
  },
  {
    id:      "reportes",
    icono:   <FileDown className="h-5 w-5" />,
    titulo:  "Reportes",
    resumen: "Generación y descarga de reportes en PDF: listados de novedades, señales y fichas técnicas individuales.",
    pasos: [
      {
        titulo:  "Reporte de Avisos / Novedades",
        detalle: "Seleccioná el tab 'Avisos / Novedades'. Configurá el rango de fechas (desde/hasta), filtrá por estado o prioridad si lo necesitás. Hacé click en 'Aplicar filtros' para ver la preview. Si los resultados son correctos, hacé click en 'Descargar PDF'.",
      },
      {
        titulo:  "Reporte de Señales",
        detalle: "Seleccioná el tab 'Señales'. Podés filtrar por tipo (Faro, Boya, Baliza), estado y provincia. Aplicá los filtros y descargá el PDF con la tabla resultante.",
      },
      {
        titulo:  "Ficha técnica de una señal",
        detalle: "Seleccioná el tab 'Ficha de Señal'. Buscá la señal por nombre o código en el buscador. Al seleccionarla, verás una vista previa con sus datos, los avisos activos y la sección de instrucciones.",
      },
      {
        titulo:  "Agregar notas a la ficha",
        detalle: "En el área 'Notas / Observaciones del inspector' podés escribir texto libre que se incluirá en el PDF como una sección diferenciada. Cada señal guarda su propia nota de forma independiente.",
      },
      {
        titulo:  "Ver las instrucciones y funciones",
        detalle: "Hacé click en el acordeón 'Instrucciones y Funciones' para ver el contenido que se incluirá en el PDF. Este contenido es específico según el tipo de señal (Faro, Boya o Baliza) e incluye funciones, obligaciones del encargado, procedimientos de emergencia y normativa aplicable.",
      },
      {
        titulo:  "Descargar la ficha PDF",
        detalle: "Una vez que la señal está seleccionada, hacé click en 'Descargar Ficha PDF'. El PDF generado incluye: encabezado institucional, identificación, datos técnicos, observaciones, avisos activos, tus notas y las instrucciones/funciones. Al final hay espacio para dos firmas.",
      },
      {
        titulo:  "Acceso rápido desde el detalle de señal",
        detalle: "Desde la página de detalle de cualquier señal, el botón 'Ficha PDF' te lleva directamente a Reportes con esa señal preseleccionada.",
      },
    ],
  },
  {
    id:      "perfil",
    icono:   <UserCircle className="h-5 w-5" />,
    titulo:  "Mi Perfil",
    resumen: "Edición de tus datos personales dentro del sistema.",
    pasos: [
      {
        titulo:  "Acceder al perfil",
        detalle: "Hacé click en el ícono de perfil (persona) en la barra superior derecha, o en el avatar de Clerk.",
      },
      {
        titulo:  "Editar nombre y apellido",
        detalle: "En la página de perfil podés modificar tu nombre y apellido. El email y el rol no se pueden cambiar desde acá — contactá a un Administrador para eso.",
      },
    ],
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AyudaPage() {
  const [abierta, setAbierta] = useState<string | null>("dashboard");
  const [busqueda, setBusqueda] = useState("");

  const filtradas = busqueda.trim()
    ? SECCIONES.filter((s) =>
        s.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.resumen.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.pasos.some(
          (p) =>
            p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.detalle.toLowerCase().includes(busqueda.toLowerCase())
        )
      )
    : SECCIONES;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4a9edd]/15 border border-[#4a9edd]/30">
          <BookOpen className="h-5 w-5 text-[#4a9edd]" />
        </div>
        <div>
          <h1 className="font-mono text-sm font-semibold tracking-wider text-slate-200 uppercase">
            Centro de Ayuda
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Guía de uso del Sistema de Gestión de Señales Marítimas — FAROLIBERTAD
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar en la ayuda…"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setAbierta(null);
          }}
          className="w-full rounded-md border border-[#243d57] bg-[#162233] pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#4a9edd]/60"
        />
      </div>

      {/* Quick nav */}
      {!busqueda && (
        <div className="flex flex-wrap gap-2">
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setAbierta(s.id);
                setTimeout(() => {
                  document.getElementById(`seccion-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 50);
              }}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                abierta === s.id
                  ? "bg-[#4a9edd]/15 text-[#4a9edd] border-[#4a9edd]/30"
                  : "text-slate-400 border-[#243d57] hover:border-[#4a9edd]/30 hover:text-[#4a9edd]"
              }`}
            >
              {s.icono}
              {s.titulo}
            </button>
          ))}
        </div>
      )}

      {/* Sections */}
      <div className="flex flex-col gap-3">
        {filtradas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-8 w-8 text-slate-700 mb-3" />
            <p className="text-sm text-slate-500">No se encontraron resultados para &quot;{busqueda}&quot;</p>
          </div>
        )}

        {filtradas.map((s) => {
          const isOpen = abierta === s.id;
          return (
            <div
              key={s.id}
              id={`seccion-${s.id}`}
              className="rounded-lg border border-[#243d57] bg-[#162233] overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => setAbierta(isOpen ? null : s.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#1d3045]/40 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#4a9edd]">{s.icono}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{s.titulo}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.resumen}</p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-500 shrink-0 ml-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Content */}
              {isOpen && (
                <div className="border-t border-[#243d57] px-5 py-5 flex flex-col gap-4">

                  {/* Roles pill */}
                  {s.roles && (
                    <div className="flex items-start gap-2 rounded-md bg-[#1d3045] border border-[#243d57] px-3 py-2.5">
                      <Shield className="h-3.5 w-3.5 text-[#4a9edd] shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <span className="text-slate-300 font-medium">Permisos: </span>
                        {s.roles}
                      </p>
                    </div>
                  )}

                  {/* Steps */}
                  <ol className="flex flex-col gap-4">
                    {s.pasos.map((paso, i) => (
                      <li key={i} className="flex gap-4">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4a9edd]/10 border border-[#4a9edd]/20 mt-0.5">
                          <span className="text-xs font-mono text-[#4a9edd] font-semibold">{i + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200 mb-1 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/70 shrink-0" />
                            {paso.titulo}
                          </p>
                          <p className="text-xs text-slate-400 leading-relaxed">{paso.detalle}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-xs text-slate-600 text-center pb-2">
        ¿Encontraste un error o tenés una consulta? Contactá al administrador del sistema.
      </p>
    </div>
  );
}
