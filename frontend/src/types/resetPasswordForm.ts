import z from "zod";
import i18n from "../i18n";

export const resetPasswordFormSchema = z
  .object({
    newPassword: z.string().min(6),
    confirmNewPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmNewPassword, {
    path: ["confirmNewPassword"],
    error: i18n.t("passwordsDontMatch", { ns: "errors", lng: i18n.language }),
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
