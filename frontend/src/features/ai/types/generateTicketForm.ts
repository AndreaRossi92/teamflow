import * as z from "zod";

export const generateTicketFormSchema = z.object({
  request: z.string().min(1),
});

export type GenerateTicketFormValues = { request: string };
