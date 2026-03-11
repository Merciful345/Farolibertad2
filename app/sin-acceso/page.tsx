import { SignOutButton } from "@clerk/nextjs";

export default function SinAccesoPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#0f1923]">
      <div className="max-w-md w-full mx-4 rounded-lg border border-[#243d57] bg-[#162233] p-8 text-center">
        <div className="mb-4 text-4xl">🔒</div>
        <h1 className="font-mono text-sm font-semibold tracking-wider text-slate-200 uppercase mb-2">
          Acceso Pendiente
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Tu cuenta está pendiente de activación por un administrador del sistema.
          Una vez activada, podrás acceder con tus credenciales.
        </p>
        <p className="text-xs text-slate-500 mb-6">
          Contactá al administrador para solicitar acceso.
        </p>
        <SignOutButton>
          <button className="rounded-md bg-[#1d3045] border border-[#243d57] px-4 py-2 text-sm text-slate-300 hover:bg-[#243d57] transition-colors">
            Cerrar sesión
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
