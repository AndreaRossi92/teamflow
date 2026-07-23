import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ControlledTextField } from "../../../components/ControlledTextField";
import { ControlledAutocomplete } from "../../../components/ControlledAutocomplete";
import { ROLES } from "../types/user";

type UserEditFormProps = { onEnter?: () => void; disabled?: boolean };

export function UserEditForm({ onEnter, disabled }: UserEditFormProps) {
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
