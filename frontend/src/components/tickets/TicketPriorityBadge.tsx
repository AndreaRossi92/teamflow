import { Chip } from "@mui/material";
import type { TicketPriority } from "../../types/ticket";

export const PRIORITY_COLOR: Record<
  TicketPriority,
  "success" | "warning" | "error"
> = {
  low: "success",
  medium: "warning",
  high: "error",
};

type TicketPriorityBadgeProps = {
  priority: TicketPriority;
};

export function TicketPriorityBadge({ priority }: TicketPriorityBadgeProps) {
  return (
    <Chip size="small" label={priority} color={PRIORITY_COLOR[priority]} />
  );
}
