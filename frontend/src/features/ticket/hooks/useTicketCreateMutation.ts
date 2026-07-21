import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { Ticket } from "../types/ticket";
import type { TicketCreateFormValues } from "../types/ticketForm";
import { createTicket } from "../api";

export default function useTicketCreateMutation(
  options?: UseMutationOptions<Ticket, AxiosError, TicketCreateFormValues>,
) {
  return useMutation<Ticket, AxiosError, TicketCreateFormValues>({
    ...options,
    mutationFn: (data) => createTicket(data),
  });
}
