import { Stack } from "@mui/material";
import { ControlledTextField } from "../components/ControlledTextField";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { ControlledPasswordField } from "../components/ControlledPasswordField";

export const loginFormSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

type LoginFormProps = { onEnter?: () => void };

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm({ onEnter }: LoginFormProps) {
  const { t } = useTranslation("auth");

  return (
    <Stack spacing={2}>
      <ControlledTextField
        name="email"
        fullWidth
        label={t("login.email")}
        type="email"
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter?.();
        }}
      />

      <ControlledPasswordField
        name="password"
        fullWidth
        label={t("login.password")}
        type="password"
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter?.();
        }}
      />
    </Stack>
  );
}
