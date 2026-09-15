import { useQuery } from "@tanstack/react-query";
import { userDashboard } from "../api";
import type { UserDashboard } from "../types/user";
import { useAuth } from "../../../providers/useAuth";
import { Role } from "../const/user";

export default function useUserDashboardQuery() {
  const { user } = useAuth();
  return useQuery<UserDashboard>({
    queryKey: ["userDashboard"],
    queryFn: () => userDashboard(),
    enabled: user?.role === Role.ADMIN,
  });
}
