import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ControlledTextField } from "../../../components/ControlledTextField";

type ProjectCreateFormProps = { onEnter?: () => void };

export function ProjectCreateForm({ onEnter }: ProjectCreateFormProps) {
  const { t } = useTranslation("project");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onEnter?.();
  };

  return (
    <Stack spacing={2}>
      <ControlledTextField
        name="name"
        label={t("name")}
        onKeyDown={handleKeyDown}
      />

      <ControlledTextField
        name="description"
        label={t("description")}
        multiline
        rows={5}
        onKeyDown={handleKeyDown}
      />
    </Stack>
  );
}
