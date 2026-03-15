import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { GeneratedTicket } from "../types/ticket";

const priorityColor = {
  low: "success",
  medium: "warning",
  high: "error",
} as const;

interface Props {
  ticket: GeneratedTicket;
}

export default function TicketCard({ ticket }: Props) {
  const { t } = useTranslation("generateTicket");

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">{ticket.title}</Typography>
            <Chip
              label={ticket.priority}
              color={priorityColor[ticket.priority]}
              size="small"
            />
          </Stack>

          <Divider />

          <Typography variant="body2" color="text.secondary">
            {ticket.description}
          </Typography>

          <Typography variant="body2">
            <strong>
              {`${t("estimatedEffort")}: `}
              {t("estimatedDays", {
                count: ticket.estimatedDays,
              })}
            </strong>
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {ticket.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
