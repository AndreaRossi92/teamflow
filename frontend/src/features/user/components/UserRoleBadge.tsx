import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ROLE_COLOR } from "../const/user";
import type { Role } from "../types/user";

type UserRoleBadgeProps = {
  role: Role;
  count?: number;
};

export function UserRoleBadge({ role, count }: UserRoleBadgeProps) {
  const { t } = useTranslation("user");
  return (
    <Chip
      size="small"
      label={count ? `${count} ${t(role)}` : t(role)}
      color={ROLE_COLOR[role]}
    />
  );
}
