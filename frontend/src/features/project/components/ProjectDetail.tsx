import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Box,
  Stack,
  Alert,
  Button,
} from "@mui/material";
import { formatDateTime } from "../../../formatters/date";
import { useTranslation } from "react-i18next";
import ActiveDot from "../../../components/ActiveDot";
import type { Project } from "../types/project";
import UsersList from "../../user/components/UsersList";
import TicketsList from "../../ticket/components/TicketsList";
import type { Ticket } from "../../ticket/types/ticket";
import { ArrowForward } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../providers/useAuth";
import { Role } from "../../user/const/user";

type ProjectDetailProps = { project: Project; lastTickets?: Ticket[] };

export default function ProjectDetail({
  project,
  lastTickets,
}: ProjectDetailProps) {
  const { i18n, t } = useTranslation("project");
  const navigate = useNavigate();
  const { user } = useAuth();

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
            <ActiveDot active={project.isActive} />
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
                {project.name}
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t("description")}
              </Typography>
              {project.description && (
                <Typography variant="h6">{project.description}</Typography>
              )}
              {!project.description && (
                <Alert severity="info">{t("noDescription")}</Alert>
              )}
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t("createdBy")}
              </Typography>
              <Typography variant="h6">
                {project?.createdBy.fullName}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t("createdAt")}
              </Typography>
              <Typography variant="h6">
                {formatDateTime(project?.createdAt, i18n.language)}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t("updatedAt")}
              </Typography>
              <Typography variant="h6">
                {formatDateTime(project?.updatedAt, i18n.language)}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }} sx={{ mt: 5 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="subtitle2" color="textSecondary">
                  {t("lastTickets")}
                </Typography>
                <Button
                  variant="text"
                  endIcon={<ArrowForward />}
                  onClick={() => {
                    navigate("/tickets", {
                      state: { projectName: project.name },
                    });
                  }}
                >
                  {t("list")}
                </Button>
              </Stack>
              {lastTickets && lastTickets.length !== 0 && (
                <TicketsList
                  tickets={lastTickets}
                  listItemProps={{ disablePadding: true }}
                  onClick={(ticket) => {
                    navigate(`/ticket/${ticket.id}`);
                  }}
                />
              )}
              {lastTickets && lastTickets.length === 0 && (
                <Alert severity="info">
                  {t("noTicketsFound", { ns: "ticket" })}
                </Alert>
              )}
            </Grid>

            <Grid size={{ xs: 12 }} sx={{ mt: 5 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t("members")}
              </Typography>
              {project.members.length > 0 && (
                <UsersList
                  users={project.members}
                  listItemProps={{ disablePadding: true }}
                  onClick={
                    user?.role === Role.ADMIN
                      ? (u) => {
                          navigate(`/user/${u.id}`);
                        }
                      : undefined
                  }
                />
              )}
              {project.members.length === 0 && (
                <Alert severity="info">{t("noMembers")}</Alert>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
