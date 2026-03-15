import {
  AppBar,
  Toolbar,
  Typography,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export default function Header() {
  const { i18n } = useTranslation("common");

  const handleLanguageChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight="bold">
          TeamFlow
        </Typography>
        <Select
          value={i18n.language.startsWith("it") ? "it" : "en"}
          onChange={handleLanguageChange}
          size="small"
          variant="outlined"
        >
          <MenuItem value="en">🇬🇧 English</MenuItem>
          <MenuItem value="it">🇮🇹 Italiano</MenuItem>
        </Select>
      </Toolbar>
    </AppBar>
  );
}
