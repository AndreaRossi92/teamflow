import { setupWorker } from "msw/browser";
import { authHandlers } from "./handlers/auth.handlers";
import { aiHandlers } from "./handlers/ai.handlers";
import { userHandlers } from "./handlers/user.handler";

export const worker = setupWorker(
  ...authHandlers,
  ...aiHandlers,
  ...userHandlers,
);
