import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Container,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import { FormProvider } from "react-hook-form";
import { LoginForm } from "../forms/LoginForm";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

import useCustomForm from "../../../hooks/useCustomForm";
import { loginFormSchema, type LoginFormValues } from "../types/loginForm";
import useLoginMutation from "../hooks/useLoginMutation";
import { useAuth } from "../../../providers/useAuth";
import { Navigate } from "react-router-dom";

export default function LoginPage() {
  const { t } = useTranslation("auth");
  const { isAuthenticated } = useAuth();

  const loginForm = useCustomForm<LoginFormValues>({
    schema: loginFormSchema,
    defaultValues: {
      email: isDemoMode ? "admin@teamflow.com" : "",
      password: isDemoMode ? "admin123" : "",
    },
  });

  const loginMutation = useLoginMutation();

  const handleLogin = loginForm.handleSubmit((data) =>
    loginMutation.mutate(data),
  );

  if (isAuthenticated) return <Navigate to="/" />;

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ textAlign: "center" }}>
            {t("login.title")}
          </Typography>

          {isDemoMode && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t("login.demoCredentials")}
            </Alert>
          )}

          <FormProvider {...loginForm}>
            <LoginForm
              onEnter={() => {
                if (loginForm.formState.isValid) handleLogin();
              }}
            />
          </FormProvider>

          {loginMutation.isError && loginMutation.error.status === 401 && (
            <Alert severity="error" sx={{ my: 2 }}>
              {t("login.error")}
            </Alert>
          )}

          {loginMutation.isError && loginMutation.error.status === 429 && (
            <Alert severity="error" sx={{ my: 2 }}>
              {t("login.tooManyAttempts")}
            </Alert>
          )}

          {loginMutation.isError &&
            loginMutation.error.status !== 401 &&
            loginMutation.error.status !== 429 && (
              <Alert severity="error" sx={{ my: 2 }}>
                {t("somethingWentWrong", { ns: "errors" })}
              </Alert>
            )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={!loginForm.formState.isValid || loginMutation.isPending}
            onClick={handleLogin}
            loading={loginMutation.isPending}
            sx={{ mt: 2 }}
          >
            {t("login.submit")}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
