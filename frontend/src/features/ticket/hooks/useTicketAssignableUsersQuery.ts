import { useQuery } from "@tanstack/react-query";
import { ticketAssignableUsersList } from "../api";
import type { AssignableUser } from "../types/ticket";
import type { UserFilters } from "../../user/types/user";

export default function useTicketAssignableUsersQuery(
  id: string,
  filters?: Omit<UserFilters, "isActive">,
) {
  return useQuery<AssignableUser[]>({
    queryKey: ["tickets", id, "assignable-users", filters],
    queryFn: () => ticketAssignableUsersList({ id, filters }),
    enabled: !!id,
  });
}
