import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { UserCreateFormValues } from "../types/userForm";
import type { User } from "../types/user";
import { createUser } from "../api";

export default function useUserCreateMutation(
  options?: UseMutationOptions<
    User,
    AxiosError,
    Omit<UserCreateFormValues, "confirmPassword">
  >,
) {
  return useMutation<
    User,
    AxiosError,
    Omit<UserCreateFormValues, "confirmPassword">
  >({
    ...options,
    mutationFn: (data) => createUser(data),
  });
}
