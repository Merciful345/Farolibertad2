import { Badge } from "@/components/ui/Badge";
import { ESTADOS_NOVEDAD } from "@/constants/estados";
import type { EstadoNovedad } from "@/types";

export function EstadoNovedadBadge({ estado }: { estado: EstadoNovedad }) {
  const config = ESTADOS_NOVEDAD[estado];
  return <Badge className={config.color}>{config.label}</Badge>;
}
