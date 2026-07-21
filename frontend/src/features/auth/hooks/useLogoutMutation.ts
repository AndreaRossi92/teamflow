import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { logout } from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../providers/useAuth";

export default function useLogoutMutation(options?: UseMutationOptions) {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  return useMutation({
    ...options,
    mutationFn: () => logout(),
    onSuccess: (...other) => {
      setUser(null);
      navigate("/", { replace: true });
      options?.onSuccess?.(...other);
    },
  });
}
