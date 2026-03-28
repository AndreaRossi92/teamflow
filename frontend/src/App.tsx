import { CssBaseline, ThemeProvider } from "@mui/material";
import useAppTheme from "./theme";
import "./i18n";
import Header from "./components/Header";
import AppRoutes from "./router/AppRoutes";

export default function App() {
  const theme = useAppTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <AppRoutes />
    </ThemeProvider>
  );
}
