import { useTranslation } from "react-i18next";
import { Container, IconButton, Paper, Stack } from "@mui/material";
import { FormProvider } from "react-hook-form";
import { userEditFormSchema, type UserEditFormValues } from "../types/userForm";
import useCustomForm from "../../../hooks/useCustomForm";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import PageHeader from "../../../components/PageHeader";
import useUserEditMutation from "../hooks/useUserEditMutation";
import useUserDetailQuery from "../hooks/useUserDetailQuery";
import { UserEditForm } from "../forms/UserEditForm";
import { Save } from "@mui/icons-material";

export default function UserEditPage() {
  const { t } = useTranslation("user");
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = useUserDetailQuery(id ?? "");

  const userEditForm = useCustomForm<UserEditFormValues>({
    schema: userEditFormSchema,
    defaultValues: {
      email: "",
      fullName: "",
      role: "dev",
    },
    values: {
      email: user.data?.email ?? "",
      fullName: user.data?.fullName ?? "",
      role: user.data?.role ?? "dev",
    },
  });

  const userEditMutation = useUserEditMutation(id ?? "", {
    onSuccess: (user) => {
      queryClient.setQueryData(["users", user.id], user);
      navigate(`/user/${user.id}`, { replace: true });
    },
  });

  const handleSubmit = userEditForm.handleSubmit((data) =>
    userEditMutation.mutate(data),
  );

  return (
    <>
      <PageHeader
        title={t("users")}
        subtitle={t("edit")}
        actions={
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              title={t("save")}
              onClick={handleSubmit}
              loading={userEditMutation.isPending}
              disabled={
                !userEditForm.formState.isValid || userEditMutation.isPending
              }
            >
              <Save fontSize="small" />
            </IconButton>
          </Stack>
        }
      />
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          <FormProvider {...userEditForm}>
            <UserEditForm
              onEnter={() => {
                if (userEditForm.formState.isValid) handleSubmit();
              }}
              disabled={userEditMutation.isPending}
            />
          </FormProvider>
        </Paper>
      </Container>
    </>
  );
}
