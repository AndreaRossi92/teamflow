import * as z from "zod";
import { TICKET_PRIORITIES } from "./ticket";

export const ticketCreateFormSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  priority: z.enum(TICKET_PRIORITIES),
  projectId: z.string().uuid(),
  assigneeIds: z.array(z.string().uuid()).optional(),
});

export type TicketCreateFormValues = z.infer<typeof ticketCreateFormSchema>;

export const ticketEditFormSchema = ticketCreateFormSchema.partial({
  projectId: true,
  priority: true,
});

export type TicketEditFormValues = z.infer<typeof ticketEditFormSchema>;
