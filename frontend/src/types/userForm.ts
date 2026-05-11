import * as z from "zod";
import { ROLES } from "./user";

export const userCreateFormSchema = z
  .object({
    fullName: z.string().min(1),
    email: z.email(),
    password: z.string().min(6),
    confirmPassword: z.string(),
    role: z.enum(ROLES),
  })
  .refine((v) => v.password === v.confirmPassword);

export type UserCreateFormValues = z.infer<typeof userCreateFormSchema>;

export const userEditFormSchema = z.object({
  fullName: z.string().min(1),
  email: z.email(),
  role: z.enum(ROLES),
});

export type UserEditFormValues = z.infer<typeof userEditFormSchema>;
