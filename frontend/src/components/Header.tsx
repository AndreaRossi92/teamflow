import {
  AppBar,
  Toolbar,
  Select,
  MenuItem,
  type SelectChangeEvent,
  Stack,
  Chip,
  IconButton,
  Button,
  Menu,
  ListItemIcon,
  ListItemText,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  Avatar,
  useTheme,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import useLogoutMutation from "../features/auth/hooks/useLogoutMutation";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../providers/useAuth";
import { Menu as MenuIcon } from "@mui/icons-material";
import {
  Group,
  Folder,
  Assignment,
  PersonAddAlt1,
  CreateNewFolder,
  Logout,
  Password,
  AssignmentAdd,
} from "@mui/icons-material";
import { ROLE_COLOR } from "../features/user/const/user";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flagSrc: "https://flagcdn.com/gb.svg" },
  { code: "it", label: "Italiano", flagSrc: "https://flagcdn.com/it.svg" },
] as const;

const DRAWER_WIDTH = 240;

type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

function resolveLanguageCode(lng: string): LanguageCode {
  const match = SUPPORTED_LANGUAGES.find(({ code }) => lng.startsWith(code));
  return match?.code ?? SUPPORTED_LANGUAGES[0].code;
}

export default function Header() {
  const theme = useTheme();
  const { i18n, t } = useTranslation("common");
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const logoutMutation = useLogoutMutation();

  const currentLanguage = resolveLanguageCode(i18n.language);

  const handleLanguageChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
  };

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={1}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          {isAuthenticated && (
            <IconButton
              onClick={() => {
                setIsOpenDrawer(!isOpenDrawer);
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Button
            variant="text"
            sx={{ fontWeight: "bold" }}
            onClick={() => {
              navigate("/", { replace: true });
            }}
            title={t("home")}
          >
            TeamFlow
          </Button>
          {isDemoMode && (
            <Chip
              label={t("demo")}
              variant="outlined"
              size="small"
              color="primary"
            />
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
          {isAuthenticated && (
            <IconButton size="small">
              <Avatar
                title={`${user?.fullName} - ${t(user?.role ?? "", { ns: "user" })}`}
                sx={{
                  bgcolor: theme.palette[ROLE_COLOR[user?.role ?? "dev"]].main,
                  color:
                    theme.palette[ROLE_COLOR[user?.role ?? "dev"]].contrastText,
                }}
                onClick={(e) => {
                  setAnchorEl(e.currentTarget);
                }}
              >{`${user?.fullName[0]}${user?.fullName.split(" ")?.[1]?.[0] ?? ""}`}</Avatar>
            </IconButton>
          )}
          <Menu
            open={!!anchorEl}
            anchorEl={anchorEl}
            onClose={() => {
              setAnchorEl(null);
            }}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate("/change-password");
              }}
            >
              <ListItemIcon>
                <Password />
              </ListItemIcon>
              <ListItemText>{t("changePassword")}</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                logoutMutation.mutate();
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText>{t("logout")}</ListItemText>
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
      <Drawer
        open={isOpenDrawer}
        onClose={() => {
          setIsOpenDrawer(false);
        }}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {user?.role === "admin" && (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    textAlign: "center",
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                  }}
                >
                  {t("users")}
                </Typography>
                <ListItem disablePadding>
                  <ListItemButton
                    sx={{ gap: 1 }}
                    onClick={() => {
                      navigate("/users");
                      setIsOpenDrawer(false);
                    }}
                  >
                    <ListItemIcon>
                      <Group />
                    </ListItemIcon>
                    <ListItemText
                      primary={t("userList")}
                      slotProps={{ primary: { variant: "body1" } }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    sx={{ gap: 1 }}
                    onClick={() => {
                      navigate("/user/create");
                      setIsOpenDrawer(false);
                    }}
                  >
                    <ListItemIcon>
                      <PersonAddAlt1 />
                    </ListItemIcon>
                    <ListItemText
                      primary={t("addUser")}
                      slotProps={{ primary: { variant: "body1" } }}
                    />
                  </ListItemButton>
                </ListItem>
              </>
            )}
            <>
              <Typography
                variant="h6"
                sx={{
                  textAlign: "center",
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                {t("projects")}
              </Typography>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ gap: 1 }}
                  onClick={() => {
                    navigate("/projects");
                    setIsOpenDrawer(false);
                  }}
                >
                  <ListItemIcon>
                    <Folder />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("projectList")}
                    slotProps={{ primary: { variant: "body1" } }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ gap: 1 }}
                  onClick={() => {
                    navigate("/project/create");
                    setIsOpenDrawer(false);
                  }}
                >
                  <ListItemIcon>
                    <CreateNewFolder />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("addProject")}
                    slotProps={{ primary: { variant: "body1" } }}
                  />
                </ListItemButton>
              </ListItem>
            </>
            <>
              <Typography
                variant="h6"
                sx={{
                  textAlign: "center",
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                {t("tickets")}
              </Typography>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ gap: 1 }}
                  onClick={() => {
                    navigate("/tickets");
                    setIsOpenDrawer(false);
                  }}
                >
                  <ListItemIcon>
                    <Assignment />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("ticketList")}
                    slotProps={{ primary: { variant: "body1" } }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ gap: 1 }}
                  onClick={() => {
                    navigate("/ticket/create");
                    setIsOpenDrawer(false);
                  }}
                >
                  <ListItemIcon>
                    <AssignmentAdd />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("addTicket")}
                    slotProps={{ primary: { variant: "body1" } }}
                  />
                </ListItemButton>
              </ListItem>
            </>
          </List>
        </Box>
      </Drawer>
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
