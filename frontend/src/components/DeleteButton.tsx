import { useState } from "react";
import { Button, type ButtonProps } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import DeleteDialog from "./DeleteDialog";

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

      <DeleteDialog
        open={open}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
        dialogTitle={dialogTitle}
        dialogText={dialogText}
        deleteLabel={deleteLabel}
        cancelLabel={cancelLabel}
      />
    </>
  );
}
