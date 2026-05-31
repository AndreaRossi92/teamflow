import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import type { User, UserFilters } from "../../types/user";
import { usersList } from "../../api/users";
import type { PaginatedResponse } from "../../types/paginatedResponse";
import type { AxiosError } from "axios";

const PAGE_SIZE = 20;

export default function useUsersListQuery(filters?: UserFilters) {
  return useInfiniteQuery<
    PaginatedResponse<User>,
    AxiosError,
    InfiniteData<PaginatedResponse<User>, number>,
    QueryKey,
    number
  >({
    queryKey: ["users", filters],
    queryFn: ({ pageParam = 1 }) =>
      usersList({ page: pageParam as number, limit: PAGE_SIZE, filters }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
