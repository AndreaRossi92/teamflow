import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import PageLoader from "../../components/PageLoader";
import { Alert, IconButton, Stack } from "@mui/material";
import { Edit, Group, SettingsBackupRestore } from "@mui/icons-material";
import DeleteIconButton from "../../components/DeleteIconButton";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../providers/useSnackbar";
import useProjectDetailQuery from "../../hooks/projects/useProjectDetailQuery";
import useDeactivateProjectMutation from "../../hooks/projects/useDeactivateProjectMutation";
import useReactivateProjectMutation from "../../hooks/projects/useReactivateProjectMutation";
import ProjectDetail from "../../components/projects/ProjectDetail";
import { useAuth } from "../../providers/useAuth";
import useDeleteProjectMutation from "../../hooks/projects/useDeleteProjectMutation";
import DeleteButton from "../../components/DeleteButton";

export default function ProjectDetailPage() {
  const { t } = useTranslation("project");
  const { showMessage } = useSnackbar();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { id } = useParams();
  const project = useProjectDetailQuery(id ?? "");
  const deactivateProjectMutation = useDeactivateProjectMutation({
    onSuccess: () => {
      showMessage(t("deactivated"), "success");
    },
    onError: () => {
      showMessage(t("somethingWentWrong", { ns: "errors" }), "error");
    },
  });
  const reactivateProjectMutation = useReactivateProjectMutation({
    onSuccess: () => {
      showMessage(t("reactivated"), "success");
    },
    onError: () => {
      showMessage(t("somethingWentWrong", { ns: "errors" }), "error");
    },
  });
  const deleteProjectMutation = useDeleteProjectMutation({
    onSuccess: () => {
      showMessage(t("deleted"), "success");
    },
    onError: () => {
      showMessage(t("somethingWentWrong", { ns: "errors" }), "error");
    },
  });

  return (
    <>
      <PageHeader
        title={t("project")}
        subtitle={t("detail")}
        actions={
          (user?.role === "admin" || user?.role === "manager") &&
          project.isSuccess ? (
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                title={t("edit")}
                onClick={() => {
                  navigate(`/project/${id}/edit`);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                title={t("members")}
                onClick={() => {
                  navigate(`/project/${id}/assign-users`);
                }}
              >
                <Group fontSize="small" />
              </IconButton>
              {project.data.isActive && (
                <DeleteIconButton
                  dialogTitle={project.data.name}
                  dialogText={t("deactivateConfirm")}
                  title={t("deactivate")}
                  deleteLabel={t("deactivate")}
                  onDelete={() =>
                    deactivateProjectMutation
                      .mutateAsync(project.data.id)
                      .then(() =>
                        queryClient.invalidateQueries({
                          queryKey: ["projects"],
                        }),
                      )
                  }
                />
              )}
              {!project.data.isActive && (
                <IconButton
                  size="small"
                  title={t("restore")}
                  onClick={() => {
                    reactivateProjectMutation
                      .mutateAsync(project.data.id)
                      .then(() =>
                        queryClient.invalidateQueries({
                          queryKey: ["projects"],
                        }),
                      );
                  }}
                >
                  <SettingsBackupRestore fontSize="small" />
                </IconButton>
              )}
            </Stack>
          ) : undefined
        }
        BackButtonProps={{ path: "/projects", replace: true }}
      />
      {project.isFetching && <PageLoader />}
      {!project.isFetching && project.isError && (
        <Alert severity="error">
          {t("somethingWentWrong", { ns: "errors" })}
        </Alert>
      )}
      {!project.isFetching && !project.isError && !!project.data && (
        <>
          <ProjectDetail project={project.data} />
          {!project.data.isActive && (
            <Stack direction="row" sx={{ justifyContent: "center" }}>
              <DeleteButton
                onDelete={() =>
                  deleteProjectMutation
                    .mutateAsync(project.data.id)
                    .then(() => {
                      queryClient.invalidateQueries({ queryKey: ["projects"] });
                      navigate("/projects");
                    })
                }
              />
            </Stack>
          )}
        </>
      )}
    </>
  );
}
