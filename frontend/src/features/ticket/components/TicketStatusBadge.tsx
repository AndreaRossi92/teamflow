import { Chip } from "@mui/material";
import type { TicketStatus } from "../types/ticket";
import { useTranslation } from "react-i18next";
import { STATUS_COLOR } from "../const/tickets";

type TicketStatusBadgeProps = {
  status: TicketStatus;
  count?: number;
};

export function TicketStatusBadge({ status, count }: TicketStatusBadgeProps) {
  const { t } = useTranslation("ticket");
  return (
    <Chip
      size="small"
      label={count !== undefined ? `${count} ${t(status)}` : t(status)}
      color={STATUS_COLOR[status]}
    />
  );
}
