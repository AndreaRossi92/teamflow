import axios from "axios";
import type { GeneratedTicket } from "../types/generatedTicket";

export async function generateTicket(
  customerRequest: string,
): Promise<GeneratedTicket> {
  const response = await axios.post<GeneratedTicket>(
    "/api/ai/generate-ticket",
    {
      customerRequest,
    },
  );
  return response.data;
}
