import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ACTIVE_COLOR } from "../const/user";

type UserActiveBadgeProps = {
  active: "active" | "inactive";
  count?: number;
};

export function UserActiveBadge({ active, count }: UserActiveBadgeProps) {
  const { t } = useTranslation("user");
  return (
    <Chip
      size="small"
      label={count ? `${count} ${t(active)}` : t(active)}
      color={ACTIVE_COLOR[active]}
    />
  );
}
