import { useQuery } from "@tanstack/react-query";
import { ticketDevDashboard } from "../api";
import type { TicketDashboard } from "../types/ticket";
import { useAuth } from "../../../providers/useAuth";
import { Role } from "../../user/const/user";

export default function useTicketDevDashboardQuery() {
  const { user } = useAuth();
  return useQuery<TicketDashboard>({
    queryKey: ["ticketDevDashboard"],
    queryFn: () => ticketDevDashboard(),
    enabled: user?.role === Role.DEV,
  });
}
