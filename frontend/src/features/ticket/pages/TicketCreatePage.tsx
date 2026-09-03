import { useTranslation } from "react-i18next";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
} from "@mui/material";
import { FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AutoAwesome, Save } from "@mui/icons-material";
import PageHeader from "../../../components/PageHeader";
import { useSnackbar } from "../../../providers/useSnackbar";
import useCustomForm from "../../../hooks/useCustomForm";
import useTicketCreateMutation from "../hooks/useTicketCreateMutation";
import useProjectsListQuery from "../../project/hooks/useProjectsListQuery";
import { TicketCreateForm } from "../forms/TicketCreateForm";
import {
  ticketCreateFormSchema,
  type TicketCreateFormValues,
} from "../types/ticketForm";
import useGenerateTicketMutation from "../../ai/hooks/useGenerateTicketMutation";
import {
  generateTicketFormSchema,
  type GenerateTicketFormValues,
} from "../../ai/types/generateTicketForm";
import { GenerateTicketForm } from "../../ai/forms/GenerateTIcketForm";
import { useState } from "react";

export default function TicketCreatePage() {
  const { t } = useTranslation("ticket");
  const { showMessage } = useSnackbar();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const projectsQuery = useProjectsListQuery();

  const [open, setOpen] = useState(false);

  const form = useCustomForm<TicketCreateFormValues>({
    schema: ticketCreateFormSchema,
    defaultValues: {
      title: "",
      description: "",
      priority: "",
      project: null,
    },
  });

  const generateTicketForm = useCustomForm<GenerateTicketFormValues>({
    schema: generateTicketFormSchema,
    defaultValues: {
      request: "",
    },
  });

  const ticketCreateMutation = useTicketCreateMutation({
    onSuccess: (ticket) => {
      queryClient.setQueryData(["tickets", ticket.id], ticket);
      navigate(`/ticket/${ticket.id}`, { replace: true });
    },
    onError: () =>
      showMessage(t("somethingWentWrong", { ns: "errors" }), "error"),
  });

  const generateTicketMutation = useGenerateTicketMutation({
    onSuccess: (data) => {
      form.setValues({
        title: data.title,
        description: data.description,
        priority: data.priority,
      });
      showMessage(t("generated"), "success");
      setOpen(false);
    },
    onError: () =>
      showMessage(t("somethingWentWrong", { ns: "errors" }), "error"),
  });

  const handleSubmit = form.handleSubmit((data) =>
    ticketCreateMutation.mutate(data),
  );
  const handleGenerate = generateTicketForm.handleSubmit((data) =>
    generateTicketMutation.mutate(data.request),
  );

  return (
    <>
      <PageHeader
        title={t("tickets")}
        subtitle={t("create")}
        actions={
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              title={t("generateWithAI")}
              onClick={() => {
                setOpen(true);
              }}
              loading={generateTicketMutation.isPending}
              disabled={generateTicketMutation.isPending}
            >
              <AutoAwesome fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              title={t("save")}
              onClick={handleSubmit}
              loading={ticketCreateMutation.isPending}
              disabled={
                !form.formState.isValid || ticketCreateMutation.isPending
              }
            >
              <Save fontSize="small" />
            </IconButton>
          </Stack>
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
              disabled={ticketCreateMutation.isPending}
            />
          </FormProvider>
        </Paper>
        <Dialog
          open={open}
          onClose={() => {
            if (!generateTicketMutation.isPending) setOpen(false);
          }}
          fullWidth
        >
          <DialogTitle>{t("generateWithAI")}</DialogTitle>
          <DialogContent style={{ paddingTop: 10 }}>
            <FormProvider {...generateTicketForm}>
              <GenerateTicketForm
                onEnter={() => {
                  if (generateTicketForm.formState.isValid) handleGenerate();
                }}
                disabled={generateTicketMutation.isPending}
              />
            </FormProvider>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              onClick={handleGenerate}
              loading={generateTicketMutation.isPending}
            >
              {t("generate")}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
