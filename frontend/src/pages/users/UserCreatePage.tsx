import { useTranslation } from "react-i18next";
import { Button, Container, Paper } from "@mui/material";
import { FormProvider } from "react-hook-form";
import {
  userCreateFormSchema,
  type UserCreateFormValues,
} from "../../types/userForm";
import useCustomForm from "../../hooks/useCustomForm";
import useUserCreateMutation from "../../hooks/users/useUserCreateMutation";
import { UserCreateForm } from "../../forms/users/UserCreateForm";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import PageHeader from "../../components/PageHeader";
import { omit } from "lodash";
import { useSnackbar } from "../../providers/useSnackbar";

export default function UserCreatePage() {
  const { t } = useTranslation("user");
  const { showMessage } = useSnackbar();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const userCreateForm = useCustomForm<UserCreateFormValues>({
    schema: userCreateFormSchema,
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
      role: "dev",
    },
  });

  const userCreateMutation = useUserCreateMutation({
    onSuccess: (user) => {
      queryClient.setQueryData(["users", user.id], user);
      navigate(`/user/${user.id}`, { replace: true });
    },
    onError: () => {
      showMessage(t("somethingWentWrong", { ns: "errors" }), "error");
    },
  });

  const handleSubmit = userCreateForm.handleSubmit((data) =>
    userCreateMutation.mutate(omit(data, "confirmPassword")),
  );

  return (
    <>
      <PageHeader title={t("users")} subtitle={t("create")} />
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          <FormProvider {...userCreateForm}>
            <UserCreateForm
              onEnter={() => {
                if (userCreateForm.formState.isValid) handleSubmit();
              }}
            />
          </FormProvider>

          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={
              !userCreateForm.formState.isValid || userCreateMutation.isPending
            }
            onClick={handleSubmit}
            loading={userCreateMutation.isPending}
            sx={{ mt: 2 }}
          >
            {t("submit", { ns: "common" })}
          </Button>
        </Paper>
      </Container>
    </>
  );
}
