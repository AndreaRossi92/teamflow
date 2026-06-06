import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { deleteUser } from "../../api/users";
import type { AxiosError } from "axios";

export default function useDeleteUserMutation(
  options?: UseMutationOptions<void, AxiosError, string>,
) {
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: (id) => deleteUser(id),
  });
}
