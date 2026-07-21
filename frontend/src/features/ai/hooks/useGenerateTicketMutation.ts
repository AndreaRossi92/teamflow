import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { generateTicket } from "../api";
import type { GeneratedTicket } from "../types/generatedTicket";
import { useTranslation } from "react-i18next";

export default function useGenerateTicketMutation(
  options?: UseMutationOptions<GeneratedTicket, AxiosError, string>,
) {
  const { i18n } = useTranslation();
  return useMutation<GeneratedTicket, AxiosError, string>({
    ...options,
    mutationFn: (customerRequest) =>
      generateTicket(customerRequest, i18n.language),
  });
}
