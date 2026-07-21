import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  TICKET_STATUSES,
  type Ticket,
  type TicketStatus,
} from "../../types/ticket";
import { updateTicketStatus } from "../../api/tickets";

export default function useUpdateTicketStatusMutation(
  id: string,
  options?: UseMutationOptions<Ticket, AxiosError, TicketStatus | "">,
) {
  return useMutation<Ticket, AxiosError, TicketStatus | "">({
    ...options,
    mutationFn: (status) =>
      updateTicketStatus(id, status || TICKET_STATUSES[0]),
  });
}
