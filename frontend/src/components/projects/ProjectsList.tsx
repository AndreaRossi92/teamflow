import {
  List,
  ListItem,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import ActiveDot from "../ActiveDot";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import type { Project } from "../../types/project";

type ProjectsListProps = {
  projects: Project[];
  actions?: (project: Project) => ReactNode;
};

export default function ProjectsList({ projects, actions }: ProjectsListProps) {
  const navigate = useNavigate();

  return (
    <List disablePadding dense>
      {projects.map((project) => (
        <ListItem key={project.id} sx={{ pr: 12 }} disablePadding>
          <ListItemButton
            sx={{
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
            }}
            onClick={() => {
              navigate(`/project/${project.id}`);
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
