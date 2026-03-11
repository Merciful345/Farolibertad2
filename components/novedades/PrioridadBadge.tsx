import { Badge } from "@/components/ui/Badge";
import { PRIORIDADES_NOVEDAD } from "@/constants/estados";
import type { PrioridadNovedad } from "@/types";

export function PrioridadBadge({ prioridad }: { prioridad: PrioridadNovedad }) {
  const config = PRIORIDADES_NOVEDAD[prioridad];
  return <Badge className={config.color}>{config.label}</Badge>;
}
