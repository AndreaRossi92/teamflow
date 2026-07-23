import { useTranslation } from "react-i18next";
import { Container, IconButton, Paper } from "@mui/material";
import { FormProvider } from "react-hook-form";
import useCustomForm from "../../../hooks/useCustomForm";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import PageHeader from "../../../components/PageHeader";
import { useSnackbar } from "../../../providers/useSnackbar";
import {
  projectCreateFormSchema,
  type ProjectCreateFormValues,
} from "../types/projectForm";
import useProjectCreateMutation from "../hooks/useProjectCreateMutation";
import { ProjectCreateForm } from "../forms/ProjectCreateForm";
import { Save } from "@mui/icons-material";

export default function ProjectCreatePage() {
  const { t } = useTranslation("project");
  const { showMessage } = useSnackbar();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const projectCreateForm = useCustomForm<ProjectCreateFormValues>({
    schema: projectCreateFormSchema,
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const projectCreateMutation = useProjectCreateMutation({
    onSuccess: (project) => {
      queryClient.setQueryData(["projects", project.id], project);
      navigate(`/project/${project.id}`, { replace: true });
    },
    onError: () => {
      showMessage(t("somethingWentWrong", { ns: "errors" }), "error");
    },
  });

  const handleSubmit = projectCreateForm.handleSubmit((data) =>
    projectCreateMutation.mutate(data),
  );

  return (
    <>
      <PageHeader
        title={t("projects")}
        subtitle={t("create")}
        actions={
          <IconButton
            size="small"
            title={t("save")}
            onClick={handleSubmit}
            loading={projectCreateMutation.isPending}
            disabled={
              !projectCreateForm.formState.isValid ||
              projectCreateMutation.isPending
            }
          >
            <Save fontSize="small" />
          </IconButton>
        }
      />
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          <FormProvider {...projectCreateForm}>
            <ProjectCreateForm
              onEnter={() => {
                if (projectCreateForm.formState.isValid) handleSubmit();
              }}
              disabled={projectCreateMutation.isPending}
            />
          </FormProvider>
        </Paper>
      </Container>
    </>
  );
}
