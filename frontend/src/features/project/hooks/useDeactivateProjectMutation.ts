import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { Project } from "../types/project";
import { deactivateProjectById } from "../api";

export default function useDeactivateProjectMutation(
  options?: UseMutationOptions<Project, AxiosError, string>,
) {
  return useMutation<Project, AxiosError, string>({
    ...options,
    mutationFn: (id) => deactivateProjectById(id),
  });
}
