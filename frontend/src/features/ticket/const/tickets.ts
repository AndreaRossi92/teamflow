import type { TicketPriority, TicketStatus } from "../types/ticket";

export const PRIORITY_COLOR: Record<
  TicketPriority,
  "success" | "warning" | "error"
> = {
  low: "success",
  medium: "warning",
  high: "error",
};

export const STATUS_COLOR: Record<
  TicketStatus,
  "warning" | "info" | "success" | "error"
> = {
  open: "error",
  inProgress: "warning",
  resolved: "info",
  closed: "success",
};
