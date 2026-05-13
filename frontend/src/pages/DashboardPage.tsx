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

export default function DashboardPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  return (
    <Grid container spacing={2}>
      <Grid size={{ sm: 12, md: 6, lg: 4 }}>
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
      <Grid size={{ sm: 12, md: 6, lg: 4 }}>
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
      <Grid size={{ sm: 12, md: 6, lg: 4 }}>
        <Card sx={{ opacity: 0.5 }}>
          <CardHeader title={t("projects")} />
          <CardContent>
            <Alert severity="warning">{t("underDevelopment")}</Alert>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ sm: 12, md: 6, lg: 4 }}>
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
