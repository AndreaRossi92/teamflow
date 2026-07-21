import { setupWorker } from "msw/browser";
import { authHandlers } from "./handlers/auth.handlers";
import { aiHandlers } from "./handlers/ai.handlers";
import { userHandlers } from "./handlers/user.handler";
import { projectHandlers } from "./handlers/project.handler";
import { ticketHandlers } from "./handlers/ticket.handlers";

export const worker = setupWorker(
  ...authHandlers,
  ...aiHandlers,
  ...userHandlers,
  ...projectHandlers,
  ...ticketHandlers,
);
