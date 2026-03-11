import { Badge } from "@/components/ui/Badge";
import { TIPOS_SENAL } from "@/constants/tipos-senales";
import type { TipoSenal } from "@/types";

export function TipoSenalBadge({ tipo }: { tipo: TipoSenal }) {
  const config = TIPOS_SENAL[tipo];
  return <Badge className={config.color}>{config.label}</Badge>;
}
