"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { Anchor, ChevronDown, Waves, Navigation, Map, AlertCircle, LayoutDashboard, Users, UserCircle, FileDown, HelpCircle } from "lucide-react";
import { BellButton } from "@/components/layout/BellButton";
import { cn } from "@/lib/utils";

const ESTACIONES_ITEMS = [
  { label: "Faros",    href: "/senales?tipo=faro",    icon: Anchor },
  { label: "Boyas",    href: "/senales?tipo=boya",    icon: Waves },
  { label: "Balizas",  href: "/senales?tipo=baliza",  icon: Navigation },
];

export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const isEstaciones = pathname.startsWith("/senales");
  const isMapa       = pathname.startsWith("/mapa");
  const isAvisos     = pathname.startsWith("/novedades");
  const isDashboard  = pathname === "/dashboard";
  const isUsuarios   = pathname.startsWith("/usuarios");
  const isPerfil     = pathname.startsWith("/perfil");
  const isReportes   = pathname.startsWith("/reportes");
  const isAyuda      = pathname.startsWith("/ayuda");

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const tabBase   = "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all";
  const tabActive = "bg-[#4a9edd]/15 text-[#4a9edd]";
  const tabIdle   = "text-slate-400 hover:bg-[#1d3045] hover:text-slate-200";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#243d57] bg-[#162233] px-5">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4a9edd]">
          <Anchor className="h-4 w-4 text-white" />
        </div>
        <span className="font-mono text-sm font-bold tracking-widest text-white hidden sm:block">
          FAROLIBERTAD
        </span>
      </Link>

      {/* Center nav */}
      <nav className="flex items-center gap-0.5">

        <Link href="/dashboard" className={cn(tabBase, isDashboard ? tabActive : tabIdle)}>
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden md:block">Dashboard</span>
        </Link>

        {/* Estaciones dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className={cn(tabBase, isEstaciones ? tabActive : tabIdle)}
          >
            <Anchor className="h-4 w-4" />
            <span className="hidden md:block">Estaciones</span>
            <ChevronDown className={cn("h-3 w-3 transition-transform duration-150", open && "rotate-180")} />
          </button>

          {open && (
            <div className="absolute left-0 top-full z-50 mt-1.5 w-44 rounded-lg border border-[#243d57] bg-[#162233] py-1 shadow-2xl shadow-black/40">
              {ESTACIONES_ITEMS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-[#1d3045] hover:text-[#4a9edd] transition-colors"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              ))}
              <div className="my-1 border-t border-[#243d57]" />
              <Link
                href="/senales"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-400 hover:bg-[#1d3045] hover:text-[#4a9edd] transition-colors"
              >
                Todas las señales
              </Link>
            </div>
          )}
        </div>

        <Link href="/mapa" className={cn(tabBase, isMapa ? tabActive : tabIdle)}>
          <Map className="h-4 w-4" />
          <span className="hidden md:block">Mapa</span>
        </Link>

        <Link href="/novedades" className={cn(tabBase, isAvisos ? tabActive : tabIdle)}>
          <AlertCircle className="h-4 w-4" />
          <span className="hidden md:block">Avisos</span>
        </Link>

        <Link href="/usuarios" className={cn(tabBase, isUsuarios ? tabActive : tabIdle)}>
          <Users className="h-4 w-4" />
          <span className="hidden md:block">Usuarios</span>
        </Link>

        <Link href="/reportes" className={cn(tabBase, isReportes ? tabActive : tabIdle)}>
          <FileDown className="h-4 w-4" />
          <span className="hidden md:block">Reportes</span>
        </Link>

      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/ayuda"
          className={cn(
            "rounded-md p-1.5 transition-colors",
            isAyuda ? "text-[#4a9edd] bg-[#4a9edd]/15" : "text-slate-400 hover:bg-[#1d3045] hover:text-[#4a9edd]"
          )}
          title="Centro de ayuda"
        >
          <HelpCircle className="h-4 w-4" />
        </Link>
        <BellButton />
        <Link
          href="/perfil"
          className={cn(
            "rounded-md p-1.5 transition-colors",
            isPerfil ? "text-[#4a9edd] bg-[#4a9edd]/15" : "text-slate-400 hover:bg-[#1d3045] hover:text-[#4a9edd]"
          )}
          title="Mi perfil"
        >
          <UserCircle className="h-4 w-4" />
        </Link>
        <UserButton />
      </div>
    </header>
  );
}
