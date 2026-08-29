import { PieChart, type PieChartProps } from "@mui/x-charts";
import type { TicketPriority, TicketStatus } from "../types/ticket";
import {
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  ListItemButton,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { PRIORITY_COLOR, STATUS_COLOR } from "../const/tickets";
import { useTranslation } from "react-i18next";
import Dot from "../../../components/Dot";
import type { TicketDashboard } from "../types/ticket";
import { useState } from "react";
import { TicketStatusBadge } from "./TicketStatusBadge";
import { TicketPriorityBadge } from "./TicketPriorityBadge";
import { useAuth } from "../../../providers/useAuth";

const PRIORITY_ORDER: TicketPriority[] = ["high", "medium", "low"];
const STATUS_ORDER: TicketStatus[] = ["open", "inProgress", "resolved"];

type TicketDashboardChartProps = Pick<
  PieChartProps,
  "width" | "height" | "loading"
> & {
  ticketDashboard: TicketDashboard[];
};

export default function TicketDashboardChart({
  ticketDashboard,
  ...props
}: TicketDashboardChartProps) {
  const theme = useTheme();
  const { t } = useTranslation("dashboard");
  const { user: loggedUser } = useAuth();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const INNER_RADIUS = isSmallScreen ? 50 : 80;
  const OUTER_RADIUS = isSmallScreen ? 80 : 110;

  const [selectedUser, setSelectedUser] = useState<TicketDashboard | null>(
    null,
  );
  const [mode, setMode] = useState<"status" | "priority">("status");

  const filteredData = ticketDashboard.filter(
    (item) => item.id !== loggedUser?.id,
  );

  const ticketStatusByUserData = ticketDashboard.flatMap((user) =>
    Object.entries(user.ticketBreakdown)
      .filter(([status]) => status !== "closed")
      .sort(
        ([statusA], [statusB]) =>
          STATUS_ORDER.indexOf(statusA as TicketStatus) -
          STATUS_ORDER.indexOf(statusB as TicketStatus),
      )
      .map(([status, priorities]) => ({
        id: `${user.id}-${status}`,
        status,
        label: t(status, { ns: "ticket" }),
        value: Object.values(priorities).reduce(
          (count, priorityCount) => count + priorityCount,
          0,
        ),
        color: theme.palette[STATUS_COLOR[status as TicketStatus]].main,
      })),
  );

  const ticketPriorityByUserData = ticketDashboard.flatMap((user) => {
    const priorities = Object.entries(user.ticketBreakdown)
      .filter(([status]) => status !== "closed")
      .flatMap(([, priorityBreakdown]) => Object.entries(priorityBreakdown));

    const priorityTotals = priorities.reduce<Record<string, number>>(
      (acc, [priority, count]) => {
        acc[priority] = (acc[priority] ?? 0) + count;
        return acc;
      },
      {},
    );

    return Object.entries(priorityTotals)
      .sort(
        ([priorityA], [priorityB]) =>
          PRIORITY_ORDER.indexOf(priorityA as TicketPriority) -
          PRIORITY_ORDER.indexOf(priorityB as TicketPriority),
      )
      .map(([priority, value]) => ({
        id: `${user.id}-${priority}`,
        priority,
        label: t(priority, { ns: "ticket" }),
        value,
        color: theme.palette[PRIORITY_COLOR[priority as TicketPriority]].main,
      }));
  });

  const myTicketStatusData = ticketStatusByUserData.filter(
    (item) => loggedUser?.id && item.id.includes(loggedUser.id),
  );
  const myTicketPriorityData = ticketPriorityByUserData.filter(
    (item) => loggedUser?.id && item.id.includes(loggedUser.id),
  );

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
            <ToggleButton value="status">{t("status")}</ToggleButton>
            <ToggleButton value="priority">{t("priority")}</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {loggedUser?.role !== "dev" && (
          <Typography sx={{ textAlign: "center" }}>
            {!selectedUser ? t("myTickets") : selectedUser.fullName}
          </Typography>
        )}
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
                !selectedUser
                  ? mode === "status"
                    ? myTicketStatusData
                    : myTicketPriorityData
                  : mode === "status"
                    ? ticketStatusByUserData.filter((item) =>
                        item.id.includes(selectedUser.id),
                      )
                    : ticketPriorityByUserData.filter((item) =>
                        item.id.includes(selectedUser.id),
                      ),
              ),
            },
          ]}
          hideLegend
          {...props}
        />
        <Box
          sx={{
            display: "flex",
            height: 100,
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          {!selectedUser
            ? mode === "status"
              ? myTicketStatusData.map(({ status, value }) => (
                  <TicketStatusBadge
                    key={status}
                    status={status as TicketStatus}
                    count={value}
                  />
                ))
              : myTicketPriorityData.map(({ priority, value }) => (
                  <TicketPriorityBadge
                    key={priority}
                    priority={priority as TicketPriority}
                    count={value}
                  />
                ))
            : mode === "status"
              ? ticketStatusByUserData
                  .filter((item) => item.id.includes(selectedUser.id))
                  .map(({ status, value }) => {
                    return (
                      <TicketStatusBadge
                        key={status}
                        status={status as TicketStatus}
                        count={value}
                      />
                    );
                  })
              : ticketPriorityByUserData
                  .filter((item) => item.id.includes(selectedUser.id))
                  .map(({ priority, value }) => {
                    return (
                      <TicketPriorityBadge
                        key={priority}
                        priority={priority as TicketPriority}
                        count={value}
                      />
                    );
                  })}
        </Box>
      </Stack>
      {loggedUser?.role !== "dev" && (
        <Box
          sx={{
            flex: 1,
            overflowY: "scroll",
            flexWrap: "nowrap",
            width: "100%",
            height: "100%",
            maxHeight: isSmallScreen ? 200 : 480,
            maxWidth: 600,
          }}
        >
          <List dense disablePadding>
            {filteredData.map((user) => (
              <ListItem key={user.id} disablePadding>
                <ListItemButton
                  onClick={() =>
                    selectedUser?.id === user.id
                      ? setSelectedUser(null)
                      : setSelectedUser(user)
                  }
                  selected={selectedUser?.id === user.id}
                >
                  <ListItemText
                    primary={
                      <Stack
                        direction="row"
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Stack
                          direction="row"
                          sx={{ alignItems: "center" }}
                          spacing={1}
                        >
                          <Dot color="primary" />
                          <Typography variant="body2">
                            {user.fullName}
                          </Typography>
                        </Stack>
                        <Chip
                          label={userCount(user, { excludeClosed: true })}
                          size="small"
                        />
                      </Stack>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Stack>
  );
}

const userCount = (
  user: TicketDashboard,
  config?: { excludeClosed: boolean },
): number =>
  Object.entries(user.ticketBreakdown)
    .filter(([status]) => (config?.excludeClosed ? status !== "closed" : true))
    .reduce(
      (acc, [_status, priorities]) =>
        acc +
        Object.values(priorities).reduce(
          (count, priorityCount) => count + priorityCount,
          0,
        ),
      0,
    );

const handleZeroValues = (data: { value: number }[]) =>
  data.reduce((acc, cur) => acc + cur.value, 0) <= 0 ? [] : data;
