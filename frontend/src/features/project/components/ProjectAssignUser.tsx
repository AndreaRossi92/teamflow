import {
  Checkbox,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
  type ListItemProps,
} from "@mui/material";
import ActiveDot from "../../../components/ActiveDot";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { AssignableUser } from "../types/project";

type ProjectAssignUsersProps = {
  assignableUsers: AssignableUser[];
  actions?: (user: AssignableUser) => ReactNode;
  onClick?: (user: AssignableUser) => void;
  listItemProps?: ListItemProps;
};

export default function ProjectAssignUsers({
  assignableUsers,
  actions,
  onClick,
  listItemProps,
}: ProjectAssignUsersProps) {
  const { t } = useTranslation("user");

  return (
    <List disablePadding dense>
      {assignableUsers.map((user) => (
        <ListItem key={user.id} {...listItemProps}>
          <ListItemButton
            sx={{
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              cursor: onClick ? "pointer" : "default",
              "&:hover": {
                backgroundColor: onClick ? "action.hover" : "transparent",
              },
            }}
            disableRipple={!onClick}
            onClick={() => {
              onClick?.(user);
            }}
          >
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={user.isMember}
                tabIndex={-1}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <ActiveDot active />
                  <Typography>{user.fullName}</Typography>
                </Stack>
              }
              secondary={user.email}
            />
            <Chip label={t(user.role)} color={user.role} size="small" />
          </ListItemButton>
          {!!actions && (
            <ListItemSecondaryAction>{actions(user)}</ListItemSecondaryAction>
          )}
        </ListItem>
      ))}
    </List>
  );
}
