import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { Ticket } from "../../types/ticket";
import { ticketAssignUsers } from "../../api/tickets";

export default function useTicketAssignUsersMutation(
  id: string,
  options?: UseMutationOptions<Ticket, AxiosError, string[]>,
) {
  return useMutation<Ticket, AxiosError, string[]>({
    ...options,
    mutationFn: (data) => ticketAssignUsers(id, data),
  });
}
