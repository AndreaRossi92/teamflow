import { useTranslation } from "react-i18next";
import { Container, IconButton, Paper } from "@mui/material";
import { FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Save } from "@mui/icons-material";
import PageHeader from "../../components/PageHeader";
import { useSnackbar } from "../../providers/useSnackbar";
import useCustomForm from "../../hooks/useCustomForm";
import useTicketCreateMutation from "../../hooks/tickets/useTicketCreateMutation";
import useProjectsListQuery from "../../hooks/projects/useProjectsListQuery";
import { TicketCreateForm } from "../../forms/tickets/TicketCreateForm";
import {
  ticketCreateFormSchema,
  type TicketCreateFormValues,
} from "../../types/ticketForm";

export default function TicketCreatePage() {
  const { t } = useTranslation("ticket");
  const { showMessage } = useSnackbar();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const projectsQuery = useProjectsListQuery();

  const form = useCustomForm<TicketCreateFormValues>({
    schema: ticketCreateFormSchema,
    defaultValues: {
      title: "",
      description: "",
      priority: "",
      project: null,
    },
  });

  const createMutation = useTicketCreateMutation({
    onSuccess: (ticket) => {
      queryClient.setQueryData(["tickets", ticket.id], ticket);
      navigate(`/ticket/${ticket.id}`, { replace: true });
    },
    onError: () =>
      showMessage(t("somethingWentWrong", { ns: "errors" }), "error"),
  });

  const handleSubmit = form.handleSubmit((data) => createMutation.mutate(data));

  return (
    <>
      <PageHeader
        title={t("tickets")}
        subtitle={t("create")}
        actions={
          <IconButton
            size="small"
            title={t("save")}
            onClick={handleSubmit}
            loading={createMutation.isPending}
            disabled={!form.formState.isValid || createMutation.isPending}
          >
            <Save fontSize="small" />
          </IconButton>
        }
      />
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          <FormProvider {...form}>
            <TicketCreateForm
              projectListQuery={projectsQuery}
              onEnter={() => {
                if (form.formState.isValid) handleSubmit();
              }}
            />
          </FormProvider>
        </Paper>
      </Container>
    </>
  );
}
