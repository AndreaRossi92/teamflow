import { http, HttpResponse, delay } from "msw";
import { mockGeneratedTicket } from "../data/ai.data";

export const aiHandlers = [
  http.post("/api/ai/generate-ticket", async () => {
    await delay(1500);
    return HttpResponse.json(mockGeneratedTicket);
  }),
];
