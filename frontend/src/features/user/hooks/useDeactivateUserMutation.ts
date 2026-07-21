import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { deactivateUserById } from "../api";
import type { AxiosError } from "axios";
import type { User } from "../types/user";

export default function useDeactivateUserMutation(
  options?: UseMutationOptions<User, AxiosError, string>,
) {
  return useMutation<User, AxiosError, string>({
    ...options,
    mutationFn: (id) => deactivateUserById(id),
  });
}
