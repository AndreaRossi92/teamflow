import { useTranslation } from "react-i18next";
import { Alert, Button, Container, Paper, Snackbar } from "@mui/material";
import { FormProvider } from "react-hook-form";
import useCustomForm from "../../hooks/useCustomForm";
import PageHeader from "../../components/PageHeader";
import { omit } from "lodash";
import { useState } from "react";
import {
  changePasswordFormSchema,
  type ChangePasswordFormValues,
} from "../../types/changePasswordForm";
import useChangePasswordMutation from "../../hooks/auth/useChangePasswordMutation";
import { ChangePasswordForm } from "../../forms/auth/ChangePasswordForm";

export default function ChangePasswordPage() {
  const { t } = useTranslation("auth");

  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);

  const changePasswordForm = useCustomForm<ChangePasswordFormValues>({
    schema: changePasswordFormSchema,
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const changePasswordMutation = useChangePasswordMutation({
    onSuccess: () => {
      setOpenSuccessSnackbar(true);
    },
    onError: () => {
      setOpenErrorSnackbar(true);
    },
  });

  const handleSubmit = changePasswordForm.handleSubmit((data) =>
    changePasswordMutation.mutate(omit(data, "confirmNewPassword")),
  );

  return (
    <>
      <PageHeader title={t("changePassword", { ns: "common" })} />
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4 }}>
          <FormProvider {...changePasswordForm}>
            <ChangePasswordForm
              onEnter={() => {
                if (changePasswordForm.formState.isValid) handleSubmit();
              }}
            />
          </FormProvider>

          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={
              !changePasswordForm.formState.isValid ||
              changePasswordMutation.isPending
            }
            onClick={handleSubmit}
            loading={changePasswordMutation.isPending}
            sx={{ mt: 2 }}
          >
            {t("submit", { ns: "common" })}
          </Button>
        </Paper>
      </Container>
      <Snackbar
        open={openErrorSnackbar}
        autoHideDuration={5000}
        onClose={() => {
          setOpenErrorSnackbar(false);
        }}
      >
        <Alert
          onClose={() => {
            setOpenErrorSnackbar(false);
          }}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {t("somethingWentWrong", { ns: "errors" })}
        </Alert>
      </Snackbar>
      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={5000}
        onClose={() => {
          setOpenSuccessSnackbar(false);
        }}
      >
        <Alert
          onClose={() => {
            setOpenSuccessSnackbar(false);
          }}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {t("passwordChanged")}
        </Alert>
      </Snackbar>
    </>
  );
}
