import { useTranslation } from "react-i18next";
import useUserDetailQuery from "../../hooks/users/useUserDetailQuery";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import UserDetail from "../../components/users/UserDetail";
import PageLoader from "../../components/PageLoader";
import { Alert, IconButton, Stack } from "@mui/material";
import { Edit, SettingsBackupRestore } from "@mui/icons-material";
import DeleteIconButton from "../../components/DeleteIconButton";
import useDeactivateUserMutation from "../../hooks/users/useDeactivateUserMutation";
import { useQueryClient } from "@tanstack/react-query";
import useReactivateUserMutation from "../../hooks/users/useReactivateUserMutation";
import { useSnackbar } from "../../providers/useSnackbar";
import DeleteButton from "../../components/DeleteButton";
import useDeleteUserMutation from "../../hooks/users/useDeleteUserMutation";

export default function UserDetailPage() {
  const { t } = useTranslation("user");
  const { showMessage } = useSnackbar();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useUserDetailQuery(id ?? "");
  const deactivateUserMutation = useDeactivateUserMutation({
    onSuccess: () => {
      showMessage(t("deactivated"), "success");
    },
    onError: () => {
      showMessage(t("somethingWentWrong", { ns: "errors" }), "error");
    },
  });
  const reactivateUserMutation = useReactivateUserMutation({
    onSuccess: () => {
      showMessage(t("reactivated"), "success");
    },
    onError: () => {
      showMessage(t("somethingWentWrong", { ns: "errors" }), "error");
    },
  });
  const deleteUserMutation = useDeleteUserMutation({
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
        title={t("user")}
        subtitle={t("detail")}
        actions={
          user.isSuccess && (
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                title={t("edit")}
                onClick={() => {
                  navigate(`/user/${id}/edit`);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
              {user.data.isActive && (
                <DeleteIconButton
                  dialogTitle={user.data.fullName}
                  dialogText={t("deactivateConfirm")}
                  title={t("deactivate")}
                  deleteLabel={t("deactivate")}
                  onDelete={() =>
                    deactivateUserMutation
                      .mutateAsync(user.data.id)
                      .then(() =>
                        queryClient.invalidateQueries({ queryKey: ["users"] }),
                      )
                  }
                />
              )}
              {!user.data.isActive && (
                <IconButton
                  size="small"
                  title={t("restore")}
                  onClick={() => {
                    reactivateUserMutation
                      .mutateAsync(user.data.id)
                      .then(() =>
                        queryClient.invalidateQueries({ queryKey: ["users"] }),
                      );
                  }}
                >
                  <SettingsBackupRestore fontSize="small" />
                </IconButton>
              )}
            </Stack>
          )
        }
        BackButtonProps={{ path: "/users", replace: true }}
      />
      {user.isFetching && <PageLoader />}
      {!user.isFetching && user.isError && (
        <Alert severity="error">
          {t("somethingWentWrong", { ns: "errors" })}
        </Alert>
      )}
      {!user.isFetching && !user.isError && !!user.data && (
        <>
          <UserDetail user={user.data} />
          {!user.data.isActive && (
            <Stack direction="row" sx={{ justifyContent: "center" }}>
              <DeleteButton
                onDelete={() =>
                  deleteUserMutation.mutateAsync(user.data.id).then(() => {
                    queryClient.invalidateQueries({ queryKey: ["users"] });
                    navigate("/users", { replace: true });
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
