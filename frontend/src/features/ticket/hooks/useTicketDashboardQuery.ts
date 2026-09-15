import { useQuery } from "@tanstack/react-query";
import { ticketDashboard } from "../api";
import type { TicketDashboard } from "../types/ticket";
import { useAuth } from "../../../providers/useAuth";
import { Role } from "../../user/const/user";

export default function useTicketDashboardQuery() {
  const { user } = useAuth();
  return useQuery<TicketDashboard[]>({
    queryKey: ["ticketDashboard"],
    queryFn: () => ticketDashboard(),
    enabled: user?.role === Role.ADMIN || user?.role === Role.MANAGER,
  });
}
