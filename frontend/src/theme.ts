import { createTheme, useMediaQuery, type PaletteMode } from "@mui/material";
import { useMemo } from "react";

declare module "@mui/material/styles" {
  interface Palette {
    admin: Palette["primary"];
    manager: Palette["primary"];
    dev: Palette["primary"];
  }
  interface PaletteOptions {
    admin?: PaletteOptions["primary"];
    manager?: PaletteOptions["primary"];
    dev?: PaletteOptions["primary"];
  }
}

declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides {
    admin: true;
    manager: true;
    dev: true;
  }
}

export default function useAppTheme() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  return useMemo(() => {
    return createTheme({
      palette: {
        mode: evalMode(prefersDarkMode),
        admin: {
          main: "#7F77DD",
          light: "#AFA9EC",
          dark: "#534AB7",
          contrastText: "#EEEDFE",
        },
        manager: {
          main: "#1D9E75",
          light: "#5DCAA5",
          dark: "#0F6E56",
          contrastText: "#E1F5EE",
        },
        dev: {
          main: "#D85A30",
          light: "#F0997B",
          dark: "#993C1D",
          contrastText: "#FAECE7",
        },
      },
    });
  }, [prefersDarkMode]);
}

const evalMode = (prefersDarkMode: boolean): PaletteMode => {
  const envTheme = import.meta.env.VITE_THEME;

  if (envTheme === "dark") return "dark";
  if (envTheme === "light") return "light";
  return prefersDarkMode ? "dark" : "light";
};
