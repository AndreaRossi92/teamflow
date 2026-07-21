import * as z from "zod";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "./ticket";
import i18n from "../../../i18n";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

export const ticketCreateFormSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  priority: z.enum(TICKET_PRIORITIES, {
    error: (val) => {
      return val.input === ""
        ? i18n.t("required", { ns: "errors" })
        : i18n.t("invalidValue", { ns: "errors" });
    },
  }),
  project: z.object(
    { id: isDemoMode ? z.string() : z.uuid() },
    {
      error: (val) => {
        return val.input === null
          ? i18n.t("required", { ns: "errors" })
          : i18n.t("invalidType", { ns: "errors" });
      },
    },
  ),
});

export type TicketCreateFormValues = Omit<
  z.infer<typeof ticketCreateFormSchema>,
  "priority" | "project"
> & {
  priority: z.infer<typeof ticketCreateFormSchema>["priority"] | "";
  project: z.infer<typeof ticketCreateFormSchema>["project"] | null;
};

export const ticketEditFormSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  priority: z.enum(TICKET_PRIORITIES, {
    error: (val) => {
      return val.input === ""
        ? i18n.t("required", { ns: "errors" })
        : i18n.t("invalidValue", { ns: "errors" });
    },
  }),
  project: z.object(
    { id: isDemoMode ? z.string() : z.uuid() },
    {
      error: (val) => {
        return val.input === null
          ? i18n.t("required", { ns: "errors" })
          : i18n.t("invalidType", { ns: "errors" });
      },
    },
  ),
  status: z.enum(TICKET_STATUSES, {
    error: (val) => {
      return val.input === ""
        ? i18n.t("required", { ns: "errors" })
        : i18n.t("invalidValue", { ns: "errors" });
    },
  }),
});

export type TicketEditFormValues = Omit<
  z.infer<typeof ticketEditFormSchema>,
  "priority" | "project" | "status"
> & {
  priority: z.infer<typeof ticketEditFormSchema>["priority"] | "";
  project: z.infer<typeof ticketEditFormSchema>["project"] | null;
  status: z.infer<typeof ticketEditFormSchema>["status"] | "";
};
