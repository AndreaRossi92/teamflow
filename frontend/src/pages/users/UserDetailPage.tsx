import { useTranslation } from "react-i18next";
import useUserDetailQuery from "../../hooks/users/useUserDetailQuery";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import UserDetail from "../../components/users/UserDetail";
import PageLoader from "../../components/PageLoader";
import { Alert, IconButton, Snackbar, Stack } from "@mui/material";
import { Edit, SettingsBackupRestore } from "@mui/icons-material";
import DeleteIconButton from "../../components/DeleteIconButton";
import useDeactivateUserMutation from "../../hooks/users/useDeactivateUserMutation";
import { useQueryClient } from "@tanstack/react-query";
import useReactivateUserMutation from "../../hooks/users/useReactivateUserMutation";
import { useState } from "react";

export default function UserDetailPage() {
  const { t } = useTranslation("user");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams();
  const [openDeactivatedUserSnackbar, setOpenDeactivatedUserSnackbar] =
    useState(false);
  const [openReactivatedUserSnackbar, setOpenReactivatedUserSnackbar] =
    useState(false);
  const user = useUserDetailQuery(id ?? "");
  const deactivateUserMutation = useDeactivateUserMutation();
  const reactivateUserMutation = useReactivateUserMutation();

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
                  onDelete={() =>
                    deactivateUserMutation
                      .mutateAsync(user.data.id)
                      .then(() =>
                        queryClient.invalidateQueries({ queryKey: ["users"] }),
                      )
                      .then(() => setOpenDeactivatedUserSnackbar(true))
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
                      )
                      .then(() => setOpenReactivatedUserSnackbar(true));
                  }}
                >
                  <SettingsBackupRestore fontSize="small" />
                </IconButton>
              )}
            </Stack>
          )
        }
      />
      {user.isFetching && <PageLoader />}
      {!user.isFetching && user.isError && (
        <Alert severity="error">
          {t(user.error?.message ?? "somethingWentWrong")}
        </Alert>
      )}
      {!user.isFetching && !user.isError && !!user.data && (
        <UserDetail user={user.data} />
      )}
      <Snackbar
        open={openDeactivatedUserSnackbar}
        autoHideDuration={5000}
        onClose={() => {
          setOpenDeactivatedUserSnackbar(false);
        }}
      >
        <Alert
          onClose={() => {
            setOpenDeactivatedUserSnackbar(false);
          }}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {t("deactivated")}
        </Alert>
      </Snackbar>
      <Snackbar
        open={openReactivatedUserSnackbar}
        autoHideDuration={5000}
        onClose={() => {
          setOpenReactivatedUserSnackbar(false);
        }}
      >
        <Alert
          onClose={() => {
            setOpenReactivatedUserSnackbar(false);
          }}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {t("reactivated")}
        </Alert>
      </Snackbar>
    </>
  );
}
