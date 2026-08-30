import { PieChart, type PieChartProps } from "@mui/x-charts";
import {
  Box,
  Stack,
  useTheme,
  useMediaQuery,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Role, UserDashboard } from "../types/user";
import { useState } from "react";
import { ACTIVE_COLOR, ROLE_COLOR } from "../const/user";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserActiveBadge } from "./UserActiveBadge";

const ROLE_ORDER: Role[] = ["admin", "manager", "dev"];

type UserDashboardChartProps = Pick<
  PieChartProps,
  "width" | "height" | "loading"
> & {
  userDashboard: UserDashboard | [];
};

export default function UserDashboardChart({
  userDashboard,
  ...props
}: UserDashboardChartProps) {
  const theme = useTheme();
  const { t } = useTranslation("dashboard");

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const INNER_RADIUS = isSmallScreen ? 50 : 80;
  const OUTER_RADIUS = isSmallScreen ? 80 : 110;

  const [mode, setMode] = useState<"role" | "active">("role");

  const userRoleData = userDashboard
    .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role))
    .map((item) => ({
      id: item.role,
      role: item.role,
      label: t(item.role, { ns: "user" }),
      value: item.active + item.inactive,
      color: theme.palette[ROLE_COLOR[item.role as Role]].main,
    }));

  const userActiveStateData = Object.entries(
    userDashboard.reduce<{ active: number; inactive: number }>(
      (acc, cur) => ({
        active: acc.active + cur.active,
        inactive: acc.inactive + cur.inactive,
      }),
      { active: 0, inactive: 0 },
    ),
  ).map(([active, count]) => ({
    id: active,
    active,
    label: t(active, { ns: "user" }),
    value: count,
    color: theme.palette[ACTIVE_COLOR[active as "active" | "inactive"]].main,
  }));

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      sx={{ alignItems: "center" }}
    >
      <Stack sx={{ flex: 1, width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            height: 100,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ToggleButtonGroup
            color="primary"
            value={mode}
            exclusive
            onChange={(_e, newMode) => {
              if (newMode !== null) setMode(newMode);
            }}
          >
            <ToggleButton value="role">{t("role")}</ToggleButton>
            <ToggleButton value="status">{t("status")}</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <PieChart
          colors={theme.palette.chart.map((item) => item.main)}
          series={[
            {
              innerRadius: INNER_RADIUS,
              outerRadius: OUTER_RADIUS,
              highlightScope: { fade: "global", highlight: "item" },
              highlighted: { additionalRadius: 1 },
              cornerRadius: 2,
              data: handleZeroValues(
                mode === "role" ? userRoleData : userActiveStateData,
              ),
            },
          ]}
          hideLegend
          {...props}
        />
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            height: 100,
            justifyContent: "center",
            gap: 5,
            alignItems: "center",
          }}
        >
          {mode === "role"
            ? userRoleData.map((item) => (
                <UserRoleBadge
                  key={item.id}
                  role={item.role}
                  count={item.value}
                />
              ))
            : userActiveStateData.map((item) => (
                <UserActiveBadge
                  key={item.id}
                  active={item.active as "active" | "inactive"}
                  count={item.value}
                />
              ))}
        </Box>
      </Stack>
    </Stack>
  );
}

const handleZeroValues = (data: { value: number }[]) =>
  data.reduce((acc, cur) => acc + cur.value, 0) <= 0 ? [] : data;
