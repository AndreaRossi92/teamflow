import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { UserCreateFormValues } from "../../types/userForm";
import type { User } from "../../types/user";
import { createUser } from "../../api/users";

export default function useUserCreateMutation(
  options?: UseMutationOptions<User, AxiosError, UserCreateFormValues>,
) {
  return useMutation<User, AxiosError, UserCreateFormValues>({
    ...options,
    mutationFn: (data) => createUser(data),
  });
}
