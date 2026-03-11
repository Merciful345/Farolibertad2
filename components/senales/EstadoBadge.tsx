import { Badge } from "@/components/ui/Badge";
import { ESTADOS_SENAL } from "@/constants/estados";
import type { EstadoSenal } from "@/types";

export function EstadoBadge({ estado }: { estado: EstadoSenal }) {
  const config = ESTADOS_SENAL[estado];
  return <Badge className={config.color}>{config.label}</Badge>;
}
