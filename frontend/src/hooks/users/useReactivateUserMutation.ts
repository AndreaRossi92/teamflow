import { useMutation } from "@tanstack/react-query";
import { reactivateUserById } from "../../api/users";
import type { AxiosError } from "axios";

export default function useReactivateUserMutation() {
  return useMutation<void, AxiosError, string>({
    mutationFn: (id) => reactivateUserById(id),
  });
}
