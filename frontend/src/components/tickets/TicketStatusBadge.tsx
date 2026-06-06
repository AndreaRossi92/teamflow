import { Chip } from "@mui/material";
import type { TicketStatus } from "../../types/ticket";

export const STATUS_COLOR: Record<
  TicketStatus,
  "warning" | "info" | "success" | "error"
> = {
  open: "error",
  inProgress: "warning",
  resolved: "info",
  closed: "success",
};

type TicketStatusBadgeProps = {
  status: TicketStatus;
};

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  return <Chip size="small" label={status} color={STATUS_COLOR[status]} />;
}
