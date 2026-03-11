-- =============================================================================
-- FAROLIBERTAD — Reset completo (ejecutar ANTES del schema.sql)
-- Elimina todo en orden correcto respetando foreign keys
-- =============================================================================

drop table if exists novedades              cascade;
drop table if exists senales                cascade;
drop table if exists perfiles               cascade;
drop table if exists opciones_novedades     cascade;
drop table if exists categorias_novedades   cascade;
drop table if exists estados_senales        cascade;
drop table if exists categorias_senales     cascade;
drop table if exists usuarios               cascade;

drop type if exists rol_usuario         cascade;
drop type if exists prioridad_novedad   cascade;
drop type if exists estado_novedad      cascade;

drop function if exists set_updated_at      cascade;
drop function if exists get_my_rol          cascade;
drop function if exists get_my_perfil_id    cascade;
