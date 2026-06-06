import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  type ButtonProps,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

type DeleteButtonProps = Omit<ButtonProps, "onClick"> & {
  onDelete: () => Promise<unknown>;
  dialogTitle?: string;
  dialogText?: string;
  deleteLabel?: string;
  cancelLabel?: string;
};

export default function DeleteButton({
  onDelete,
  dialogTitle,
  dialogText,
  deleteLabel,
  cancelLabel,
  children,
  ...props
}: DeleteButtonProps) {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConfirm = () => {
    onDelete().then(handleClose);
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        startIcon={<Delete />}
        variant="contained"
        color="error"
        {...props}
      >
        {children ?? t("delete")}
      </Button>

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
            {deleteLabel ?? t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
