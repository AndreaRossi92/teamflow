import type { GeneratedTicket } from "../types/generatedTicket";
import { api } from "./axios.instance";

export async function generateTicket(
  customerRequest: string,
): Promise<GeneratedTicket> {
  const response = await api.post<GeneratedTicket>("/ai/generate-ticket", {
    customerRequest,
  });
  return response.data;
}
