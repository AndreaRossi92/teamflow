import * as z from "zod";

export const projectCreateFormSchema = z.object({
  name: z.string().min(2),
  description: z.string(),
});

export type ProjectCreateFormValues = z.infer<typeof projectCreateFormSchema>;

export const projectEditFormSchema = projectCreateFormSchema;

export type ProjectEditFormValues = z.infer<typeof projectEditFormSchema>;
