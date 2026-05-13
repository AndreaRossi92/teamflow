import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Box,
  Stack,
  Chip,
} from "@mui/material";
import type { User } from "../../types/user";
import { formatDateTime } from "../../formatters/date";
import { useTranslation } from "react-i18next";
import ActiveDot from "../ActiveDot";

type UserDetailProps = { user: User };

export default function UserDetail({ user }: UserDetailProps) {
  const { i18n, t } = useTranslation("user");

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
            <ActiveDot active={user.isActive} />
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
                {user.fullName}
              </Typography>
              <Chip label={t(user.role)} color={user.role} size="small" />
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t("email")}
              </Typography>
              <Typography variant="h6">{user.email}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t("createdAt")}
              </Typography>
              <Typography variant="h6">
                {formatDateTime(user?.createdAt, i18n.language)}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t("updatedAt")}
              </Typography>
              <Typography variant="h6">
                {formatDateTime(user?.updatedAt, i18n.language)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
