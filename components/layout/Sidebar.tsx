"use client";

import { NavItem } from "./NavItem";
import {
  Map,
  Radio,
  AlertCircle,
  Users,
  LayoutDashboard,
  Anchor,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { href: "/mapa",      label: "Mapa",        icon: Map },
  { href: "/senales",   label: "Señales",     icon: Radio },
  { href: "/novedades", label: "Novedades",   icon: AlertCircle },
  { href: "/usuarios",  label: "Usuarios",    icon: Users },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-[#243d57] bg-[#162233]">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-[#243d57] px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4a9edd]">
          <Anchor className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-mono text-sm font-bold tracking-widest text-white">FAROLIBERTAD</p>
          <p className="text-[10px] text-[#4a9edd] tracking-wider uppercase">Min. Defensa · R.A.</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#243d57] px-5 py-3">
        <p className="font-mono text-[10px] text-[#4a9edd]/50 tracking-wider">
          SISTEMA OPERACIONAL v1.0
        </p>
      </div>
    </aside>
  );
}
