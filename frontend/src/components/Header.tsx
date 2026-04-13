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
  IconButton,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import LogoutIcon from "@mui/icons-material/Logout";
import useLogoutMutation from "../hooks/auth/useLogoutMutation";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flagSrc: "https://flagcdn.com/gb.svg" },
  { code: "it", label: "Italiano", flagSrc: "https://flagcdn.com/it.svg" },
] as const;

type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

function resolveLanguageCode(lng: string): LanguageCode {
  const match = SUPPORTED_LANGUAGES.find(({ code }) => lng.startsWith(code));
  return match?.code ?? SUPPORTED_LANGUAGES[0].code;
}

export default function Header() {
  const { i18n, t } = useTranslation("common");

  const logoutMutation = useLogoutMutation();

  const currentLanguage = resolveLanguageCode(i18n.language);

  const handleLanguageChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            TeamFlow
          </Typography>
          {isDemoMode && (
            <Tooltip title={t("demoMode")}>
              <Chip label={t("demo")} variant="outlined" />
            </Tooltip>
          )}
        </Stack>
        <Stack direction="row" spacing={1}>
          <Select<LanguageCode>
            value={currentLanguage}
            onChange={handleLanguageChange}
            size="small"
            variant="outlined"
            renderValue={(code) => {
              const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
              return lang ? (
                <FlagImg src={lang.flagSrc} alt={lang.code} />
              ) : null;
            }}
            sx={{
              "& fieldset": { top: 0 }, // Remove notch offset
              "& fieldset legend": { display: "none" }, // Remove legend
            }}
          >
            {SUPPORTED_LANGUAGES.map(({ code, label, flagSrc }) => (
              <MenuItem key={code} value={code}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <FlagImg src={flagSrc} alt={code} />
                  <span>{label}</span>
                </Stack>
              </MenuItem>
            ))}
          </Select>
          <IconButton
            title="Logout"
            onClick={() => {
              logoutMutation.mutate();
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

const FlagImg = ({ src, alt }: { src: string; alt: string }) => (
  <img
    src={src}
    alt={alt}
    width={20}
    height={15}
    style={{ borderRadius: 2, objectFit: "cover" }}
  />
);
