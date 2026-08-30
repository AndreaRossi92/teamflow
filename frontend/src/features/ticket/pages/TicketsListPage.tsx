import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Divider,
  Icon,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Add, Edit, Group } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import SearchIcon from "@mui/icons-material/Search";
import PageHeader from "../../../components/PageHeader";
import { useAuth } from "../../../providers/useAuth";
import useTicketsListQuery from "../hooks/useTicketsListQuery";
import TicketsList from "../components/TicketsList";
import type { Ticket, TicketPriority, TicketStatus } from "../types/ticket";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "../types/ticket";
import { PRIORITY_COLOR, STATUS_COLOR } from "../const/tickets";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

export default function TicketsListPage() {
  const { t } = useTranslation("ticket");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [debouncedTitle] = useDebounce(title, 400);
  const [status, setStatus] = useState<TicketStatus | null>(null);
  const [priority, setPriority] = useState<TicketPriority | null>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
  } = useTicketsListQuery({
    title: debouncedTitle || undefined,
    status,
    priority,
  });

  const tickets =
    data?.pages.reduce((acc, page) => [...acc, ...page.data], [] as Ticket[]) ??
    [];

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      <PageHeader
        title={t("tickets")}
        subtitle={t("list")}
        actions={
          user?.role === "admin" || user?.role === "manager" ? (
            <IconButton
              size="small"
              title={t("add", { ns: "common" })}
              onClick={() => navigate("/ticket/create")}
            >
              <Add />
            </IconButton>
          ) : undefined
        }
        BackButtonProps={{ path: "/", replace: true }}
      />

      {isDemoMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("demoList")}
        </Alert>
      )}

      <TextField
        fullWidth
        size="small"
        placeholder={t("searchByTitle")}
        label={t("title")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Icon>
                  <SearchIcon />
                </Icon>
              </InputAdornment>
            ),
          },
        }}
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 2 }}
        divider={<Divider orientation="vertical" flexItem />}
      >
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 0.5, display: "block" }}
          >
            {t("status")}
          </Typography>
          <ToggleButtonGroup
            value={status}
            exclusive
            onChange={(_, v) => setStatus(v === "ALL" ? null : v)}
            size="small"
          >
            <ToggleButton value="ALL">{t("all")}</ToggleButton>
            {TICKET_STATUSES.map((s) => (
              <ToggleButton
                key={s}
                value={s}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: `${STATUS_COLOR[s]}.main`,
                    color: `${STATUS_COLOR[s]}.contrastText`,
                    "&:hover": {
                      backgroundColor: `${STATUS_COLOR[s]}.dark`,
                    },
                  },
                }}
              >
                {t(s)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 0.5, display: "block" }}
          >
            {t("priority")}
          </Typography>
          <ToggleButtonGroup
            value={priority}
            exclusive
            onChange={(_, v) => setPriority(v === "ALL" ? null : v)}
            size="small"
          >
            <ToggleButton value="ALL">{t("all")}</ToggleButton>
            {TICKET_PRIORITIES.map((p) => (
              <ToggleButton
                key={p}
                value={p}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: `${PRIORITY_COLOR[p]}.main`,
                    color: `${PRIORITY_COLOR[p]}.contrastText`,
                    "&:hover": {
                      backgroundColor: `${PRIORITY_COLOR[p]}.dark`,
                    },
                  },
                }}
              >
                {t(p)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Stack>

      {isLoading && <LinearProgress />}

      {!isLoading && !isError && tickets.length === 0 && (
        <Alert severity="info">{t("noTicketsFound")}</Alert>
      )}

      {!isLoading && isError && (
        <Alert severity="error">
          {t("somethingWentWrong", { ns: "errors" })}
        </Alert>
      )}

      {!isLoading && !isError && tickets.length !== 0 && (
        <TicketsList
          tickets={tickets}
          onClick={(ticket) => navigate(`/ticket/${ticket.id}`)}
          listItemProps={{ sx: { pr: 12 }, disablePadding: true }}
          actions={(ticket) => (
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                title={t("edit")}
                onClick={() => navigate(`/ticket/${ticket.id}/edit`)}
              >
                <Edit fontSize="small" />
              </IconButton>
              {(user?.role === "admin" || user?.role === "manager") && (
                <IconButton
                  size="small"
                  title={t("members")}
                  onClick={() => {
                    navigate(`/ticket/${ticket.id}/assign-users`);
                  }}
                >
                  <Group fontSize="small" />
                </IconButton>
              )}
            </Stack>
          )}
        />
      )}

      <div ref={sentinelRef} style={{ height: 1 }} />
      {isFetchingNextPage && <LinearProgress />}
    </>
  );
}
