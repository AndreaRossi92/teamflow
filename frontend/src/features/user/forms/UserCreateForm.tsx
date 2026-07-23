import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ControlledTextField } from "../../../components/ControlledTextField";
import { ControlledPasswordField } from "../../../components/ControlledPasswordField";
import { ControlledAutocomplete } from "../../../components/ControlledAutocomplete";
import { ROLES } from "../types/user";

type UserCreateFormProps = { onEnter?: () => void; disabled?: boolean };

export function UserCreateForm({ onEnter, disabled }: UserCreateFormProps) {
  const { t } = useTranslation("user");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onEnter?.();
  };

  return (
    <Stack spacing={2}>
      <ControlledTextField
        name="email"
        label={t("email")}
        type="email"
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />

      <ControlledTextField
        name="fullName"
        label={t("fullName")}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />

      <ControlledPasswordField
        name="password"
        label={t("password")}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />

      <ControlledPasswordField
        name="confirmPassword"
        label={t("confirmPassword")}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />

      <ControlledAutocomplete
        name="role"
        label={t("role")}
        options={ROLES}
        getOptionLabel={(option) => t(option)}
        disableClearable
        disabled={disabled}
      />
    </Stack>
  );
}
