import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { Ticket } from "../../types/ticket";
import type { TicketEditFormValues } from "../../types/ticketForm";
import { editTicket } from "../../api/tickets";

export default function useTicketEditMutation(
  id: string,
  options?: UseMutationOptions<Ticket, AxiosError, TicketEditFormValues>,
) {
  return useMutation<Ticket, AxiosError, TicketEditFormValues>({
    ...options,
    mutationFn: (data) => editTicket(id, data),
  });
}
