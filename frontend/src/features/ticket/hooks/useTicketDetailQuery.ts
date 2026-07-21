import { useQuery } from "@tanstack/react-query";
import { ticketById } from "../api";
import type { Ticket } from "../types/ticket";

export default function useTicketDetailQuery(id: string) {
  return useQuery<Ticket>({
    queryKey: ["tickets", id],
    queryFn: () => ticketById(id),
    enabled: !!id,
  });
}
