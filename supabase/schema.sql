-- =============================================================================
-- FAROLIBERTAD — Schema completo
-- Ministerio de Defensa, República Argentina
-- =============================================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- =============================================================================
-- TIPOS
-- =============================================================================

create type rol_usuario as enum (
  'administrador',
  'inspector_regional',
  'encargado_estacion',
  'observador'
);

create type prioridad_novedad as enum ('critica', 'alta', 'media', 'baja');
create type estado_novedad    as enum ('pendiente', 'en_curso', 'resuelta', 'cancelada');

-- =============================================================================
-- TABLAS DE LOOKUP (extensibles)
-- =============================================================================

-- Categorías de señales: faro, boya, baliza (y las que se agreguen)
create table categorias_senales (
  id          serial primary key,
  nombre      text not null unique,   -- slug: 'faro', 'boya', 'baliza'
  label       text not null,
  descripcion text,
  icono       text,                   -- nombre del ícono Lucide
  activo      boolean not null default true
);

-- Estados operativos de señales
create table estados_senales (
  id          serial primary key,
  nombre      text not null unique,   -- slug: 'en_servicio', 'sin_servicio', etc.
  label       text not null,
  color_hex   text not null,          -- para marcadores en mapa
  descripcion text,
  activo      boolean not null default true
);

-- Categorías de novedades (15 tipos de problema)
create table categorias_novedades (
  id          serial primary key,
  nombre      text not null unique,   -- slug
  label       text not null,
  descripcion text,
  icono       text,
  activo      boolean not null default true
);

-- Opciones específicas por categoría de novedad
create table opciones_novedades (
  id                   serial primary key,
  categoria_id         int not null references categorias_novedades(id) on delete cascade,
  label                text not null,
  requiere_descripcion boolean not null default false,
  activo               boolean not null default true
);

-- =============================================================================
-- PERFILES (sincronizado con Clerk via webhook)
-- =============================================================================

create table perfiles (
  id          uuid primary key default uuid_generate_v4(),
  clerk_id    text unique not null,
  nombre      text not null,
  apellido    text not null,
  email       text unique not null,
  rol         rol_usuario not null default 'observador',
  activo      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- =============================================================================
-- SEÑALES
-- =============================================================================

create table senales (
  id                    uuid primary key default uuid_generate_v4(),
  nombre                text not null,
  codigo                text unique not null,      -- ej: FAR-0001
  categoria_id          int not null references categorias_senales(id),
  estado_id             int not null references estados_senales(id),
  lat                   numeric(10, 7) not null,
  lng                   numeric(10, 7) not null,
  ubicacion_descripcion text not null default '',
  provincia             text not null,
  encargado_id          uuid references perfiles(id) on delete set null,

  -- Datos técnicos
  altura_focal          numeric,          -- metros sobre nivel del mar
  alcance_luminoso      numeric,          -- millas náuticas
  caracteristica_luz    text,             -- ej: "Gp Oc(2) 10s"
  color_luz             text,
  tipo_estructura       text,
  año_instalacion       int,
  ultima_revision       date,
  observaciones         text,

  activo      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_senales_categoria on senales(categoria_id);
create index idx_senales_estado    on senales(estado_id);
create index idx_senales_provincia on senales(provincia);
create index idx_senales_encargado on senales(encargado_id);

-- =============================================================================
-- NOVEDADES
-- =============================================================================

create table novedades (
  id                uuid primary key default uuid_generate_v4(),
  senal_id          uuid not null references senales(id) on delete cascade,
  categoria_id      int not null references categorias_novedades(id),
  opcion_id         int references opciones_novedades(id) on delete set null,
  descripcion       text not null default '',
  prioridad         prioridad_novedad not null default 'media',
  estado            estado_novedad not null default 'pendiente',
  reportado_por_id  uuid not null references perfiles(id),
  asignado_a_id     uuid references perfiles(id) on delete set null,
  fecha_reporte     timestamptz not null default now(),
  fecha_resolucion  timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_novedades_senal      on novedades(senal_id);
create index idx_novedades_categoria  on novedades(categoria_id);
create index idx_novedades_estado     on novedades(estado);
create index idx_novedades_prioridad  on novedades(prioridad);
create index idx_novedades_reportado  on novedades(reportado_por_id);

-- =============================================================================
-- TRIGGERS — updated_at automático
-- =============================================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_perfiles_updated_at
  before update on perfiles
  for each row execute function set_updated_at();

create trigger trg_senales_updated_at
  before update on senales
  for each row execute function set_updated_at();

create trigger trg_novedades_updated_at
  before update on novedades
  for each row execute function set_updated_at();

-- =============================================================================
-- FUNCIÓN AUXILIAR PARA RLS — obtener rol del usuario actual
-- Clerk pone el clerk_id en auth.jwt() ->> 'sub'
-- =============================================================================

create or replace function get_my_rol()
returns rol_usuario language sql stable security definer as $$
  select rol from perfiles where clerk_id = (auth.jwt() ->> 'sub') and activo = true
$$;

create or replace function get_my_perfil_id()
returns uuid language sql stable security definer as $$
  select id from perfiles where clerk_id = (auth.jwt() ->> 'sub') and activo = true
$$;

-- =============================================================================
-- RLS — Row Level Security
-- =============================================================================

alter table perfiles            enable row level security;
alter table senales             enable row level security;
alter table novedades           enable row level security;
alter table categorias_senales  enable row level security;
alter table estados_senales     enable row level security;
alter table categorias_novedades enable row level security;
alter table opciones_novedades  enable row level security;

-- ── Tablas de lookup: todos los autenticados pueden leer ─────────────────────
create policy "lookup: lectura autenticados" on categorias_senales
  for select using (auth.role() = 'authenticated');

create policy "lookup: lectura autenticados" on estados_senales
  for select using (auth.role() = 'authenticated');

create policy "lookup: lectura autenticados" on categorias_novedades
  for select using (auth.role() = 'authenticated');

create policy "lookup: lectura autenticados" on opciones_novedades
  for select using (auth.role() = 'authenticated');

-- Solo administrador puede modificar lookups
create policy "lookup: escritura admin" on categorias_senales
  for all using (get_my_rol() = 'administrador');

create policy "lookup: escritura admin" on estados_senales
  for all using (get_my_rol() = 'administrador');

create policy "lookup: escritura admin" on categorias_novedades
  for all using (get_my_rol() = 'administrador');

create policy "lookup: escritura admin" on opciones_novedades
  for all using (get_my_rol() = 'administrador');

-- ── Perfiles ─────────────────────────────────────────────────────────────────
-- Todos ven todos los perfiles (necesario para mostrar nombres en novedades)
create policy "perfiles: lectura autenticados" on perfiles
  for select using (auth.role() = 'authenticated');

-- Solo administrador gestiona usuarios
create policy "perfiles: escritura admin" on perfiles
  for all using (get_my_rol() = 'administrador');

-- Cada usuario puede actualizar su propio perfil (nombre, etc.)
create policy "perfiles: editar propio" on perfiles
  for update using (clerk_id = (auth.jwt() ->> 'sub'));

-- ── Señales ──────────────────────────────────────────────────────────────────
-- Todos los autenticados pueden ver señales
create policy "senales: lectura autenticados" on senales
  for select using (auth.role() = 'authenticated');

-- Administrador e Inspector Regional pueden crear/editar/borrar señales
create policy "senales: escritura admin e inspector" on senales
  for all using (get_my_rol() in ('administrador', 'inspector_regional'));

-- ── Novedades ─────────────────────────────────────────────────────────────────
-- Todos los autenticados ven novedades
create policy "novedades: lectura autenticados" on novedades
  for select using (auth.role() = 'authenticated');

-- Admin e Inspector ven y modifican todo
create policy "novedades: escritura admin e inspector" on novedades
  for all using (get_my_rol() in ('administrador', 'inspector_regional'));

-- Encargado solo ve y carga novedades de sus señales asignadas
create policy "novedades: encargado inserta sus senales" on novedades
  for insert with check (
    get_my_rol() = 'encargado_estacion'
    and exists (
      select 1 from senales
      where senales.id = senal_id
        and senales.encargado_id = get_my_perfil_id()
    )
  );

create policy "novedades: encargado lee sus senales" on novedades
  for select using (
    get_my_rol() = 'encargado_estacion'
    and exists (
      select 1 from senales
      where senales.id = senal_id
        and senales.encargado_id = get_my_perfil_id()
    )
  );

-- =============================================================================
-- SEED — Datos iniciales
-- =============================================================================

-- Categorías de señales
insert into categorias_senales (nombre, label, descripcion, icono) values
  ('faro',    'Faro',    'Estructura fija de gran altura con luz de largo alcance', 'Lighthouse'),
  ('boya',    'Boya',    'Flotador anclado al fondo marino con luz o marca', 'Anchor'),
  ('baliza',  'Baliza',  'Marca fija de menor escala en costa o bajo marítimo', 'MapPin');

-- Estados de señales
insert into estados_senales (nombre, label, color_hex, descripcion) values
  ('en_servicio',    'En servicio',    '#22c55e', 'Operando con normalidad'),
  ('sin_servicio',   'Sin servicio',   '#ef4444', 'Fuera de operación, requiere atención urgente'),
  ('caido',          'Caído',          '#f97316', 'Señal inoperante por falla técnica o daño'),
  ('dañado',         'Dañado',         '#eab308', 'Con daño parcial, operación degradada');

-- Categorías de novedades (15)
insert into categorias_novedades (nombre, label, descripcion, icono) values
  ('optica',                'Óptica',                   'Fallo en lente, lámpara, rotación o sistema luminoso',                    'Lightbulb'),
  ('energia_bateria',       'Energía / Batería',        'Batería descargada, fallo en panel solar o sistema de carga',             'Battery'),
  ('cableado',              'Cableado',                 'Cable cortado, corrosión, conexiones flojas o cortocircuito',             'Zap'),
  ('estructura',            'Estructura',               'Daño estructural, corrosión severa, impacto o deformación',               'Building2'),
  ('fondeo',                'Fondeo',                   'Boya desplazada, cadena rota o fondeo comprometido',                      'Anchor'),
  ('señalizacion_visual',   'Señalización Visual',      'Marca de día deteriorada, pintura, bandas o conos dañados',               'Eye'),
  ('sistema_radio',         'Sistema de Radio',         'Fallo en radiobaliza, AIS o equipo de comunicación',                     'Radio'),
  ('sensor_meteorologico',  'Sensor Meteorológico',     'Anemómetro, sensor de visibilidad u otro instrumento fallido',            'Wind'),
  ('acceso_seguridad',      'Acceso / Seguridad',       'Cerradura, escalera, cerco perimetral o acceso comprometido',             'Lock'),
  ('vandalismo',            'Vandalismo',               'Daño intencional por terceros, robo de equipos o componentes',            'ShieldAlert'),
  ('colision',              'Colisión',                 'Impacto de embarcación u objeto flotante contra la señal',                'AlertTriangle'),
  ('incrustaciones',        'Incrustaciones Marinas',   'Algas, mejillones u organismos que afectan flotabilidad o visibilidad',   'Waves'),
  ('sistema_niebla',        'Sistema de Niebla',        'Bocina, sirena o sistema acústico de niebla sin funcionar',               'CloudFog'),
  ('documentacion',         'Documentación',            'Datos técnicos desactualizados, planos faltantes o inspección vencida',   'FileWarning'),
  ('otro',                  'Otro',                     'Cualquier otra novedad no contemplada en las categorías anteriores',      'MoreHorizontal');

-- Opciones por categoría
-- 1. Óptica
insert into opciones_novedades (categoria_id, label) values
  (1, 'Lámpara quemada o fundida'),
  (1, 'Lente sucia o dañada'),
  (1, 'Rotación defectuosa o detenida'),
  (1, 'Destello incorrecto (ritmo o color)'),
  (1, 'Sistema de control de luz fallido');

-- 2. Energía / Batería
insert into opciones_novedades (categoria_id, label) values
  (2, 'Batería descargada'),
  (2, 'Panel solar dañado o cubierto'),
  (2, 'Controlador de carga fallido'),
  (2, 'Alternador o generador fuera de servicio'),
  (2, 'Bajo nivel de combustible');

-- 3. Cableado
insert into opciones_novedades (categoria_id, label) values
  (3, 'Cable cortado o pelado'),
  (3, 'Conexiones oxidadas o flojas'),
  (3, 'Cortocircuito detectado'),
  (3, 'Canalización o conducto dañado');

-- 4. Estructura
insert into opciones_novedades (categoria_id, label) values
  (4, 'Corrosión severa en estructura'),
  (4, 'Deformación por impacto'),
  (4, 'Tornillería o anclaje flojo'),
  (4, 'Base o pedestal dañado'),
  (4, 'Pintura muy deteriorada');

-- 5. Fondeo
insert into opciones_novedades (categoria_id, label) values
  (5, 'Cadena de fondeo rota'),
  (5, 'Boya desplazada de posición nominal'),
  (5, 'Cuerpo muerto suelto'),
  (5, 'Grilletes o fiadores deteriorados');

-- 6. Señalización Visual
insert into opciones_novedades (categoria_id, label) values
  (6, 'Marca de día faltante o dañada'),
  (6, 'Bandas de color deterioradas'),
  (6, 'Cono, esfera o cilindro dañado'),
  (6, 'Número identificador ilegible');

-- 7. Sistema de Radio
insert into opciones_novedades (categoria_id, label) values
  (7, 'Radiobaliza sin señal'),
  (7, 'Transponder AIS sin transmisión'),
  (7, 'Antena dañada o caída'),
  (7, 'Equipo sin alimentación eléctrica');

-- 8. Sensor Meteorológico
insert into opciones_novedades (categoria_id, label) values
  (8, 'Anemómetro bloqueado o roto'),
  (8, 'Sensor de visibilidad fallido'),
  (8, 'Sensor de temperatura o presión fuera de rango'),
  (8, 'Estación meteorológica sin comunicación');

-- 9. Acceso / Seguridad
insert into opciones_novedades (categoria_id, label) values
  (9, 'Cerradura dañada o forzada'),
  (9, 'Escalera de acceso deteriorada'),
  (9, 'Puerta o escotilla bloqueada'),
  (9, 'Cerco perimetral dañado o abierto');

-- 10. Vandalismo
insert into opciones_novedades (categoria_id, label, requiere_descripcion) values
  (10, 'Robo de equipos',                    true),
  (10, 'Robo de baterías o paneles solares', true),
  (10, 'Daño intencional a estructura',      true),
  (10, 'Grafitis o deterioro estético',      false);

-- 11. Colisión
insert into opciones_novedades (categoria_id, label, requiere_descripcion) values
  (11, 'Impacto de embarcación',              true),
  (11, 'Daño por objeto flotante',            false),
  (11, 'Señal desplazada por colisión',       false),
  (11, 'Daño estructural grave por colisión', true);

-- 12. Incrustaciones Marinas
insert into opciones_novedades (categoria_id, label) values
  (12, 'Acumulación de mejillones o bivalvos'),
  (12, 'Algas que afectan flotabilidad'),
  (12, 'Corrosión biológica acelerada'),
  (12, 'Peso excesivo por incrustaciones');

-- 13. Sistema de Niebla
insert into opciones_novedades (categoria_id, label) values
  (13, 'Bocina de niebla sin activación'),
  (13, 'Sensor de visibilidad fallido'),
  (13, 'Compresor de aire dañado'),
  (13, 'Difusor o bocina bloqueada');

-- 14. Documentación
insert into opciones_novedades (categoria_id, label, requiere_descripcion) values
  (14, 'Inspección periódica vencida',      false),
  (14, 'Planos técnicos desactualizados',   false),
  (14, 'Certificación expirada',            false),
  (14, 'Datos en sistema incorrectos',      true);

-- 15. Otro
insert into opciones_novedades (categoria_id, label, requiere_descripcion) values
  (15, 'Novedad no categorizada', true);
