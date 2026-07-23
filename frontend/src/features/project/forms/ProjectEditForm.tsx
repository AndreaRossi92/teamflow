import { ProjectCreateForm } from "./ProjectCreateForm";

type ProjectEditFormProps = { onEnter?: () => void; disabled?: boolean };

export function ProjectEditForm({ onEnter, disabled }: ProjectEditFormProps) {
  return <ProjectCreateForm onEnter={onEnter} disabled={disabled} />;
}
