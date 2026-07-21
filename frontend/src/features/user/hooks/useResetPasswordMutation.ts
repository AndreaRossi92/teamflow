import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { resetPassword } from "../api";
import type { ResetPasswordFormValues } from "../../auth/types/resetPasswordForm";

export default function useResetPasswordMutation(
  id: string,
  options?: UseMutationOptions<
    void,
    AxiosError,
    Omit<ResetPasswordFormValues, "confirmNewPassword">
  >,
) {
  return useMutation<
    void,
    AxiosError,
    Omit<ResetPasswordFormValues, "confirmNewPassword">
  >({
    ...options,
    mutationFn: ({ newPassword }) => resetPassword(id, newPassword),
  });
}
