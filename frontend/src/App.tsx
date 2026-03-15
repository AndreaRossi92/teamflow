import { CssBaseline, ThemeProvider } from "@mui/material";
import GenerateTicketPage from "./pages/GenerateTicketPage";
import useAppTheme from "./theme";
import "./i18n";
import Header from "./components/Header";

export default function App() {
  const theme = useAppTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <GenerateTicketPage />
    </ThemeProvider>
  );
}
