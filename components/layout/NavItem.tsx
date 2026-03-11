"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItemProps {
  href:  string;
  label: string;
  icon:  LucideIcon;
}

export function NavItem({ href, label, icon: Icon }: NavItemProps) {
  const pathname  = usePathname();
  const isActive  = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
        isActive
          ? "bg-[#4a9edd]/20 text-[#4a9edd] border-l-2 border-[#4a9edd]"
          : "text-slate-400 hover:bg-[#1d3045] hover:text-slate-200 border-l-2 border-transparent"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
