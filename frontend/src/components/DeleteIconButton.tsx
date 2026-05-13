import { useState } from "react";
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface DeleteButtonProps {
  onDelete: () => Promise<unknown>;
  dialogTitle?: string;
  dialogText?: string;
}

export default function DeleteIconButton({
  onDelete,
  dialogTitle,
  dialogText,
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
      <IconButton size="small" title={t("delete")} onClick={handleOpen}>
        <Delete fontSize="small" />
      </IconButton>

      <Dialog open={open} onClose={handleClose}>
        {dialogTitle && <DialogTitle>{dialogTitle}</DialogTitle>}

        <DialogContent>
          <DialogContentText>
            {dialogText ?? t("dialogDeleteText")}
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            {t("cancel")}
          </Button>
          <Button onClick={handleConfirm} color="error" variant="contained">
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
