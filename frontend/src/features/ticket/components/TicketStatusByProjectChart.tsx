import { PieChart, type PieChartProps } from "@mui/x-charts";
import type { TicketStatus, TicketStatusByProject } from "../types/ticket";
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
} from "@mui/material";
import { STATUS_COLOR } from "../const/tickets";
import { useTranslation } from "react-i18next";
import Dot from "../../../components/Dot";

const INNER_RADIUS = 50;
const MIDDLE_RADIUS = 120;
const OUTER_RADIUS = 140;
const MAX_SHOWN = 3;

type TicketStatusByProjectChartProps = Pick<
  PieChartProps,
  "width" | "height" | "loading"
> & {
  ticketStatusByProject: TicketStatusByProject[];
};

export default function TicketStatusByProjectChart({
  ticketStatusByProject,
  ...props
}: TicketStatusByProjectChartProps) {
  const theme = useTheme();
  const { t } = useTranslation("dashboard");

  const notClosedAggregatedData = ticketStatusByProject
    .map((project) => ({
      id: project.projectId,
      label: project.projectName,
      data: Object.fromEntries(
        Object.entries(project.tickets).filter(
          ([status, _count]) => status !== "closed",
        ),
      ) as Record<TicketStatus, number>,
      notClosedTotal: Object.entries(project.tickets)
        .filter(([status, _count]) => status !== "closed")
        .reduce((acc, [_status, count]) => acc + count, 0),
      total: Object.entries(project.tickets).reduce(
        (acc, [_status, count]) => acc + count,
        0,
      ),
    }))
    .sort((a, b) => b.notClosedTotal - a.notClosedTotal)
    .reduce<
      {
        id: string;
        label: string;
        data: Record<TicketStatus, number>;
        notClosedTotal: number;
        total: number;
      }[]
    >((acc, item, index) => {
      if (index < MAX_SHOWN) {
        acc.push(item);
      } else {
        const others = acc.find((i) => i.id === "others");
        if (others) {
          others.notClosedTotal += item.notClosedTotal;
          others.total += item.total;
          for (const [status, count] of Object.entries(item.data)) {
            others.data[status as TicketStatus] =
              (others.data[status as TicketStatus] ?? 0) + count;
          }
        } else {
          acc.push({
            id: "others",
            label: t("others"),
            data: item.data,
            notClosedTotal: item.notClosedTotal,
            total: item.total,
          });
        }
      }
      return acc;
    }, []);

  const ticketByProjectData = notClosedAggregatedData.map((project) => ({
    id: project.id,
    label: project.label,
    value: project.notClosedTotal,
  }));

  const ticketStatusByProjectData = notClosedAggregatedData.flatMap((project) =>
    Object.entries(project.data).map(([status, count]) => ({
      id: `${project.id}-${status}`,
      label: `${project.label} - ${t(status, { ns: "ticket" })}`,
      value: count,
      color: theme.palette[STATUS_COLOR[status as TicketStatus]].main,
    })),
  );

  return (
    <Stack direction="row" sx={{ alignItems: "center" }}>
      <PieChart
        colors={theme.palette.chart.map((item) => item.main)}
        series={[
          {
            innerRadius: INNER_RADIUS,
            outerRadius: MIDDLE_RADIUS,
            highlightScope: { fade: "global", highlight: "item" },
            highlighted: { additionalRadius: 1 },
            cornerRadius: 3,
            data: ticketByProjectData,
          },
          {
            innerRadius: MIDDLE_RADIUS,
            outerRadius: OUTER_RADIUS,
            highlightScope: { fade: "global", highlight: "item" },
            highlighted: { additionalRadius: 1 },
            cornerRadius: 3,
            data: ticketStatusByProjectData,
          },
        ]}
        hideLegend
        {...props}
      />
      <Box
        sx={{
          flex: 1,
          overflowY: "scroll",
          flexWrap: "nowrap",
          height: "100%",
          maxHeight: 400,
          maxWidth: 400,
        }}
      >
        <List dense disablePadding>
          {notClosedAggregatedData.map(
            ({ id, label, notClosedTotal, total }, idx) => (
              <ListItem key={id}>
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
                        <Dot color={theme.palette.chart[idx].main} />
                        <Typography variant="body2">{label}</Typography>
                      </Stack>
                      <Chip label={notClosedTotal} size="small" />
                    </Stack>
                  }
                  secondary={
                    <LinearProgress
                      variant="determinate"
                      value={(notClosedTotal / total) * 100}
                      sx={{
                        my: 1,
                        borderRadius: 5,
                        bgcolor: darken(theme.palette.chart[idx].dark, 0.4),
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: theme.palette.chart[idx].main,
                        },
                      }}
                    />
                  }
                />
              </ListItem>
            ),
          )}
        </List>
      </Box>
    </Stack>
  );
}
