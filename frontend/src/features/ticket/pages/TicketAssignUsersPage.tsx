import { useState } from "react";
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import PageHeader from "../../../components/PageHeader";
import { ROLES, type Role } from "../../user/types/user";
import SearchIcon from "@mui/icons-material/Search";
import { useDebounce } from "use-debounce";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import useTicketAssignableUsersQuery from "../hooks/useTicketAssignableUsersQuery";
import useTicketDetailQuery from "../hooks/useTicketDetailQuery";
import TicketAssignUsers from "../components/TicketAssignUser";
import type { AssignableUser } from "../types/ticket";
import useTicketAssignUsersMutation from "../hooks/useTicketAssignUsersMutation";
import { Save } from "@mui/icons-material";

export default function TicketAssignUsersPage() {
  const { t } = useTranslation("ticket");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [fullName, setFullName] = useState("");
  const [debouncedFullName] = useDebounce(fullName, 400);
  const [role, setRole] = useState<Role | null>(null);

  const ticket = useTicketDetailQuery(id ?? "");

  const assignableUsers = useTicketAssignableUsersQuery(id ?? "", {
    role,
    fullName: debouncedFullName,
  });

  const [hasInitialized, setHasInitialized] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState<AssignableUser[]>([]);

  const ticketAssignUsersMutation = useTicketAssignUsersMutation(id ?? "", {
    onSuccess: (ticket) => {
      queryClient.setQueryData(["tickets", ticket.id], ticket);
      queryClient.invalidateQueries({
        queryKey: ["tickets", ticket.id, "assignable-users"],
      });
      navigate(`/ticket/${ticket.id}`, { replace: true });
    },
  });

  if (
    !hasInitialized &&
    assignableUsers.isFetched &&
    !assignableUsers.isError
  ) {
    setHasInitialized(true);
    setAssignedUsers(
      (assignableUsers.data ?? []).filter((user) => user.isMember),
    );
  }

  const handleToggle = (assignedUser: AssignableUser) => {
    const foundAssignedUser = assignedUsers.find(
      (user) => user.id === assignedUser.id,
    );
    if (!foundAssignedUser) setAssignedUsers([...assignedUsers, assignedUser]);
    else
      setAssignedUsers(
        assignedUsers.filter((user) => user.id !== assignedUser.id),
      );
  };

  return (
    <>
      <PageHeader
        title={t("ticket")}
        subtitle={t("assignUsers")}
        actions={
          <IconButton
            size="small"
            title={t("save")}
            onClick={() => {
              ticketAssignUsersMutation.mutate(
                assignedUsers.map((user) => user.id),
              );
            }}
            loading={
              ticketAssignUsersMutation.isPending || assignableUsers.isFetching
            }
            disabled={
              !hasInitialized ||
              assignableUsers.isFetching ||
              assignableUsers.isError ||
              ticketAssignUsersMutation.isPending
            }
          >
            <Save fontSize="small" />
          </IconButton>
        }
      />

      <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
        {ticket.data?.title}
      </Typography>

      <TextField
        fullWidth
        size="small"
        placeholder={t("searchByName")}
        label={t("name")}
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        disabled={!hasInitialized}
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
            {t("role")}
          </Typography>
          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={(_, v) => setRole(v === "ALL" ? null : v)}
            size="small"
            disabled={!hasInitialized}
            orientation={isSmallScreen ? "vertical" : "horizontal"}
          >
            <ToggleButton value="ALL">{t("all")}</ToggleButton>
            {ROLES.map((role) => (
              <ToggleButton
                key={role}
                value={role}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: `${role}.main`,
                    color: `${role}.contrastText`,
                    "&:hover": {
                      backgroundColor: `${role}.dark`,
                    },
                  },
                }}
              >
                {role}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Stack>

      {assignableUsers.isFetching && <LinearProgress />}

      {!assignableUsers.isFetching &&
        !assignableUsers.isError &&
        (assignableUsers.data ?? []).length === 0 && (
          <Alert severity="info">{t("noUsersFound")}</Alert>
        )}

      {!assignableUsers.isFetching && assignableUsers.isError && (
        <Alert severity="error">
          {t("somethingWentWrong", { ns: "errors" })}
        </Alert>
      )}

      {!assignableUsers.isLoading &&
        !assignableUsers.isError &&
        (assignableUsers.data ?? []).length !== 0 && (
          <TicketAssignUsers
            assignableUsers={(assignableUsers.data ?? []).map((user) => ({
              ...user,
              isMember: assignedUsers.map((u) => u.id).includes(user.id),
            }))}
            onClick={(user) => {
              handleToggle(user);
            }}
          />
        )}
    </>
  );
}
