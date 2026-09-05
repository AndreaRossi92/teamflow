import { createTheme, useMediaQuery, type PaletteMode } from "@mui/material";
import { useMemo } from "react";
import type {} from "@mui/x-charts/themeAugmentation";
import { useTranslation } from "react-i18next";

declare module "@mui/material/styles" {
  interface Palette {
    admin: Palette["primary"];
    manager: Palette["primary"];
    dev: Palette["primary"];
    chart: Palette["primary"][];
  }
  interface PaletteOptions {
    admin?: PaletteOptions["primary"];
    manager?: PaletteOptions["primary"];
    dev?: PaletteOptions["primary"];
    chart?: PaletteOptions["primary"][];
  }
}

declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides {
    admin: true;
    manager: true;
    dev: true;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    admin: true;
    manager: true;
    dev: true;
  }
}

export default function useAppTheme() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const { t } = useTranslation("common");

  return useMemo(() => {
    const theme = createTheme();
    return createTheme({
      palette: {
        mode: evalMode(prefersDarkMode),
        admin: theme.palette.augmentColor({
          color: { main: "#7F77DD" },
          name: "admin",
        }),
        manager: theme.palette.augmentColor({
          color: { main: "#1D9E75" },
          name: "manager",
        }),
        dev: theme.palette.augmentColor({
          color: { main: "#D85A30" },
          name: "dev",
        }),
        chart: [
          "#0072B2",
          "#E69F00",
          "#009E73",
          "#CC79A7",
          "#56B4E9",
          "#D55E00",
          "#F0E442",
          "#332288",
          "#88CCEE",
          "#999933",
        ].map((item) => theme.palette.augmentColor({ color: { main: item } })),
      },
      components: {
        MuiChartsLocalizationProvider: {
          defaultProps: {
            localeText: {
              loading: t("loading"),
              noData: t("noData"),
            },
          },
        },
        MuiTypography: {
          defaultProps: {
            sx: { wordBreak: "break-word", overflowWrap: "anywhere" },
          },
        },
      },
    });
  }, [prefersDarkMode, t]);
}

const evalMode = (prefersDarkMode: boolean): PaletteMode => {
  const envTheme = import.meta.env.VITE_THEME;

  if (envTheme === "dark") return "dark";
  if (envTheme === "light") return "light";
  return prefersDarkMode ? "dark" : "light";
};
