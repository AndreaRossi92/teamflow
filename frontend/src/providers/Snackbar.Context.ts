import type { AlertColor } from "@mui/material";
import { createContext } from "react";

export type SnackbarContextType = {
  showMessage: (message: string, severity: AlertColor) => void;
};

export const SnackbarContext = createContext<SnackbarContextType | null>(null);
