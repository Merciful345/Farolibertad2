import { Badge } from "@/components/ui/Badge";
import { ESTADOS_SENAL } from "@/constants/estados";
import type { EstadoSenal, EstadoSenalSlug } from "@/types";

export function EstadoBadge({ estado }: { estado: EstadoSenal | undefined }) {
  if (!estado) return <Badge className="bg-slate-500/20 text-slate-400">—</Badge>;
  const config = ESTADOS_SENAL[estado.nombre as EstadoSenalSlug];
  return <Badge className={config?.color ?? ""}>{config?.label ?? estado.label}</Badge>;
}
