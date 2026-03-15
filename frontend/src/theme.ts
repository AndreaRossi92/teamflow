import { createTheme, useMediaQuery } from "@mui/material";
import { useMemo } from "react";

export default function useAppTheme() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  return useMemo(() => {
    const envTheme = import.meta.env.VITE_THEME;

    if (envTheme === "dark") return darkTheme;
    if (envTheme === "light") return lightTheme;
    return prefersDarkMode ? darkTheme : lightTheme;
  }, [prefersDarkMode]);
}

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});
const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});
