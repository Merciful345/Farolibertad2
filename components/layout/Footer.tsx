"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (pathname === "/mapa") return null;

  return (
    <footer className="border-t border-white/10 bg-[#0f1923] px-6 py-4">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-xs text-gray-500 sm:flex-row">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <span className="font-semibold text-gray-400">FAROLIBERTAD</span>
          <span>Sistema de Gestión de Señales Marítimas · Ministerio de Defensa · República Argentina</span>
        </div>
        <div className="flex flex-col items-center gap-1 sm:items-end">
          <div className="flex gap-4">
            <a href="mailto:c0r3l1x@gmail.com" className="hover:text-gray-300 transition-colors">
              c0r3l1x@gmail.com
            </a>
            <a href="tel:+543812394163" className="hover:text-gray-300 transition-colors">
              381 239-4163
            </a>
          </div>
          <span>© {new Date().getFullYear()} Todos los derechos reservados</span>
        </div>
      </div>
    </footer>
  );
}
