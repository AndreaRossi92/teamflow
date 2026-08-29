import {
  Alert,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/useAuth";
import ProjectDashboardChart from "../features/project/components/ProjectDashboardChart";
import useProjectDashboardQuery from "../features/project/hooks/useProjectDashboardQuery";
import { ArrowForward } from "@mui/icons-material";
import TicketDashboardChart from "../features/ticket/components/TicketDashboardChart";
import useTicketDashboardQuery from "../features/ticket/hooks/useTicketDashboardQuery";
import useTicketdevDashboardQuery from "../features/ticket/hooks/useTicketDevDashboardQuery";

export default function DashboardPage() {
  const { t } = useTranslation("dashboard");
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const projectDashboardQuery = useProjectDashboardQuery();
  const ticketDashboardQuery = useTicketDashboardQuery();
  const ticketDevDashboardQuery = useTicketdevDashboardQuery();

  return (
    <Grid container spacing={2}>
      {user?.role === "admin" && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardActionArea
              onClick={() => {
                navigate("/users");
              }}
            >
              <CardHeader title={t("users")} />
              <CardContent>
                <Alert severity="success">{t("openSection")}</Alert>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      )}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title={t("projects")}
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
            title={t("tickets")}
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
