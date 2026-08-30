import { Chip } from "@mui/material";
import type { TicketPriority } from "../types/ticket";
import { useTranslation } from "react-i18next";
import { PRIORITY_COLOR } from "../const/tickets";

type TicketPriorityBadgeProps = {
  priority: TicketPriority;
  count?: number;
};

export function TicketPriorityBadge({
  priority,
  count,
}: TicketPriorityBadgeProps) {
  const { t } = useTranslation("ticket");
  return (
    <Chip
      size="small"
      label={count ? `${count} ${t(priority)}` : t(priority)}
      color={PRIORITY_COLOR[priority]}
    />
  );
}
