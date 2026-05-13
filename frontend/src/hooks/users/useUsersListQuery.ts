import { useInfiniteQuery } from "@tanstack/react-query";
import type { User, UserFilters } from "../../types/user";
import { usersList } from "../../api/users";

const PAGE_SIZE = 20;

export default function useUsersListQuery(filters?: UserFilters) {
  return useInfiniteQuery<User[]>({
    queryKey: ["users", filters],
    queryFn: ({ pageParam = 1 }) =>
      usersList({ page: pageParam as number, limit: PAGE_SIZE, filters }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
  });
}
