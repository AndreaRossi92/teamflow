import { Chip } from "@mui/material";
import type { TicketPriority } from "../../types/ticket";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("ticket");
  return (
    <Chip size="small" label={t(priority)} color={PRIORITY_COLOR[priority]} />
  );
}
