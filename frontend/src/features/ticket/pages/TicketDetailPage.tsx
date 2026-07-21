import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, IconButton, Stack } from "@mui/material";
import { Edit, Group } from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";
import PageHeader from "../../../components/PageHeader";
import PageLoader from "../../../components/PageLoader";
import { useAuth } from "../../../providers/useAuth";
import { useSnackbar } from "../../../providers/useSnackbar";
import useTicketDetailQuery from "../hooks/useTicketDetailQuery";
import useDeleteTicketMutation from "../hooks/useDeleteTicketMutation";
import TicketDetail from "../components/TicketDetail";
import DeleteButton from "../../../components/DeleteButton";
import DeleteIconButton from "../../../components/DeleteIconButton";

export default function TicketDetailPage() {
  const { t } = useTranslation("ticket");
  const { showMessage } = useSnackbar();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();

  const ticket = useTicketDetailQuery(id ?? "");

  const deleteTicketMutation = useDeleteTicketMutation({
    onSuccess: () => {
      showMessage(t("deleted"), "success");
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      navigate("/tickets");
    },
    onError: () =>
      showMessage(t("somethingWentWrong", { ns: "errors" }), "error"),
  });

  return (
    <>
      <PageHeader
        title={t("ticket")}
        subtitle={t("detail")}
        actions={
          (user?.role === "admin" || user?.role === "manager") &&
          ticket.isSuccess ? (
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                title={t("edit")}
                onClick={() => navigate(`/ticket/${id}/edit`)}
              >
                <Edit fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                title={t("members")}
                onClick={() => {
                  navigate(`/ticket/${id}/assign-users`);
                }}
              >
                <Group fontSize="small" />
              </IconButton>
              <DeleteIconButton
                dialogTitle={ticket.data.title}
                onDelete={() =>
                  deleteTicketMutation.mutateAsync(ticket.data.id).then(() =>
                    queryClient.invalidateQueries({
                      queryKey: ["tickets"],
                    }),
                  )
                }
              />
            </Stack>
          ) : undefined
        }
        BackButtonProps={{ path: "/tickets", replace: true }}
      />

      {ticket.isFetching && <PageLoader />}

      {!ticket.isFetching && ticket.isError && (
        <Alert severity="error">
          {t("somethingWentWrong", { ns: "errors" })}
        </Alert>
      )}

      {!ticket.isFetching && !ticket.isError && ticket.data && (
        <>
          <TicketDetail ticket={ticket.data} />
          <Stack direction="row" sx={{ justifyContent: "center" }}>
            <DeleteButton
              onDelete={() =>
                deleteTicketMutation.mutateAsync(ticket.data.id).then(() => {
                  queryClient.invalidateQueries({ queryKey: ["tickets"] });
                  navigate("/tickets", { replace: true });
                })
              }
            />
          </Stack>
        </>
      )}
    </>
  );
}
