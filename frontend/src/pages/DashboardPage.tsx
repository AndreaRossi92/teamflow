import {
  Alert,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Grid,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/useAuth";

export default function DashboardPage() {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Grid container spacing={2}>
      {user?.role === "admin" && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardActionArea
              onClick={() => {
                navigate("/ai");
              }}
            >
              <CardHeader title={t("AI")} />
              <CardContent>
                <Alert severity="success">{t("openSection")}</Alert>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      )}
      {user?.role === "admin" && (
        <Grid size={{ xs: 12, md: 6 }}>
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
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardActionArea
            onClick={() => {
              navigate("/projects");
            }}
          >
            <CardHeader title={t("projects")} />
            <CardContent>
              <Alert severity="success">{t("openSection")}</Alert>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ opacity: 0.5 }}>
          <CardHeader title={t("tickets")} />
          <CardContent>
            <Alert severity="warning">{t("underDevelopment")}</Alert>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
