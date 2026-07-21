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
import ActiveDot from "../../../components/ActiveDot";
import type { ReactNode } from "react";
import type { Project } from "../types/project";

type ProjectsListProps = {
  projects: Project[];
  actions?: (project: Project) => ReactNode;
  onClick?: (project: Project) => void;
  listItemProps?: ListItemProps;
};

export default function ProjectsList({
  projects,
  actions,
  onClick,
  listItemProps,
}: ProjectsListProps) {
  return (
    <List disablePadding dense>
      {projects.map((project) => (
        <ListItem key={project.id} {...listItemProps}>
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
              onClick?.(project);
            }}
          >
            <ListItemText
              primary={
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <ActiveDot active={project.isActive} />
                  <Typography>{project.name}</Typography>
                </Stack>
              }
            />
          </ListItemButton>
          {!!actions && (
            <ListItemSecondaryAction>
              {actions(project)}
            </ListItemSecondaryAction>
          )}
        </ListItem>
      ))}
    </List>
  );
}
