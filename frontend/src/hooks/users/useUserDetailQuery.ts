import { useQuery } from "@tanstack/react-query";
import type { User } from "../../types/user";
import { userById } from "../../api/users";

export default function useUserDetailQuery(id: string) {
  return useQuery<User>({
    queryKey: ["users", id],
    queryFn: () => userById(id),
    enabled: !!id,
  });
}
