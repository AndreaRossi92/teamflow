import { Chip } from "@mui/material";
import type { TicketStatus } from "../../types/ticket";
import { useTranslation } from "react-i18next";
import { STATUS_COLOR } from "../../const/tickets";

type TicketStatusBadgeProps = {
  status: TicketStatus;
};

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const { t } = useTranslation("ticket");
  return <Chip size="small" label={t(status)} color={STATUS_COLOR[status]} />;
}
