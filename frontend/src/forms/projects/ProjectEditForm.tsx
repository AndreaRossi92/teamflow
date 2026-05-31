import { ProjectCreateForm } from "./ProjectCreateForm";

type ProjectEditFormProps = { onEnter?: () => void };

export function ProjectEditForm({ onEnter }: ProjectEditFormProps) {
  return <ProjectCreateForm onEnter={onEnter} />;
}
