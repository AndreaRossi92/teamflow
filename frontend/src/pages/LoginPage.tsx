import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import { login } from "../api/auth";
import { useAuth } from "../providers/AuthProvider";

export default function LoginPage() {
  const { t } = useTranslation("auth");
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (user) => {
      setUser(user);
      navigate("/", { replace: true });
    },
  });

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom textAlign="center">
            {t("login.title")}
          </Typography>

          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {t("login.error")}
            </Alert>
          )}

          <TextField
            fullWidth
            label={t("login.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label={t("login.password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={!email || !password || mutation.isPending}
            onClick={() => mutation.mutate()}
            startIcon={
              mutation.isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : null
            }
          >
            {mutation.isPending ? t("login.submitting") : t("login.submit")}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
