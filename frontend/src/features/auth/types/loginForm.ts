import * as z from "zod";

export const loginFormSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
