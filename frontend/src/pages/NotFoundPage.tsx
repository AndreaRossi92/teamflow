import { Home } from "@mui/icons-material";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ textAlign: "center" }}>
            {t("pageNotFound")}
          </Typography>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => {
              navigate("/", { replace: true });
            }}
            startIcon={<Home />}
            sx={{ mt: 2 }}
          >
            {t("home")}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
