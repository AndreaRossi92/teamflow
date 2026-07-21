import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { Project } from "../types/project";
import type { ProjectEditFormValues } from "../types/projectForm";
import { editProject } from "../api";

export default function useProjectEditMutation(
  id: string,
  options?: UseMutationOptions<Project, AxiosError, ProjectEditFormValues>,
) {
  return useMutation<Project, AxiosError, ProjectEditFormValues>({
    ...options,
    mutationFn: (data) => editProject(id, data),
  });
}
