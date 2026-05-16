import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AuthUser } from "../../types/authUser";
import type { AxiosError } from "axios";
import { changePassword } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/useAuth";
import type { ChangePasswordFormValues } from "../../types/changePasswordForm";

export default function useChangePasswordMutation(
  options?: UseMutationOptions<
    AuthUser,
    AxiosError,
    Omit<ChangePasswordFormValues, "confirmNewPassword">
  >,
) {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  return useMutation<
    AuthUser,
    AxiosError,
    Omit<ChangePasswordFormValues, "confirmNewPassword">
  >({
    ...options,
    mutationFn: ({ currentPassword, newPassword }) =>
      changePassword(currentPassword, newPassword),
    onSuccess: (user, ...other) => {
      setUser(user);
      navigate(-1);
      options?.onSuccess?.(user, ...other);
    },
  });
}
