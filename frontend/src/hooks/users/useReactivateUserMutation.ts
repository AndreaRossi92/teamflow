import { useMutation } from "@tanstack/react-query";
import { reactivateUserById } from "../../api/users";
import type { AxiosError } from "axios";
import type { User } from "../../types/user";

export default function useReactivateUserMutation() {
  return useMutation<User, AxiosError, string>({
    mutationFn: (id) => reactivateUserById(id),
  });
}
