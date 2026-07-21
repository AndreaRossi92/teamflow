import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import type { Project, ProjectFilters } from "../types/project";
import { projectsList } from "../api";
import type { PaginatedResponse } from "../../../types/paginatedResponse";
import type { AxiosError } from "axios";

const PAGE_SIZE = 20;

export default function useProjectsListQuery(filters?: ProjectFilters) {
  return useInfiniteQuery<
    PaginatedResponse<Project>,
    AxiosError,
    InfiniteData<PaginatedResponse<Project>, number>,
    QueryKey,
    number
  >({
    queryKey: ["projects", filters],
    queryFn: ({ pageParam = 1 }) =>
      projectsList({ page: pageParam, limit: PAGE_SIZE, filters }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
