import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import type { Ticket, TicketFilters } from "../../types/ticket";
import { ticketsList } from "../../api/tickets";
import type { PaginatedResponse } from "../../types/paginatedResponse";
import type { AxiosError } from "axios";

const PAGE_SIZE = 20;

export default function useTicketsListQuery(filters?: TicketFilters) {
  return useInfiniteQuery<
    PaginatedResponse<Ticket>,
    AxiosError,
    InfiniteData<PaginatedResponse<Ticket>, number>,
    QueryKey,
    number
  >({
    queryKey: ["tickets", filters],
    queryFn: ({ pageParam = 1 }) =>
      ticketsList({ page: pageParam, limit: PAGE_SIZE, filters }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}
