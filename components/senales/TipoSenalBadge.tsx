import { Badge } from "@/components/ui/Badge";
import { TIPOS_SENAL } from "@/constants/tipos-senales";
import type { TipoSenal } from "@/types";

export function TipoSenalBadge({ tipo }: { tipo: TipoSenal | undefined }) {
  if (!tipo) return <Badge className="bg-slate-500/20 text-slate-400">—</Badge>;
  const config = TIPOS_SENAL[tipo];
  return <Badge className={config?.color ?? ""}>{config?.label ?? tipo}</Badge>;
}
