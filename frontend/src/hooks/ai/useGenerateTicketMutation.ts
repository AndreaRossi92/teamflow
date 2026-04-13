import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { generateTicket } from "../../api/ai";
import type { GeneratedTicket } from "../../types/generatedTicket";

export default function useGenerateTicketMutation(
  options?: UseMutationOptions<GeneratedTicket, AxiosError, string>,
) {
  return useMutation<GeneratedTicket, AxiosError, string>({
    ...options,
    mutationFn: (customerRequest) => generateTicket(customerRequest),
  });
}
