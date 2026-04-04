import { type TextFieldProps } from "@mui/material/TextField";
import { ControlledTextField } from "./ControlledTextField";
import { IconButton, InputAdornment } from "@mui/material";
import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useTranslation } from "react-i18next";

type ControlledPasswordFieldProps = {
  name: string;
} & Omit<TextFieldProps, "name" | "defaultValue">;

export function ControlledPasswordField({
  name,
  ...textFieldProps
}: ControlledPasswordFieldProps) {
  const { t } = useTranslation("common");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ControlledTextField
      name={name}
      {...textFieldProps}
      type={showPassword ? "text" : "password"}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                tabIndex={-1}
                aria-label={
                  showPassword ? t("hidePassword") : t("showPassword")
                }
              >
                {showPassword ? (
                  <VisibilityOff aria-hidden="true" />
                ) : (
                  <Visibility aria-hidden="true" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
