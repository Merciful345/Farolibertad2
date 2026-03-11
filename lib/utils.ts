import { clsx, type ClassValue } from "clsx";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatFecha(fecha: string): string {
  return format(new Date(fecha), "dd/MM/yyyy", { locale: es });
}

export function formatFechaHora(fecha: string): string {
  return format(new Date(fecha), "dd/MM/yyyy HH:mm", { locale: es });
}

export function formatRelativo(fecha: string): string {
  return formatDistanceToNow(new Date(fecha), { addSuffix: true, locale: es });
}

export function generarCodigo(tipo: string, numero: number): string {
  const prefijos: Record<string, string> = {
    faro: "FAR",
    boya: "BOY",
    baliza: "BAL",
  };
  const prefijo = prefijos[tipo] ?? "SEN";
  return `${prefijo}-${String(numero).padStart(4, "0")}`;
}

export function nombreCompleto(usuario: { nombre: string; apellido: string }): string {
  return `${usuario.nombre} ${usuario.apellido}`;
}
