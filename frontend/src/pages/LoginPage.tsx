import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Container,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import { login } from "../api/auth";
import { useAuth } from "../providers/useAuth";
import { FormProvider } from "react-hook-form";
import { LoginForm } from "../forms/LoginForm";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

import useCustomForm from "../hooks/useCustomForm";
import type { AuthUser } from "../types/authUser";
import type { AxiosError } from "axios";
import { loginFormSchema, type LoginFormValues } from "../types/loginForm";

export default function LoginPage() {
  const { t } = useTranslation("auth");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const loginForm = useCustomForm<LoginFormValues>({
    schema: loginFormSchema,
    defaultValues: {
      email: isDemoMode ? "admin@teamflow.com" : "",
      password: isDemoMode ? "admin123" : "",
    },
  });

  const loginMutation = useMutation<AuthUser, AxiosError, LoginFormValues>({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (user) => {
      setUser(user);
      navigate("/", { replace: true });
    },
  });

  const handleLogin = loginForm.handleSubmit((data) =>
    loginMutation.mutate(data),
  );

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom textAlign="center">
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

          {loginMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {t("login.error")}
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
