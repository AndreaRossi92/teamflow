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
import { Add, Edit, Group, SettingsBackupRestore } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/PageHeader";
import SearchIcon from "@mui/icons-material/Search";
import { useDebounce } from "use-debounce";
import DeleteIconButton from "../../components/DeleteIconButton";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../providers/useSnackbar";
import useProjectsListQuery from "../../hooks/projects/useProjectsListQuery";
import useDeactivateProjectMutation from "../../hooks/projects/useDeactivateProjectMutation";
import useReactivateProjectMutation from "../../hooks/projects/useReactivateProjectMutation";
import ProjectsList from "../../components/projects/ProjectsList";
import type { Project } from "../../types/project";
import { useAuth } from "../../providers/useAuth";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

export default function ProjectsListPage() {
  const { t } = useTranslation("project");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showMessage } = useSnackbar();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [debouncedName] = useDebounce(name, 400);
  const [isActive, setIsActive] = useState<"active" | "inactive" | null>(
    "active",
  );

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
  } = useProjectsListQuery({
    name: debouncedName,
    isActive:
      isActive === "active" ? true : isActive === "inactive" ? false : null,
  });
  const deactivateProjectMutation = useDeactivateProjectMutation({
    onSuccess: () => {
      showMessage(t("deactivated"), "success");
    },
    onError: () => {
      showMessage(t("somethingWentWrong", { ns: "errors" }), "error");
    },
  });
  const reactivateProjectMutation = useReactivateProjectMutation({
    onSuccess: () => {
      showMessage(t("reactivated"), "success");
    },
    onError: () => {
      showMessage(t("somethingWentWrong", { ns: "errors" }), "error");
    },
  });

  const projects =
    data?.pages.reduce(
      (acc, page) => [...acc, ...page.data],
      [] as Project[],
    ) ?? [];

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
        title={t("projects")}
        subtitle={t("list")}
        actions={
          user?.role === "admin" || user?.role === "manager" ? (
            <IconButton
              onClick={() => {
                navigate("/project/create");
              }}
              title={t("add", { ns: "common" })}
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
        placeholder={t("searchByName")}
        label={t("name")}
        value={name}
        onChange={(e) => setName(e.target.value)}
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

      {isLoading && <LinearProgress />}

      {!isLoading && !isError && projects.length === 0 && (
        <Alert severity="info">{t("noProjectFound")}</Alert>
      )}

      {!isLoading && isError && (
        <Alert severity="error">
          {t("somethingWentWrong", { ns: "errors" })}
        </Alert>
      )}

      {!isLoading && !isError && projects.length !== 0 && (
        <ProjectsList
          projects={projects}
          onClick={(project) => {
            navigate(`/project/${project.id}`);
          }}
          listItemProps={{
            sx: { pr: 18 },
            disablePadding: true,
          }}
          actions={(project) =>
            user?.role === "admin" || user?.role === "manager" ? (
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  title={t("edit")}
                  onClick={() => {
                    navigate(`/project/${project.id}/edit`);
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  title={t("members")}
                  onClick={() => {
                    navigate(`/project/${project.id}/assign-users`);
                  }}
                >
                  <Group fontSize="small" />
                </IconButton>
                {project.isActive && (
                  <DeleteIconButton
                    dialogTitle={project.name}
                    dialogText={t("deactivateConfirm")}
                    onDelete={() =>
                      deactivateProjectMutation
                        .mutateAsync(project.id)
                        .then(() =>
                          queryClient.invalidateQueries({
                            queryKey: ["projects"],
                          }),
                        )
                    }
                  />
                )}
                {!project.isActive && (
                  <IconButton
                    size="small"
                    title={t("restore")}
                    onClick={() => {
                      reactivateProjectMutation
                        .mutateAsync(project.id)
                        .then(() =>
                          queryClient.invalidateQueries({
                            queryKey: ["projects"],
                          }),
                        );
                    }}
                  >
                    <SettingsBackupRestore fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            ) : undefined
          }
        />
      )}

      <div ref={sentinelRef} style={{ height: 1 }} />

      {isFetchingNextPage && <LinearProgress />}
    </>
  );
}
