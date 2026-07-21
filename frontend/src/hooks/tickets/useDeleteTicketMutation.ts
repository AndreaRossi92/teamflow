import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { deleteTicket } from "../../api/tickets";

export default function useDeleteTicketMutation(
  options?: UseMutationOptions<void, AxiosError, string>,
) {
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: (id) => deleteTicket(id),
  });
}
