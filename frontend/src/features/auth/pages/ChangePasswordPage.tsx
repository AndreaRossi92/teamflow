import { useTranslation } from "react-i18next";
import { Button, Container, Paper } from "@mui/material";
import { FormProvider } from "react-hook-form";
import useCustomForm from "../../../hooks/useCustomForm";
import PageHeader from "../../../components/PageHeader";
import { omit } from "lodash";
import {
  changePasswordFormSchema,
  type ChangePasswordFormValues,
} from "../types/changePasswordForm";
import useChangePasswordMutation from "../hooks/useChangePasswordMutation";
import { ChangePasswordForm } from "../forms/ChangePasswordForm";
import { useSnackbar } from "../../../providers/useSnackbar";

export default function ChangePasswordPage() {
  const { t } = useTranslation("auth");
  const { showMessage } = useSnackbar();

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
      showMessage(t("passwordChanged"), "success");
    },
    onError: () => {
      showMessage(t("somethingWentWrong", { ns: "errors" }), "error");
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
              disabled={changePasswordMutation.isPending}
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
    </>
  );
}
