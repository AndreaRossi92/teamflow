import { PieChart, type PieChartProps } from "@mui/x-charts";
import type { TicketPriority, TicketStatus } from "../../ticket/types/ticket";
import {
  Box,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  useTheme,
  darken,
  useMediaQuery,
  ListItemButton,
  lighten,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { PRIORITY_COLOR, STATUS_COLOR } from "../../ticket/const/tickets";
import { useTranslation } from "react-i18next";
import Dot from "../../../components/Dot";
import type { ProjectDashboard } from "../types/project";
import { useState } from "react";
import { ArrowForward } from "@mui/icons-material";
import { TicketStatusBadge } from "../../ticket/components/TicketStatusBadge";
import { TicketPriorityBadge } from "../../ticket/components/TicketPriorityBadge";
import { useNavigate } from "react-router-dom";

const PRIORITY_ORDER: TicketPriority[] = ["high", "medium", "low"];
const STATUS_ORDER: TicketStatus[] = ["open", "inProgress", "resolved"];

type ProjectDashboardChartProps = Pick<
  PieChartProps,
  "width" | "height" | "loading"
> & {
  projectDashboard: ProjectDashboard[];
};

export default function ProjectDashboardChart({
  projectDashboard,
  ...props
}: ProjectDashboardChartProps) {
  const theme = useTheme();
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  const INNER_RADIUS = isSmallScreen ? 50 : 80;
  const OUTER_RADIUS = isSmallScreen ? 80 : 110;

  const [selectedProject, setSelectedProject] =
    useState<ProjectDashboard | null>(null);
  const [mode, setMode] = useState<"status" | "priority">("status");

  const sortedProjects = projectDashboard.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const ticketStatusByProjectData = sortedProjects.flatMap((project) =>
    Object.entries(project.ticketBreakdown)
      .filter(([status]) => status !== "closed")
      .sort(
        ([statusA], [statusB]) =>
          STATUS_ORDER.indexOf(statusA as TicketStatus) -
          STATUS_ORDER.indexOf(statusB as TicketStatus),
      )
      .map(([status, priorities]) => ({
        id: `${project.id}-${status}`,
        status,
        label: t(status, { ns: "ticket" }),
        value: Object.values(priorities).reduce(
          (count, priorityCount) => count + priorityCount,
          0,
        ),
        color: theme.palette[STATUS_COLOR[status as TicketStatus]].main,
      })),
  );

  const ticketPriorityByProjectData = sortedProjects.flatMap((project) => {
    const priorities = Object.entries(project.ticketBreakdown)
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
        id: `${project.id}-${priority}`,
        priority,
        label: t(priority, { ns: "ticket" }),
        value,
        color: theme.palette[PRIORITY_COLOR[priority as TicketPriority]].main,
      }));
  });

  const ticketStatusTotalData = Object.entries(
    sortedProjects.reduce<{
      open: number;
      inProgress: number;
      resolved: number;
    }>(
      (acc, cur) => ({
        open:
          acc.open +
          Object.values(cur.ticketBreakdown.open).reduce(
            (count, priority) => count + priority,
            0,
          ),
        inProgress:
          acc.inProgress +
          Object.values(cur.ticketBreakdown.inProgress).reduce(
            (count, priority) => count + priority,
            0,
          ),
        resolved:
          acc.resolved +
          Object.values(cur.ticketBreakdown.resolved).reduce(
            (count, priority) => count + priority,
            0,
          ),
      }),
      { open: 0, inProgress: 0, resolved: 0 },
    ),
  )
    .sort(
      ([statusA], [statusB]) =>
        STATUS_ORDER.indexOf(statusA as TicketStatus) -
        STATUS_ORDER.indexOf(statusB as TicketStatus),
    )
    .map(([status, count]) => ({
      id: status,
      label: t(status, { ns: "ticket" }),
      value: count,
      color: theme.palette[STATUS_COLOR[status as TicketStatus]].main,
    }));

  const ticketPriorityTotalData = Object.entries(
    sortedProjects.reduce<Record<string, number>>((acc, project) => {
      Object.entries(project.ticketBreakdown).forEach(
        ([status, priorityBreakdown]) => {
          if (status === "closed") return;
          Object.entries(priorityBreakdown).forEach(([priority, count]) => {
            acc[priority] = (acc[priority] ?? 0) + count;
          });
        },
      );
      return acc;
    }, {}),
  )
    .sort(
      ([priorityA], [priorityB]) =>
        PRIORITY_ORDER.indexOf(priorityA as TicketPriority) -
        PRIORITY_ORDER.indexOf(priorityB as TicketPriority),
    )
    .map(([priority, count]) => ({
      id: priority,
      label: t(priority, { ns: "ticket" }),
      value: count,
      color: theme.palette[PRIORITY_COLOR[priority as TicketPriority]].main,
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
            <ToggleButton value="status">{t("status")}</ToggleButton>
            <ToggleButton value="priority">{t("priority")}</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Typography sx={{ textAlign: "center" }}>
          {!selectedProject ? t("allProjects") : selectedProject.name}
        </Typography>
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
                !selectedProject
                  ? mode === "status"
                    ? ticketStatusTotalData
                    : ticketPriorityTotalData
                  : mode === "status"
                    ? ticketStatusByProjectData.filter((item) =>
                        item.id.includes(selectedProject.id),
                      )
                    : ticketPriorityByProjectData.filter((item) =>
                        item.id.includes(selectedProject.id),
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
            flexWrap: "wrap",
            height: 100,
            justifyContent: "center",
            gap: 5,
            alignItems: "center",
          }}
        >
          {!selectedProject
            ? mode === "status"
              ? ticketStatusTotalData.map(({ id, value }) => (
                  <TicketStatusBadge
                    key={id}
                    status={id as TicketStatus}
                    count={value}
                  />
                ))
              : ticketPriorityTotalData.map(({ id, value }) => (
                  <TicketPriorityBadge
                    key={id}
                    priority={id as TicketPriority}
                    count={value}
                  />
                ))
            : mode === "status"
              ? ticketStatusByProjectData
                  .filter((item) => item.id.includes(selectedProject.id))
                  .map(({ status, value }) => {
                    return (
                      <TicketStatusBadge
                        key={status}
                        status={status as TicketStatus}
                        count={value}
                      />
                    );
                  })
              : ticketPriorityByProjectData
                  .filter((item) => item.id.includes(selectedProject.id))
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
      <Box
        sx={{
          flex: 1,
          overflowY: "scroll",
          flexWrap: "nowrap",
          width: "100%",
          height: "100%",
          maxHeight: isMediumScreen ? 250 : 500,
          maxWidth: 600,
        }}
      >
        <List dense disablePadding>
          {sortedProjects.map((project) => (
            <ListItem
              key={project.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  color="primary"
                  onClick={() => {
                    navigate(`/project/${project.id}`);
                  }}
                >
                  <ArrowForward />
                </IconButton>
              }
              disablePadding
            >
              <ListItemButton
                onClick={() =>
                  selectedProject?.id === project.id
                    ? setSelectedProject(null)
                    : setSelectedProject(project)
                }
                selected={selectedProject?.id === project.id}
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
                        <Typography variant="body2">{project.name}</Typography>
                      </Stack>
                      <Chip
                        label={projectCount(project, { excludeClosed: true })}
                        size="small"
                      />
                    </Stack>
                  }
                  secondary={
                    <LinearProgress
                      variant="determinate"
                      value={
                        (projectCount(project, { excludeClosed: true }) /
                          projectCount(project)) *
                        100
                      }
                      sx={{
                        my: 1,
                        borderRadius: 5,
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? darken(theme.palette.primary.dark, 0.4)
                            : lighten(theme.palette.primary.light, 0.4),
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: theme.palette.primary.main,
                        },
                      }}
                    />
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Stack>
  );
}

const projectCount = (
  project: ProjectDashboard,
  config?: { excludeClosed: boolean },
): number =>
  Object.entries(project.ticketBreakdown)
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
