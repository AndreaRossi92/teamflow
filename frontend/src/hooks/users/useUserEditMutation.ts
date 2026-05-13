import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { UserEditFormValues } from "../../types/userForm";
import type { User } from "../../types/user";
import { editUser } from "../../api/users";

export default function useUserEditMutation(
  id: string,
  options?: UseMutationOptions<User, AxiosError, UserEditFormValues>,
) {
  return useMutation<User, AxiosError, UserEditFormValues>({
    ...options,
    mutationFn: (data) => editUser(id, data),
  });
}
