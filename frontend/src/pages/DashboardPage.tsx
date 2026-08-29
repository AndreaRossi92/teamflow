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
import ProjectDashboardChart from "../features/ticket/components/ProjectDashboardChart";
import useProjectDashboardQuery from "../features/project/hooks/useProjectDashboardQuery";
import { ArrowForward } from "@mui/icons-material";

export default function DashboardPage() {
  const { t } = useTranslation("dashboard");
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const projectDashboardQuery = useProjectDashboardQuery();

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
          <CardActionArea
            onClick={() => {
              navigate("/tickets");
            }}
          >
            <CardHeader title={t("tickets")} />
            <CardContent>
              <Alert severity="success">{t("openSection")}</Alert>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    </Grid>
  );
}
