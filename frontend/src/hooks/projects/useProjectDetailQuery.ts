import { useQuery } from "@tanstack/react-query";
import { projectById } from "../../api/projects";
import type { Project } from "../../types/project";

export default function useProjectDetailQuery(id: string) {
  return useQuery<Project>({
    queryKey: ["projects", id],
    queryFn: () => projectById(id),
    enabled: !!id,
  });
}
