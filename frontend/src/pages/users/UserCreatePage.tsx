import { useTranslation } from "react-i18next";
import { Alert, Button, Container, Paper, Snackbar } from "@mui/material";
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
import { useState } from "react";

export default function UserCreatePage() {
  const { t } = useTranslation("user");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);

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
      setOpenErrorSnackbar(true);
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
            {t("submit")}
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
    </>
  );
}
