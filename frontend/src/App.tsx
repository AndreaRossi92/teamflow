import { CssBaseline, ThemeProvider } from "@mui/material";
import useAppTheme from "./theme";
import "./i18n";
import Header from "./components/Header";
import AppRoutes from "./router/AppRoutes";
import { useZodLocale } from "./hooks/useZodLocale";

export default function App() {
  const theme = useAppTheme();
  // Translate zod errors
  useZodLocale();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <AppRoutes />
    </ThemeProvider>
  );
}
