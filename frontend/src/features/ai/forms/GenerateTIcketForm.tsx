import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ControlledTextField } from "../../../components/ControlledTextField";

type GenerateTicketFormProps = {
  onEnter?: () => void;
};

export function GenerateTicketForm({ onEnter }: GenerateTicketFormProps) {
  const { t } = useTranslation("ticket");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onEnter?.();
  };

  return (
    <Stack spacing={2}>
      <ControlledTextField
        name="request"
        label={t("request")}
        multiline
        rows={6}
        onKeyDown={handleKeyDown}
      />
    </Stack>
  );
}
