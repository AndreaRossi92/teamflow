import { useEffect, useState } from "react";
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
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/PageHeader";
import { ROLES, type Role } from "../../types/user";
import SearchIcon from "@mui/icons-material/Search";
import { useDebounce } from "use-debounce";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import useProjectsAssignableUsersQuery from "../../hooks/projects/useProjectAssignableUsersQuery";
import useProjectDetailQuery from "../../hooks/projects/useProjectDetailQuery";
import ProjectAssignUsers from "../../components/projects/ProjectAssignUser";
import type { AssignableUser } from "../../types/project";
import useProjectAssignUsersMutation from "../../hooks/projects/useProjectAssignUsersMutation";
import { Save } from "@mui/icons-material";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

export default function ProjectAssignUsersPage() {
  const { t } = useTranslation("project");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const [fullName, setFullName] = useState("");
  const [debouncedFullName] = useDebounce(fullName, 400);
  const [role, setRole] = useState<Role | null>(null);

  const project = useProjectDetailQuery(id ?? "");

  const allAssignableUsers = useProjectsAssignableUsersQuery(id ?? "");

  const assignableUsers = useProjectsAssignableUsersQuery(id ?? "", {
    role,
    fullName: debouncedFullName,
  });

  const [assignedUsers, setAssignedUsers] = useState<AssignableUser[]>([]);

  const projectAssignUsersMutation = useProjectAssignUsersMutation(id ?? "", {
    onSuccess: (project) => {
      queryClient.setQueryData(["projects", project.id], project);
      navigate(`/project/${project.id}`, { replace: true });
    },
  });

  useEffect(() => {
    if (allAssignableUsers.isFetched && !allAssignableUsers.isError) {
      setAssignedUsers(
        (allAssignableUsers.data ?? []).filter((user) => user.isMember),
      );
    }
  }, [
    allAssignableUsers.data,
    allAssignableUsers.isError,
    allAssignableUsers.isFetched,
  ]);

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
        title={t("project")}
        subtitle={t("assignUsers")}
        actions={
          <IconButton
            size="small"
            title={t("save")}
            onClick={() => {
              projectAssignUsersMutation.mutate(
                assignedUsers.map((user) => user.id),
              );
            }}
            loading={
              projectAssignUsersMutation.isPending ||
              allAssignableUsers.isFetching
            }
            disabled={
              allAssignableUsers.isFetching ||
              allAssignableUsers.isError ||
              projectAssignUsersMutation.isPending
            }
          >
            <Save fontSize="small" />
          </IconButton>
        }
      />

      {isDemoMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("demoList")}
        </Alert>
      )}

      <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
        {project.data?.name}
      </Typography>

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
      </Stack>

      {(assignableUsers.isFetching || allAssignableUsers.isFetching) && (
        <LinearProgress />
      )}

      {!assignableUsers.isFetching &&
        !assignableUsers.isError &&
        (assignableUsers.data ?? []).length === 0 && (
          <Alert severity="info">{t("noUsersFound")}</Alert>
        )}

      {(!assignableUsers.isFetching && assignableUsers.isError) ||
        (!allAssignableUsers.isFetching && allAssignableUsers.isError && (
          <Alert severity="error">{t("somethingWentWrong")}</Alert>
        ))}

      {!allAssignableUsers.isLoading &&
        !allAssignableUsers.isError &&
        !assignableUsers.isLoading &&
        !assignableUsers.isError &&
        (assignableUsers.data ?? []).length !== 0 && (
          <ProjectAssignUsers
            assignableUsers={(assignableUsers.data ?? []).map((user) => ({
              ...user,
              isMember: assignedUsers.map((u) => u.id).includes(user.id),
            }))}
            onClick={(user) => {
              handleToggle(user);
            }}
            //   listItemProps={{
            //     sx: { pr: 12 },
            //     disablePadding: true,
            //   }}
            //   actions={(user) => (
            //     <Stack direction="row" spacing={1}>
            //       <IconButton
            //         size="small"
            //         title={t("edit")}
            //         onClick={() => {
            //           navigate(`/user/${user.id}/edit`);
            //         }}
            //       >
            //         <Edit fontSize="small" />
            //       </IconButton>
            //       {user.isActive && (
            //         <DeleteIconButton
            //           dialogTitle={user.fullName}
            //           dialogText={t("deactivateConfirm")}
            //           onDelete={() =>
            //             deactivateUserMutation
            //               .mutateAsync(user.id)
            //               .then(() =>
            //                 queryClient.invalidateQueries({ queryKey: ["users"] }),
            //               )
            //           }
            //         />
            //       )}
            //       {!user.isActive && (
            //         <IconButton
            //           size="small"
            //           title={t("restore")}
            //           onClick={() => {
            //             reactivateUserMutation
            //               .mutateAsync(user.id)
            //               .then(() =>
            //                 queryClient.invalidateQueries({ queryKey: ["users"] }),
            //               );
            //           }}
            //         >
            //           <SettingsBackupRestore fontSize="small" />
            //         </IconButton>
            //       )}
            //     </Stack>
            //   )}
          />
        )}
    </>
  );
}
