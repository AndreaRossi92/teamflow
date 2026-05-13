import { useMutation } from "@tanstack/react-query";
import { deactivateUserById } from "../../api/users";
import type { AxiosError } from "axios";
import type { User } from "../../types/user";

export default function useDeactivateUserMutation() {
  return useMutation<User, AxiosError, string>({
    mutationFn: (id) => deactivateUserById(id),
  });
}
