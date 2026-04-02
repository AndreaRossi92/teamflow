import { type TextFieldProps } from "@mui/material/TextField";
import { ControlledTextField } from "./ControlledTextField";
import { IconButton, InputAdornment } from "@mui/material";
import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

type ControlledPasswordFieldProps = {
  name: string;
} & Omit<TextFieldProps, "name" | "defaultValue">;

export function ControlledPasswordField({
  name,
  ...textFieldProps
}: ControlledPasswordFieldProps) {
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
                onClick={() => {
                  setShowPassword(!showPassword);
                }}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
