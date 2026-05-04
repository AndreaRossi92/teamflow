import { useInfiniteQuery } from "@tanstack/react-query";
import type { User } from "../../types/user";
import { usersList } from "../../api/users";

const PAGE_SIZE = 20;

export default function useUsersListQuery() {
  return useInfiniteQuery<User[]>({
    queryKey: ["users"],
    queryFn: ({ pageParam = 1 }) =>
      usersList({ page: pageParam as number, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
  });
}
