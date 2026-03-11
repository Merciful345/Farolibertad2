import type { RolUsuario } from "@/types";

export interface RolConfig {
  label: string;
  descripcion: string;
  color: string;
  permisos: {
    verMapa: boolean;
    verSeñales: boolean;
    crearSeñal: boolean;
    editarSeñal: boolean;
    eliminarSeñal: boolean;
    verNovedades: boolean;
    crearNovedad: boolean;
    editarNovedad: boolean;
    eliminarNovedad: boolean;
    verUsuarios: boolean;
    gestionarUsuarios: boolean;
  };
}

export const ROLES: Record<RolUsuario, RolConfig> = {
  administrador: {
    label: "Administrador",
    descripcion: "Acceso total al sistema, incluyendo gestión de usuarios",
    color: "bg-red-100 text-red-800",
    permisos: {
      verMapa: true,
      verSeñales: true,
      crearSeñal: true,
      editarSeñal: true,
      eliminarSeñal: true,
      verNovedades: true,
      crearNovedad: true,
      editarNovedad: true,
      eliminarNovedad: true,
      verUsuarios: true,
      gestionarUsuarios: true,
    },
  },
  inspector_regional: {
    label: "Inspector Regional",
    descripcion: "Puede registrar y gestionar novedades, y editar señales",
    color: "bg-orange-100 text-orange-800",
    permisos: {
      verMapa: true,
      verSeñales: true,
      crearSeñal: false,
      editarSeñal: true,
      eliminarSeñal: false,
      verNovedades: true,
      crearNovedad: true,
      editarNovedad: true,
      eliminarNovedad: false,
      verUsuarios: false,
      gestionarUsuarios: false,
    },
  },
  encargado_estacion: {
    label: "Encargado de Estación",
    descripcion: "Puede registrar novedades y consultar el mapa",
    color: "bg-blue-100 text-blue-800",
    permisos: {
      verMapa: true,
      verSeñales: true,
      crearSeñal: false,
      editarSeñal: false,
      eliminarSeñal: false,
      verNovedades: true,
      crearNovedad: true,
      editarNovedad: false,
      eliminarNovedad: false,
      verUsuarios: false,
      gestionarUsuarios: false,
    },
  },
  observador: {
    label: "Observador",
    descripcion: "Solo lectura: puede ver el mapa, señales y novedades",
    color: "bg-gray-100 text-gray-700",
    permisos: {
      verMapa: true,
      verSeñales: true,
      crearSeñal: false,
      editarSeñal: false,
      eliminarSeñal: false,
      verNovedades: true,
      crearNovedad: false,
      editarNovedad: false,
      eliminarNovedad: false,
      verUsuarios: false,
      gestionarUsuarios: false,
    },
  },
};
