import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AuthUser } from "../../types/authUser";
import type { AxiosError } from "axios";
import type { LoginFormValues } from "../../types/loginForm";
import { login } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/useAuth";

export default function useLoginMutation(
  options?: UseMutationOptions<AuthUser, AxiosError, LoginFormValues>,
) {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  return useMutation<AuthUser, AxiosError, LoginFormValues>({
    ...options,
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (user, ...other) => {
      setUser(user);
      navigate("/", { replace: true });
      options?.onSuccess?.(user, ...other);
    },
  });
}
