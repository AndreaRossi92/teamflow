import { Container, CssBaseline, ThemeProvider } from "@mui/material";
import useAppTheme from "./theme";
import "./i18n";
import Header from "./components/Header";
import AppRoutes from "./router/AppRoutes";
import { useZodLocale } from "./hooks/useZodLocale";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./providers/AuthProvider";
import { BrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import PageLoader from "./components/PageLoader";
import { SnackbarProvider } from "./providers/SnackbarProvider";

export default function App() {
  const queryClient = new QueryClient();
  const theme = useAppTheme();
  // Translate zod errors
  useZodLocale();

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <BrowserRouter>
                <CssBaseline />
                <Header />
                <Container sx={{ p: 2 }}>
                  <AppRoutes />
                </Container>
              </BrowserRouter>
            </Suspense>
          </AuthProvider>
        </QueryClientProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
