import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { Project } from "../types/project";
import { projectAssignUsers } from "../api";

export default function useProjectAssignUsersMutation(
  id: string,
  options?: UseMutationOptions<Project, AxiosError, string[]>,
) {
  return useMutation<Project, AxiosError, string[]>({
    ...options,
    mutationFn: (data) => projectAssignUsers(id, data),
  });
}
