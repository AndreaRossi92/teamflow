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
import useTicketStatusByProjectQuery from "../features/ticket/hooks/useTicketStatusByProjectQuery";
import TicketStatusByProjectChart from "../features/ticket/components/TicketStatusByProjectChart";

export default function DashboardPage() {
  const { t } = useTranslation("dashboard");
  const { user } = useAuth();
  const navigate = useNavigate();

  const ticketStatusByProjectQuery = useTicketStatusByProjectQuery();

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
          <CardActionArea
            onClick={() => {
              navigate("/projects");
            }}
          >
            <CardHeader title={t("projects")} />
          </CardActionArea>
          <CardContent>
            <TicketStatusByProjectChart
              ticketStatusByProject={ticketStatusByProjectQuery.data ?? []}
              width={400}
              height={400}
              loading={ticketStatusByProjectQuery.isFetching}
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
