import Link from "next/link";
import { Anchor, ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f1923] flex flex-col items-center justify-center p-6 text-center">

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4a9edd]">
          <Anchor className="h-4 w-4 text-white" />
        </div>
        <span className="font-mono text-sm font-bold tracking-widest text-white">FAROLIBERTAD</span>
      </div>

      {/* 404 */}
      <div className="relative mb-6">
        <p className="font-mono text-8xl font-bold text-[#1d3045] select-none">404</p>
        <Compass className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-[#4a9edd]/40" />
      </div>

      <h1 className="text-xl font-semibold text-slate-200 mb-2">Página no encontrada</h1>
      <p className="text-sm text-slate-500 mb-8 max-w-xs">
        La ruta que buscás no existe o fue movida. Verificá la dirección o volvé al inicio.
      </p>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-md bg-[#4a9edd] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#3b8fce] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al Dashboard
      </Link>
    </div>
  );
}
