import { useTranslation } from "react-i18next";
import { Container, IconButton, Paper } from "@mui/material";
import { FormProvider } from "react-hook-form";
import useCustomForm from "../../../hooks/useCustomForm";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import PageHeader from "../../../components/PageHeader";
import { Save } from "@mui/icons-material";
import useTicketDetailQuery from "../hooks/useTicketDetailQuery";
import {
  ticketEditFormSchema,
  type TicketEditFormValues,
} from "../types/ticketForm";
import useTicketEditMutation from "../hooks/useTicketEditMutation";
import { TicketEditForm } from "../forms/TicketEditForm";
import useProjectsListQuery from "../../project/hooks/useProjectsListQuery";
import { useState } from "react";
import ConfirmDialog from "../../../components/ConfirmDialog";
import useUpdateTicketStatusMutation from "../hooks/useUpdateTicketStatusMutation";
import { useAuth } from "../../../providers/useAuth";

export default function TicketEditPage() {
  const { user } = useAuth();
  const { t } = useTranslation("ticket");
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const ticket = useTicketDetailQuery(id ?? "");

  const projectsQuery = useProjectsListQuery();

  const ticketEditForm = useCustomForm<TicketEditFormValues>({
    schema: ticketEditFormSchema,
    defaultValues: {
      title: "",
      description: "",
      priority: "",
      project: null,
      status: "",
    },
    values: {
      title: ticket.data?.title ?? "",
      description: ticket.data?.description ?? "",
      priority: ticket.data?.priority ?? "",
      project: ticket.data?.project ?? null,
      status: ticket.data?.status ?? "",
    },
  });

  const currentProject = ticketEditForm.watch("project");

  const ticketEditMutation = useTicketEditMutation(id ?? "", {
    onSuccess: (ticket) => {
      queryClient.setQueryData(["tickets", ticket.id], ticket);
      navigate(`/ticket/${ticket.id}`, { replace: true });
    },
  });
  const updateTicketStatusMutation = useUpdateTicketStatusMutation(id ?? "", {
    onSuccess: (ticket) => {
      queryClient.setQueryData(["tickets", ticket.id], ticket);
      navigate(`/ticket/${ticket.id}`, { replace: true });
    },
  });

  const handleSubmit = ticketEditForm.handleSubmit((data) =>
    user?.role === "dev"
      ? updateTicketStatusMutation.mutate(data.status)
      : ticketEditMutation.mutate(data),
  );

  return (
    <>
      <PageHeader
        title={t("tickets")}
        subtitle={t("edit")}
        actions={
          <IconButton
            size="small"
            title={t("save")}
            onClick={() => {
              if (ticket.data?.project.id !== currentProject?.id) setOpen(true);
              else handleSubmit();
            }}
            loading={ticketEditMutation.isPending}
            disabled={
              !ticketEditForm.formState.isValid || ticketEditMutation.isPending
            }
          >
            <Save fontSize="small" />
          </IconButton>
        }
      />
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          <FormProvider {...ticketEditForm}>
            <TicketEditForm
              projectListQuery={projectsQuery}
              onEnter={() => {
                if (ticketEditForm.formState.isValid) handleSubmit();
              }}
            />
          </FormProvider>
        </Paper>
        <ConfirmDialog
          open={open}
          handleConfirm={handleSubmit}
          handleClose={() => {
            setOpen(false);
          }}
          dialogTitle={t("projectChange")}
          dialogText={t("deleteAssigneesText")}
        />
      </Container>
    </>
  );
}
