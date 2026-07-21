import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Box,
  Stack,
  Alert,
} from "@mui/material";
import { formatDateTime } from "../../../formatters/date";
import { useTranslation } from "react-i18next";
import type { Ticket } from "../types/ticket";
import { TicketStatusBadge } from "./TicketStatusBadge";
import { TicketPriorityBadge } from "./TicketPriorityBadge";
import UsersList from "../../user/components/UsersList";

type TicketDetailProps = { ticket: Ticket };

export default function ProjectDetail({ ticket }: TicketDetailProps) {
  const { i18n, t } = useTranslation("ticket");

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 600, width: "100%", boxShadow: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <TicketStatusBadge status={ticket.status} />
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              sx={{
                flex: 1,
                justifyContent: { xs: "flex-start", md: "space-between" },
                alignItems: { xs: "flex-start", md: "center" },
              }}
            >
              <Typography variant="h5" gutterBottom>
                {ticket.title}
              </Typography>
              <TicketPriorityBadge priority={ticket.priority} />
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            {
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  {t("description")}
                </Typography>
                {ticket.description && (
                  <Typography variant="h6">{ticket.description}</Typography>
                )}
                {!ticket.description && (
                  <Alert severity="info">{t("noDescription")}</Alert>
                )}
              </Grid>
            }

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t("project")}
              </Typography>
              <Typography variant="h6">{ticket?.project.name}</Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t("createdBy")}
              </Typography>
              <Typography variant="h6">{ticket?.createdBy.fullName}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t("createdAt")}
              </Typography>
              <Typography variant="h6">
                {formatDateTime(ticket?.createdAt, i18n.language)}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t("updatedAt")}
              </Typography>
              <Typography variant="h6">
                {formatDateTime(ticket?.updatedAt, i18n.language)}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t("members")}
              </Typography>
              {ticket.assignees.length > 0 && (
                <UsersList
                  users={ticket.assignees}
                  listItemProps={{ disablePadding: true }}
                />
              )}
              {ticket.assignees.length === 0 && (
                <Alert severity="info">{t("noMembers")}</Alert>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
