import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Divider,
  Icon,
  IconButton,
  InputAdornment,
  LinearProgress,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Add, Edit, SettingsBackupRestore } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import UsersList from "../../components/users/UsersList";
import useUsersListQuery from "../../hooks/users/useUsersListQuery";
import PageHeader from "../../components/PageHeader";
import { ROLES, type Role } from "../../types/user";
import SearchIcon from "@mui/icons-material/Search";
import { useDebounce } from "use-debounce";
import DeleteIconButton from "../../components/DeleteIconButton";
import useDeactivateUserMutation from "../../hooks/users/useDeactivateUserMutation";
import { useNavigate } from "react-router-dom";
import useReactivateUserMutation from "../../hooks/users/useReactivateUserMutation";
import { useQueryClient } from "@tanstack/react-query";

export default function UserListPage() {
  const { t } = useTranslation("user");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [debouncedFullName] = useDebounce(fullName, 400);
  const [role, setRole] = useState<Role | null>(null);
  const [isActive, setIsActive] = useState<"active" | "inactive" | null>(
    "active",
  );
  const [openDeactivatedUserSnackbar, setOpenDeactivatedUserSnackbar] =
    useState(false);
  const [openReactivatedUserSnackbar, setOpenReactivatedUserSnackbar] =
    useState(false);

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useUsersListQuery({
      role,
      fullName: debouncedFullName,
      isActive:
        isActive === "active" ? true : isActive === "inactive" ? false : null,
    });
  const deactivateUserMutation = useDeactivateUserMutation();
  const reactivateUserMutation = useReactivateUserMutation();

  const users = data?.pages.flat() ?? [];

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
        title={t("users")}
        subtitle={t("list")}
        actions={
          <IconButton
            onClick={() => {
              navigate("/user/create");
            }}
          >
            <Add />
          </IconButton>
        }
      />

      <TextField
        fullWidth
        size="small"
        placeholder={t("searchByName")}
        label={t("name")}
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
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
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 0.5, display: "block" }}
          >
            {t("status")}
          </Typography>
          <ToggleButtonGroup
            value={isActive}
            exclusive
            onChange={(_, v) => setIsActive(v === "ALL" ? null : v)}
            size="small"
          >
            <ToggleButton value="ALL">{t("all")}</ToggleButton>
            <ToggleButton
              value="active"
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "success.main",
                  color: "success.contrastText",
                  "&:hover": {
                    backgroundColor: "success.dark",
                  },
                },
              }}
            >
              {t("active")}
            </ToggleButton>
            <ToggleButton
              value="inactive"
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "error.main",
                  color: "error.contrastText",
                  "&:hover": {
                    backgroundColor: "error.dark",
                  },
                },
              }}
            >
              {t("inactive")}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Stack>

      {isFetching && !isFetchingNextPage && <LinearProgress />}

      <UsersList
        users={users}
        actions={(user) => (
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              title={t("edit")}
              onClick={() => {
                navigate(`/user/${user.id}/edit`);
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
            {user.isActive && (
              <DeleteIconButton
                dialogTitle={user.fullName}
                dialogText={t("deactivateConfirm")}
                onDelete={() =>
                  deactivateUserMutation
                    .mutateAsync(user.id)
                    .then(() =>
                      queryClient.invalidateQueries({ queryKey: ["users"] }),
                    )
                    .then(() => setOpenDeactivatedUserSnackbar(true))
                }
              />
            )}
            {!user.isActive && (
              <IconButton
                size="small"
                title={t("restore")}
                onClick={() => {
                  reactivateUserMutation
                    .mutateAsync(user.id)
                    .then(() =>
                      queryClient.invalidateQueries({ queryKey: ["users"] }),
                    )
                    .then(() => setOpenReactivatedUserSnackbar(true));
                }}
              >
                <SettingsBackupRestore fontSize="small" />
              </IconButton>
            )}
          </Stack>
        )}
      />

      <div ref={sentinelRef} style={{ height: 1 }} />

      {isFetchingNextPage && <LinearProgress />}

      <Snackbar
        open={openDeactivatedUserSnackbar}
        autoHideDuration={5000}
        onClose={() => {
          setOpenDeactivatedUserSnackbar(false);
        }}
      >
        <Alert
          onClose={() => {
            setOpenDeactivatedUserSnackbar(false);
          }}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {t("deactivated")}
        </Alert>
      </Snackbar>
      <Snackbar
        open={openReactivatedUserSnackbar}
        autoHideDuration={5000}
        onClose={() => {
          setOpenReactivatedUserSnackbar(false);
        }}
      >
        <Alert
          onClose={() => {
            setOpenReactivatedUserSnackbar(false);
          }}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {t("reactivated")}
        </Alert>
      </Snackbar>
    </>
  );
}
