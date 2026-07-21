import { useState } from "react";
import { IconButton, type IconButtonProps } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "./ConfirmDialog";

type DeleteIconButtonProps = Omit<IconButtonProps, "title" | "onClick"> & {
  onDelete: () => Promise<unknown>;
  dialogTitle?: string;
  dialogText?: string;
  title?: string;
  deleteLabel?: string;
  cancelLabel?: string;
};

export default function DeleteIconButton({
  onDelete,
  dialogTitle,
  dialogText,
  title,
  deleteLabel,
  cancelLabel,
  ...props
}: DeleteIconButtonProps) {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConfirm = () => {
    onDelete().then(handleClose);
  };

  return (
    <>
      <IconButton
        size="small"
        title={title ?? t("delete")}
        onClick={handleOpen}
        {...props}
      >
        <Delete fontSize="small" />
      </IconButton>

      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
        dialogTitle={dialogTitle}
        dialogText={dialogText}
        confirmLabel={deleteLabel ?? t("delete")}
        cancelLabel={cancelLabel}
      />
    </>
  );
}
