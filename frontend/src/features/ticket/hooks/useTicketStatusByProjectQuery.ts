import { useQuery } from "@tanstack/react-query";
import { ticketStatusByProject } from "../api";
import type { TicketStatusByProject } from "../types/ticket";

export default function useTicketStatusByProjectQuery() {
  return useQuery<TicketStatusByProject[]>({
    queryKey: ["ticketStatusByProject"],
    queryFn: () => ticketStatusByProject(),
  });
}
