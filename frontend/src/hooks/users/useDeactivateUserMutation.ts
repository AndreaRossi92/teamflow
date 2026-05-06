import { useMutation } from "@tanstack/react-query";
import { deactivateUserById } from "../../api/users";
import type { AxiosError } from "axios";

export default function useDeactivateUserMutation() {
  return useMutation<void, AxiosError, string>({
    mutationFn: (id) => deactivateUserById(id),
  });
}
