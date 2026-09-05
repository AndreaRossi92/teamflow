import {
  Checkbox,
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
import type { AssignableUser } from "../types/ticket";
import { UserRoleBadge } from "../../user/components/UserRoleBadge";

type TicketAssignUsersProps = {
  assignableUsers: AssignableUser[];
  actions?: (user: AssignableUser) => ReactNode;
  onClick?: (user: AssignableUser) => void;
  listItemProps?: ListItemProps;
};

export default function TicketAssignUsers({
  assignableUsers,
  actions,
  onClick,
  listItemProps,
}: TicketAssignUsersProps) {
  return (
    <List disablePadding dense>
      {assignableUsers.map((user) => (
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
