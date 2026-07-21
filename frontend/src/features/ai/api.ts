import type { GeneratedTicket } from "./types/generatedTicket";
import { api } from "../../api/axios.instance";

export async function generateTicket(
  customerRequest: string,
  language: string,
): Promise<GeneratedTicket> {
  const response = await api.post<GeneratedTicket>("/ai/generate-ticket", {
    customerRequest,
    language,
  });
  return response.data;
}
