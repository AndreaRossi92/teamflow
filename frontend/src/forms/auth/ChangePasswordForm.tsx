import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ControlledPasswordField } from "../../components/ControlledPasswordField";

type ChangePasswordFormProps = { onEnter?: () => void };

export function ChangePasswordForm({ onEnter }: ChangePasswordFormProps) {
  const { t } = useTranslation("auth");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onEnter?.();
  };

  return (
    <Stack spacing={2}>
      <ControlledPasswordField
        name="currentPassword"
        label={t("currentPassword")}
        onKeyDown={handleKeyDown}
      />

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
