import { Box, Container, CssBaseline, Toolbar } from "@mui/material";
import Header from "./Header";
import AppRoutes from "../router/AppRoutes";

export default function AppContent() {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Header />
      <Container sx={{ p: 2 }}>
        <Toolbar />
        <AppRoutes />
      </Container>
    </Box>
  );
}
