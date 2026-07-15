import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  type DialogProps,
} from "@mui/material";
import { useTranslation } from "react-i18next";

type DeleteDialogProps = Omit<DialogProps, "onClose"> & {
  handleConfirm: () => void;
  handleClose: () => void;
  dialogTitle?: string;
  dialogText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export default function ConfirmDialog({
  handleConfirm,
  dialogTitle,
  dialogText,
  confirmLabel,
  cancelLabel,
  handleClose,
  open,
}: DeleteDialogProps) {
  const { t } = useTranslation("common");

  return (
    <Dialog open={open} onClose={handleClose}>
      {dialogTitle && <DialogTitle>{dialogTitle}</DialogTitle>}

      <DialogContent>
        <DialogContentText>
          {dialogText ?? t("dialogDeleteText")}
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          {cancelLabel ?? t("cancel")}
        </Button>
        <Button onClick={handleConfirm} color="error" variant="contained">
          {confirmLabel ?? t("confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
