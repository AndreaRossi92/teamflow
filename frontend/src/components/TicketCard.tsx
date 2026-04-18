import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import type { GeneratedTicket } from "../types/generatedTicket";

const priorityColor = {
  low: "success",
  medium: "warning",
  high: "error",
} as const;

type GeneratedTicketProps = {
  ticket: GeneratedTicket;
};

export default function TicketCard({ ticket }: GeneratedTicketProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
            }}
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
        </Stack>
      </CardContent>
    </Card>
  );
}
