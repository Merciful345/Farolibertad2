import { UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";

interface HeaderProps {
  titulo: string;
}

export function Header({ titulo }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[#243d57] bg-[#162233] px-6">
      <h1 className="font-mono text-sm font-semibold tracking-wider text-slate-200 uppercase">
        {titulo}
      </h1>
      <div className="flex items-center gap-3">
        <button className="relative rounded-md p-1.5 text-slate-400 hover:bg-[#1d3045] hover:text-[#4a9edd] transition-colors">
          <Bell className="h-4 w-4" />
        </button>
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </header>
  );
}
