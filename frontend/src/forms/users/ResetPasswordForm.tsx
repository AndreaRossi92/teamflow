import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ControlledPasswordField } from "../../components/ControlledPasswordField";

type ResetPasswordFormProps = { onEnter?: () => void };

export function ResetPasswordForm({ onEnter }: ResetPasswordFormProps) {
  const { t } = useTranslation("user");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onEnter?.();
  };

  return (
    <Stack spacing={2}>
      <ControlledPasswordField
        name="newPassword"
        label={t("newPassword")}
        onKeyDown={handleKeyDown}
      />

      <ControlledPasswordField
        name="confirmNewPassword"
        label={t("confirmNewPassword")}
        onKeyDown={handleKeyDown}
      />
    </Stack>
  );
}
