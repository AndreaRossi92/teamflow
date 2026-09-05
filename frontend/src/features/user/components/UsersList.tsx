import {
  List,
  ListItem,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
  type ListItemProps,
} from "@mui/material";
import type { User } from "../types/user";
import ActiveDot from "../../../components/ActiveDot";
import type { ReactNode } from "react";
import { UserRoleBadge } from "./UserRoleBadge";

type UsersListProps = {
  users: User[];
  actions?: (user: User) => ReactNode;
  onClick?: (user: User) => void;
  listItemProps?: ListItemProps;
};

export default function UsersList({
  users,
  actions,
  onClick,
  listItemProps,
}: UsersListProps) {
  return (
    <List disablePadding dense>
      {users.map((user) => (
        <ListItem key={user.id} divider {...listItemProps}>
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
            <ListItemText
              primary={
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <ActiveDot active={user.isActive} />
                  <Typography>{user.fullName}</Typography>
                </Stack>
              }
              secondary={
                <Typography variant="body2" color="textSecondary">
                  {user.email}
                </Typography>
              }
            />
            <UserRoleBadge role={user.role} />
          </ListItemButton>
          {!!actions && (
            <ListItemSecondaryAction>{actions(user)}</ListItemSecondaryAction>
          )}
        </ListItem>
      ))}
    </List>
  );
}
