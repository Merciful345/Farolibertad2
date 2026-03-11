import { Badge } from "@/components/ui/Badge";
import { ROLES } from "@/constants/roles";
import type { RolUsuario } from "@/types";

export function RolBadge({ rol }: { rol: RolUsuario }) {
  const config = ROLES[rol];
  return <Badge className={config.color}>{config.label}</Badge>;
}
