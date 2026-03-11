// ─── Roles ────────────────────────────────────────────────────────────────────

export type RolUsuario =
  | "administrador"
  | "inspector_regional"
  | "encargado_estacion"
  | "observador";

// ─── String slug helpers (for lookups / badges) ───────────────────────────────

export type TipoSenal      = "faro" | "boya" | "baliza";
export type EstadoSenalSlug = "en_servicio" | "sin_servicio" | "caido" | "dañado";

// ─── Prioridad / Estado novedad ───────────────────────────────────────────────

export type PrioridadNovedad = "critica" | "alta" | "media" | "baja";
export type EstadoNovedad    = "pendiente" | "en_curso" | "resuelta" | "cancelada";

// ─── Lookup tables ────────────────────────────────────────────────────────────

export interface CategoriaSenal {
  id:          number;
  nombre:      string;   // slug: 'faro', 'boya', 'baliza'
  label:       string;
  descripcion: string | null;
  icono:       string | null;
  activo:      boolean;
}

export interface EstadoSenal {
  id:          number;
  nombre:      string;   // slug: 'en_servicio', 'sin_servicio', 'caido', 'dañado'
  label:       string;
  color_hex:   string;
  descripcion: string | null;
  activo:      boolean;
}

export interface CategoriaNovedad {
  id:          number;
  nombre:      string;
  label:       string;
  descripcion: string | null;
  icono:       string | null;
  activo:      boolean;
}

export interface OpcionNovedad {
  id:                   number;
  categoria_id:         number;
  label:                string;
  requiere_descripcion: boolean;
  activo:               boolean;
}

// ─── Perfil ───────────────────────────────────────────────────────────────────

export interface Perfil {
  id:         string;
  clerk_id:   string;
  nombre:     string;
  apellido:   string;
  email:      string;
  rol:        RolUsuario;
  activo:     boolean;
  created_at: string;
  updated_at: string;
}

// ─── Señal ────────────────────────────────────────────────────────────────────

export interface Senal {
  id:                    string;
  nombre:                string;
  codigo:                string;
  categoria_id:          number;
  estado_id:             number;
  lat:                   number;
  lng:                   number;
  ubicacion_descripcion: string;
  provincia:             string;
  encargado_id:          string | null;

  // Datos técnicos
  altura_focal:       number | null;
  alcance_luminoso:   number | null;
  caracteristica_luz: string | null;
  color_luz:          string | null;
  tipo_estructura:    string | null;
  año_instalacion:    number | null;
  ultima_revision:    string | null;
  observaciones:      string | null;

  activo:     boolean;
  created_at: string;
  updated_at: string;

  // Joins opcionales
  categoria?:  CategoriaSenal;
  estado?:     EstadoSenal;
  encargado?:  Perfil;
}

// ─── Novedad ──────────────────────────────────────────────────────────────────

export interface Novedad {
  id:               string;
  senal_id:         string;
  categoria_id:     number;
  opcion_id:        number | null;
  descripcion:      string;
  prioridad:        PrioridadNovedad;
  estado:           EstadoNovedad;
  reportado_por_id: string;
  asignado_a_id:    string | null;
  fecha_reporte:    string;
  fecha_resolucion: string | null;
  created_at:       string;
  updated_at:       string;

  // Joins opcionales
  senal?:         Pick<Senal, "id" | "nombre" | "codigo">;
  categoria?:     CategoriaNovedad;
  opcion?:        OpcionNovedad;
  reportado_por?: Pick<Perfil, "id" | "nombre" | "apellido">;
  asignado_a?:    Pick<Perfil, "id" | "nombre" | "apellido">;
}

// ─── Forms ────────────────────────────────────────────────────────────────────

export type SenalFormData = Omit<Senal,
  "id" | "created_at" | "updated_at" | "categoria" | "estado" | "encargado"
>;

export type NovedadFormData = Omit<Novedad,
  "id" | "created_at" | "updated_at" | "senal" | "categoria" | "opcion" |
  "reportado_por" | "asignado_a" | "fecha_reporte" | "fecha_resolucion"
>;

export type PerfilFormData = Omit<Perfil, "id" | "clerk_id" | "created_at" | "updated_at">;

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// ─── Filtros ──────────────────────────────────────────────────────────────────

export interface FiltrosSenal {
  categoria_id?: number;
  estado_id?:    number;
  provincia?:    string;
  busqueda?:     string;
}

export interface FiltrosNovedad {
  senal_id?:     string;
  categoria_id?: number;
  prioridad?:    PrioridadNovedad;
  estado?:       EstadoNovedad;
  busqueda?:     string;
}

// ─── Alias for backward compat ────────────────────────────────────────────────
export type Usuario = Perfil;
