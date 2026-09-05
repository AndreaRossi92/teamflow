import { Chip, type ChipProps } from "@mui/material";
import type { TicketStatus } from "../types/ticket";
import { useTranslation } from "react-i18next";
import { STATUS_COLOR } from "../const/tickets";

type TicketStatusBadgeProps = ChipProps & {
  status: TicketStatus;
  count?: number;
};

export function TicketStatusBadge({
  status,
  count,
  ...props
}: TicketStatusBadgeProps) {
  const { t } = useTranslation("ticket");
  return (
    <Chip
      size="small"
      label={count !== undefined ? `${count} ${t(status)}` : t(status)}
      color={STATUS_COLOR[status]}
      {...props}
    />
  );
}
