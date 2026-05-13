import { Controller, useFormContext } from "react-hook-form";
import Autocomplete, {
  type AutocompleteProps,
} from "@mui/material/Autocomplete";
import TextField, { type TextFieldProps } from "@mui/material/TextField";

type ControlledAutocompleteProps<
  TOption,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
> = {
  name: string;
  label?: string;
  textFieldProps?: Omit<
    TextFieldProps,
    "name" | "label" | "error" | "helperText"
  >;
} & Omit<
  AutocompleteProps<TOption, Multiple, DisableClearable, FreeSolo>,
  "renderInput" | "name"
>;

export function ControlledAutocomplete<
  TOption,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
>({
  name,
  label,
  textFieldProps,
  ...autocompleteProps
}: ControlledAutocompleteProps<TOption, Multiple, DisableClearable, FreeSolo>) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Autocomplete
          {...autocompleteProps}
          value={field.value ?? (autocompleteProps.multiple ? [] : null)}
          onChange={(_event, newValue) => field.onChange(newValue)}
          onBlur={field.onBlur}
          renderInput={(params) => (
            <TextField
              {...params}
              {...textFieldProps}
              label={label}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              fullWidth
            />
          )}
        />
      )}
    />
  );
}
