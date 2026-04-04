import { zodResolver } from "@hookform/resolvers/zod";
import { type DefaultValues, type FieldValues, useForm } from "react-hook-form";
import { z } from "zod";

type UseCustomFormParams<TData> = {
  schema: z.ZodType<TData, TData>;
  values?: TData;
  defaultValues?: DefaultValues<TData>;
};

export default function useCustomForm<TData extends FieldValues = FieldValues>({
  schema,
  values,
  defaultValues,
}: UseCustomFormParams<TData>) {
  return useForm<TData>({
    mode: "onTouched",
    resolver: zodResolver(schema),
    defaultValues,
    values,
  });
}
