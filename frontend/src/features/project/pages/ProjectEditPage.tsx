import { useTranslation } from "react-i18next";
import { Container, IconButton, Paper } from "@mui/material";
import { FormProvider } from "react-hook-form";
import useCustomForm from "../../../hooks/useCustomForm";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import PageHeader from "../../../components/PageHeader";
import useProjectDetailQuery from "../hooks/useProjectDetailQuery";
import {
  projectEditFormSchema,
  type ProjectEditFormValues,
} from "../types/projectForm";
import useProjectEditMutation from "../hooks/useProjectEditMutation";
import { ProjectEditForm } from "../forms/ProjectEditForm";
import { Save } from "@mui/icons-material";

export default function ProjectEditPage() {
  const { t } = useTranslation("project");
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const project = useProjectDetailQuery(id ?? "");

  const projectEditForm = useCustomForm<ProjectEditFormValues>({
    schema: projectEditFormSchema,
    defaultValues: {
      name: "",
      description: "",
    },
    values: {
      name: project.data?.name ?? "",
      description: project.data?.description ?? "",
    },
  });

  const projectEditMutation = useProjectEditMutation(id ?? "", {
    onSuccess: (project) => {
      queryClient.setQueryData(["projects", project.id], project);
      navigate(`/project/${project.id}`, { replace: true });
    },
  });

  const handleSubmit = projectEditForm.handleSubmit((data) =>
    projectEditMutation.mutate(data),
  );

  return (
    <>
      <PageHeader
        title={t("projects")}
        subtitle={t("edit")}
        actions={
          <IconButton
            size="small"
            title={t("save")}
            onClick={handleSubmit}
            loading={projectEditMutation.isPending}
            disabled={
              !projectEditForm.formState.isValid ||
              projectEditMutation.isPending
            }
          >
            <Save fontSize="small" />
          </IconButton>
        }
      />
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          <FormProvider {...projectEditForm}>
            <ProjectEditForm
              onEnter={() => {
                if (projectEditForm.formState.isValid) handleSubmit();
              }}
            />
          </FormProvider>
        </Paper>
      </Container>
    </>
  );
}
