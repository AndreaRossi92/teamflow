import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
  Alert,
  Stack,
} from "@mui/material";
import TicketCard from "../components/TicketCard";
import type { GeneratedTicket } from "../types/generatedTicket";
import useGenerateTicketMutation from "../hooks/ai/useGenerateTicketMutation";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

export default function GenerateTicketPage() {
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("generateTicket");
  const [customerRequest, setCustomerRequest] = useState("");
  const [ticket, setTicket] = useState<GeneratedTicket | null>(null);

  const genrateTicketMutation = useGenerateTicketMutation({
    onSuccess: (data) => setTicket(data),
  });

  const handleReset = () => {
    genrateTicketMutation.reset();
    setTicket(null);
    setCustomerRequest("");
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom>
          {t("title")}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {t("subtitle")}
        </Typography>

        {isDemoMode && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {t("demoMode")}
          </Alert>
        )}

        <TextField
          fullWidth
          multiline
          rows={6}
          label={t("label")}
          placeholder={t("placeholder")}
          value={customerRequest}
          onChange={(e) => setCustomerRequest(e.target.value)}
          sx={{ mb: 2 }}
        />

        {genrateTicketMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {tCommon("error")}
          </Alert>
        )}

        <Stack direction="column" spacing={2} sx={{ alignItems: "center" }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={
              !customerRequest.trim() || genrateTicketMutation.isPending
            }
            loading={genrateTicketMutation.isPending}
            onClick={() => genrateTicketMutation.mutate(customerRequest)}
            startIcon={
              genrateTicketMutation.isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : null
            }
            sx={{ maxWidth: "sm" }}
          >
            {t("generate")}
          </Button>

          {(ticket || genrateTicketMutation.isError) && (
            <Button
              variant="outlined"
              size="large"
              onClick={handleReset}
              fullWidth
              sx={{ maxWidth: "sm" }}
            >
              {tCommon("reset")}
            </Button>
          )}
        </Stack>

        {ticket && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              {t("result")}
            </Typography>
            <TicketCard ticket={ticket} />
          </Box>
        )}
      </Box>
    </Container>
  );
}
