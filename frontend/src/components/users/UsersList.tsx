import {
  Chip,
  IconButton,
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
import { Delete, Edit } from "@mui/icons-material";
import ActiveDot from "../ActiveDot";
import { useNavigate } from "react-router-dom";

type UsersListProps = { users: User[] };

export default function UsersList({ users }: UsersListProps) {
  const { t } = useTranslation("users");
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
              navigate(`/users/${user.id}`);
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
          <ListItemSecondaryAction>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" title={t("edit")}>
                <Edit fontSize="small" />
              </IconButton>
              <IconButton size="small" title={t("delete")}>
                <Delete fontSize="small" />
              </IconButton>
            </Stack>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
}
