import {
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import type { User } from "../../types/user";
import { useTranslation } from "react-i18next";
import ActiveDot from "../ActiveDot";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

type UsersListProps = { users: User[]; actions?: (user: User) => ReactNode };

export default function UsersList({ users, actions }: UsersListProps) {
  const { t } = useTranslation("user");
  const navigate = useNavigate();

  if (users.length === 0)
    return <Typography variant="body2">{t("noUsersFound")}</Typography>;

  return (
    <List disablePadding dense>
      {users.map((user) => (
        <ListItem key={user.id} sx={{ pr: 12 }} disablePadding>
          <ListItemButton
            sx={{
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
            }}
            onClick={() => {
              navigate(`/user/${user.id}`);
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
              secondary={user.email}
            />
            <Chip label={user.role} color={user.role} size="small" />
          </ListItemButton>
          {!!actions && (
            <ListItemSecondaryAction>{actions(user)}</ListItemSecondaryAction>
          )}
        </ListItem>
      ))}
    </List>
  );
}
