import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { Project } from "../../types/project";
import { reactivateProjectById } from "../../api/projects";

export default function useReactivateProjectMutation(
  options?: UseMutationOptions<Project, AxiosError, string>,
) {
  return useMutation<Project, AxiosError, string>({
    ...options,
    mutationFn: (id) => reactivateProjectById(id),
  });
}
