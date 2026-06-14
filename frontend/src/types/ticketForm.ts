import * as z from "zod";
import { TICKET_PRIORITIES } from "./ticket";
import i18n from "../i18n";

export const ticketCreateFormSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  priority: z.enum(TICKET_PRIORITIES),
  project: z.object(
    { id: z.uuid() },
    {
      error: (val) => {
        console.log(val);
        return val.input === null
          ? i18n.t("required", { ns: "errors" })
          : i18n.t("invalidType", { ns: "errors" });
      },
    },
  ),
});

export type TicketCreateFormValues = Omit<
  z.infer<typeof ticketCreateFormSchema>,
  "project"
> & { project: z.infer<typeof ticketCreateFormSchema>["project"] | null };

export const ticketEditFormSchema = ticketCreateFormSchema;

export type TicketEditFormValues = z.infer<typeof ticketEditFormSchema>;
