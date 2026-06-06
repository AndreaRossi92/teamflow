import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { deleteProject } from "../../api/projects";

export default function useDeleteProjectMutation(
  options?: UseMutationOptions<void, AxiosError, string>,
) {
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: (id) => deleteProject(id),
  });
}
