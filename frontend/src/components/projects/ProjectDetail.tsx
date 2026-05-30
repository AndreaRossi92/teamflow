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
import { formatDateTime } from "../../formatters/date";
import { useTranslation } from "react-i18next";
import ActiveDot from "../ActiveDot";
import type { Project } from "../../types/project";
import UsersList from "../users/UsersList";

type ProjectDetailProps = { project: Project };

export default function ProjectDetail({ project }: ProjectDetailProps) {
  const { i18n, t } = useTranslation("project");

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
            {
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
            }

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

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t("members")}
              </Typography>
              <UsersList
                users={project.members}
                listItemProps={{ disablePadding: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
