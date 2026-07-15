import { Chip } from "@mui/material";
import type { TicketStatus } from "../../types/ticket";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("ticket");
  return <Chip size="small" label={t(status)} color={STATUS_COLOR[status]} />;
}
