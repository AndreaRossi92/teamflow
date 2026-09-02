import { ThemeProvider } from "@mui/material";
import useAppTheme from "./theme";
import "./i18n";
import { useZodLocale } from "./hooks/useZodLocale";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./providers/AuthProvider";
import { BrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import PageLoader from "./components/PageLoader";
import { SnackbarProvider } from "./providers/SnackbarProvider";
import AppContent from "./components/AppContent";

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
                <AppContent />
              </BrowserRouter>
            </Suspense>
          </AuthProvider>
        </QueryClientProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
