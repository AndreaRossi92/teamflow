import { useQuery } from "@tanstack/react-query";
import { projectAssignableUsersList } from "../../api/projects";
import type { AssignableUser } from "../../types/project";
import type { UserFilters } from "../../types/user";

export default function useProjectAssignableUsersQuery(
  id: string,
  filters?: Omit<UserFilters, "isActive">,
) {
  return useQuery<AssignableUser[]>({
    queryKey: ["projects", id, "assignable-users", filters],
    queryFn: () => projectAssignableUsersList({ id, filters }),
    enabled: !!id,
  });
}
