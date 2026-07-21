import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { reactivateUserById } from "../api";
import type { AxiosError } from "axios";
import type { User } from "../types/user";

export default function useReactivateUserMutation(
  options?: UseMutationOptions<User, AxiosError, string>,
) {
  return useMutation<User, AxiosError, string>({
    ...options,
    mutationFn: (id) => reactivateUserById(id),
  });
}
