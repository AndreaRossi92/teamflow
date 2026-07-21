import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { Project } from "../types/project";
import type { ProjectCreateFormValues } from "../types/projectForm";
import { createProject } from "../api";

export default function useProjectCreateMutation(
  options?: UseMutationOptions<Project, AxiosError, ProjectCreateFormValues>,
) {
  return useMutation<Project, AxiosError, ProjectCreateFormValues>({
    ...options,
    mutationFn: (data) => createProject(data),
  });
}
