import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ControlledPasswordField } from "../../../components/ControlledPasswordField";

type ChangePasswordFormProps = { onEnter?: () => void; disabled?: boolean };

export function ChangePasswordForm({
  onEnter,
  disabled,
}: ChangePasswordFormProps) {
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
        disabled={disabled}
      />

      <ControlledPasswordField
        name="newPassword"
        label={t("newPassword")}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />

      <ControlledPasswordField
        name="confirmNewPassword"
        label={t("confirmNewPassword")}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
    </Stack>
  );
}
