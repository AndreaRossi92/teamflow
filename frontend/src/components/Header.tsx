import {
  AppBar,
  Toolbar,
  Typography,
  Select,
  MenuItem,
  type SelectChangeEvent,
  Stack,
  Tooltip,
  Chip,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
] as const;

type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

function resolveLanguageCode(lng: string): LanguageCode {
  const match = SUPPORTED_LANGUAGES.find(({ code }) => lng.startsWith(code));
  return match?.code ?? SUPPORTED_LANGUAGES[0].code;
}

export default function Header() {
  const { i18n, t } = useTranslation("common");

  const currentLanguage = resolveLanguageCode(i18n.language);

  const handleLanguageChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1}>
          <Typography variant="h6" fontWeight="bold">
            TeamFlow
          </Typography>
          {isDemoMode && (
            <Tooltip title={t("demoMode")}>
              <Chip label={t("demo")} variant="outlined" />
            </Tooltip>
          )}
        </Stack>
        <Select<LanguageCode>
          value={currentLanguage}
          onChange={handleLanguageChange}
          size="small"
          variant="outlined"
          renderValue={(code) => {
            const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
            return lang?.flag;
          }}
          sx={{
            "& fieldset": { top: 0 }, // Remove notch offset
            "& fieldset legend": { display: "none" }, // Remove legend
          }}
        >
          {SUPPORTED_LANGUAGES.map(({ code, label, flag }) => (
            <MenuItem key={code} value={code}>
              {flag} {label}
            </MenuItem>
          ))}
        </Select>
      </Toolbar>
    </AppBar>
  );
}
