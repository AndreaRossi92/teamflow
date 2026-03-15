import { useState } from "react";
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
} from "@mui/material";
import { generateTicket } from "../api/ai";
import TicketCard from "../components/TicketCard";
import type { GeneratedTicket } from "../types/ticket";

export default function GenerateTicketPage() {
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("generateTicket");
  const [customerRequest, setCustomerRequest] = useState("");
  const [ticket, setTicket] = useState<GeneratedTicket | null>(null);

  const genrateTicketMutation = useMutation({
    mutationFn: () => generateTicket(customerRequest),
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

        <Button
          variant="contained"
          size="large"
          disabled={!customerRequest.trim() || genrateTicketMutation.isPending}
          onClick={() => genrateTicketMutation.mutate()}
          startIcon={
            genrateTicketMutation.isPending ? (
              <CircularProgress size={18} color="inherit" />
            ) : null
          }
        >
          {genrateTicketMutation.isPending ? t("generating") : t("generate")}
        </Button>

        {(ticket || genrateTicketMutation.isError) && (
          <Button variant="outlined" size="large" onClick={handleReset}>
            {tCommon("reset")}
          </Button>
        )}

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
