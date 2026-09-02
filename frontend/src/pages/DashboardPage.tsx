import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/useAuth";
import ProjectDashboardChart from "../features/project/components/ProjectDashboardChart";
import useProjectDashboardQuery from "../features/project/hooks/useProjectDashboardQuery";
import {
  ArrowForward,
  Group,
  Folder,
  ConfirmationNumber,
} from "@mui/icons-material";
import TicketDashboardChart from "../features/ticket/components/TicketDashboardChart";
import useTicketDashboardQuery from "../features/ticket/hooks/useTicketDashboardQuery";
import useTicketdevDashboardQuery from "../features/ticket/hooks/useTicketDevDashboardQuery";
import useUserDashboardQuery from "../features/user/hooks/useUserDashboardQuery";
import UserDashboardChart from "../features/user/components/UserDashboardChart";

export default function DashboardPage() {
  const { t } = useTranslation("dashboard");
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const projectDashboardQuery = useProjectDashboardQuery();
  const ticketDashboardQuery = useTicketDashboardQuery();
  const ticketDevDashboardQuery = useTicketdevDashboardQuery();
  const userDashboardQuery = useUserDashboardQuery();

  return (
    <Grid container spacing={2}>
      {user?.role === "admin" && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title={
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <Group fontSize="large" />
                  <Typography variant="h5">{t("users")}</Typography>
                </Stack>
              }
              action={
                <Button
                  variant="text"
                  endIcon={<ArrowForward />}
                  onClick={() => {
                    navigate("/users");
                  }}
                >
                  {t("list")}
                </Button>
              }
            />
            <CardContent>
              <UserDashboardChart
                userDashboard={userDashboardQuery.data ?? []}
                width={isSmallScreen ? 200 : 300}
                height={isSmallScreen ? 200 : 300}
                loading={userDashboardQuery.isFetching}
              />
            </CardContent>
          </Card>
        </Grid>
      )}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title={
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Folder fontSize="large" />
                <Typography variant="h5">{t("projects")}</Typography>
              </Stack>
            }
            action={
              <Button
                variant="text"
                endIcon={<ArrowForward />}
                onClick={() => {
                  navigate("/projects");
                }}
              >
                {t("list")}
              </Button>
            }
          />
          <CardContent>
            <ProjectDashboardChart
              projectDashboard={projectDashboardQuery.data ?? []}
              width={isSmallScreen ? 200 : 300}
              height={isSmallScreen ? 200 : 300}
              loading={projectDashboardQuery.isFetching}
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title={
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <ConfirmationNumber fontSize="large" />
                <Typography variant="h5">{t("tickets")}</Typography>
              </Stack>
            }
            action={
              <Button
                variant="text"
                endIcon={<ArrowForward />}
                onClick={() => {
                  navigate("/tickets");
                }}
              >
                {t("list")}
              </Button>
            }
          />
          <CardContent>
            <TicketDashboardChart
              ticketDashboard={
                (user?.role === "dev"
                  ? ticketDevDashboardQuery.data
                    ? [ticketDevDashboardQuery.data]
                    : []
                  : ticketDashboardQuery.data) ?? []
              }
              width={isSmallScreen ? 200 : 300}
              height={isSmallScreen ? 200 : 300}
              loading={
                ticketDashboardQuery.isFetching ||
                ticketDevDashboardQuery.isFetching
              }
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
