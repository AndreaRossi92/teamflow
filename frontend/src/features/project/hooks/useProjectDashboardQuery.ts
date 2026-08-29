import { useQuery } from "@tanstack/react-query";
import { projectDashboard } from "../api";
import type { ProjectDashboard } from "../types/project";

export default function useProjectDashboardQuery() {
  return useQuery<ProjectDashboard[]>({
    queryKey: ["projectDashboard"],
    queryFn: () => projectDashboard(),
  });
}
