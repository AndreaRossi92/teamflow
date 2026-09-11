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
import type { Ticket } from "../types/ticket";
import { TicketStatusBadge } from "./TicketStatusBadge";
import { TicketPriorityBadge } from "./TicketPriorityBadge";
import ActiveDot from "../../../components/ActiveDot";

type TicketsListProps = {
  tickets: Ticket[];
  onClick?: (ticket: Ticket) => void;
  listItemProps?: ListItemProps;
  actions?: (ticket: Ticket) => React.ReactNode;
};

export default function TicketsList({
  tickets,
  onClick,
  listItemProps,
  actions,
}: TicketsListProps) {
  return (
    <List disablePadding dense>
      {tickets.map((ticket) => (
        <ListItem key={ticket.id} divider {...listItemProps}>
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
              onClick?.(ticket);
            }}
          >
            <ListItemText
              primary={
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <ActiveDot active={ticket.project.isActive} />
                  <TicketStatusBadge status={ticket.status} />
                  <Typography>{ticket.title}</Typography>
                </Stack>
              }
              secondary={ticket.project.name}
              slotProps={{ secondary: { sx: { mt: 1 } } }}
            />
            <TicketPriorityBadge priority={ticket.priority} />
          </ListItemButton>
          {!!actions && (
            <ListItemSecondaryAction>{actions(ticket)}</ListItemSecondaryAction>
          )}
        </ListItem>
      ))}
    </List>
  );
}
