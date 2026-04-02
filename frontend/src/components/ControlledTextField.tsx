import { Controller } from "react-hook-form";
import TextField, { type TextFieldProps } from "@mui/material/TextField";

type ControlledTextFieldProps = {
  name: string;
} & Omit<TextFieldProps, "name" | "defaultValue">;

export function ControlledTextField({
  name,
  ...textFieldProps
}: ControlledTextFieldProps) {
  return (
    <Controller
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...textFieldProps}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          fullWidth
        />
      )}
    />
  );
}
