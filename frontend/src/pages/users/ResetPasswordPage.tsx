import { useTranslation } from "react-i18next";
import { Button, Container, Paper, Typography } from "@mui/material";
import { FormProvider } from "react-hook-form";
import useCustomForm from "../../hooks/useCustomForm";
import PageHeader from "../../components/PageHeader";
import { omit } from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import useUserDetailQuery from "../../hooks/users/useUserDetailQuery";
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from "../../types/resetPasswordForm";
import useResetPasswordMutation from "../../hooks/users/useResetPasswordMutation";
import { ResetPasswordForm } from "../../forms/users/ResetPasswordForm";
import { useSnackbar } from "../../providers/useSnackbar";

export default function ResetPasswordPage() {
  const { t } = useTranslation("user");
  const { showMessage } = useSnackbar();
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useUserDetailQuery(id ?? "");

  const resetPasswordForm = useCustomForm<ResetPasswordFormValues>({
    schema: resetPasswordFormSchema,
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const resetPasswordMutation = useResetPasswordMutation(id ?? "", {
    onSuccess: () => {
      showMessage("passwordReset", "success");
      navigate(`/user/${id}`, { replace: true });
    },
    onError: () => {
      showMessage("somethingWentWrong", "error");
    },
  });

  const handleSubmit = resetPasswordForm.handleSubmit((data) =>
    resetPasswordMutation.mutate(omit(data, "confirmNewPassword")),
  );

  return (
    <>
      <PageHeader title={t("resetPassword")} />
      <Container maxWidth="xs">
        <Typography sx={{ textAlign: "center", mb: 2 }} variant="h5">
          {user.data?.fullName}
        </Typography>
        <Paper elevation={3} sx={{ p: 4 }}>
          <FormProvider {...resetPasswordForm}>
            <ResetPasswordForm
              onEnter={() => {
                if (resetPasswordForm.formState.isValid) handleSubmit();
              }}
            />
          </FormProvider>

          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={
              !resetPasswordForm.formState.isValid ||
              resetPasswordMutation.isPending
            }
            onClick={handleSubmit}
            loading={resetPasswordMutation.isPending}
            sx={{ mt: 2 }}
          >
            {t("submit", { ns: "common" })}
          </Button>
        </Paper>
      </Container>
    </>
  );
}
