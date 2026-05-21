import { useContext } from "react";
import { SnackbarContext } from "./Snackbar.Context";

export const useSnackbar = () => {
  const ctx = useContext(SnackbarContext);

  if (!ctx) {
    throw new Error("useSnackbar must be used inside SnackbarProvider");
  }

  return ctx;
};
