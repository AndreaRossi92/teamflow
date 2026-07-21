import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ControlledTextField } from "../../components/ControlledTextField";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "../../types/ticket";
import { ControlledAutocomplete } from "../../components/ControlledAutocomplete";
import type { Project } from "../../types/project";
import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { PaginatedResponse } from "../../types/paginatedResponse";
import ControlledInfiniteQueryAutocomplete from "../../components/ControlledInfiniteQueryAutocomplete";
import type { AxiosError } from "axios";
import { useAuth } from "../../providers/useAuth";

type TicketEditFormProps = {
  onEnter?: () => void;
  projectListQuery: UseInfiniteQueryResult<
    InfiniteData<PaginatedResponse<Project>, number>,
    AxiosError
  >;
};

export function TicketEditForm({
  onEnter,
  projectListQuery,
}: TicketEditFormProps) {
  const { user } = useAuth();
  const { t } = useTranslation("ticket");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onEnter?.();
  };

  return (
    <Stack spacing={2}>
      <ControlledTextField
        name="title"
        label={t("title")}
        onKeyDown={handleKeyDown}
        disabled={user?.role === "dev"}
      />

      <ControlledTextField
        name="description"
        label={t("description")}
        multiline
        rows={4}
        onKeyDown={handleKeyDown}
        disabled={user?.role === "dev"}
      />

      <ControlledAutocomplete
        name="priority"
        label={t("priority")}
        options={TICKET_PRIORITIES}
        getOptionLabel={(option) => t(option)}
        disabled={user?.role === "dev"}
      />

      <ControlledInfiniteQueryAutocomplete<Project>
        name="project"
        label={t("project")}
        infiniteQuery={projectListQuery}
        getOptionKey={(option) => option.id}
        getOptionLabel={(option) => option.name ?? ""}
        disabled={user?.role === "dev"}
      />

      <ControlledAutocomplete
        name="status"
        label={t("status")}
        options={TICKET_STATUSES}
        getOptionLabel={(option) => t(option)}
      />
    </Stack>
  );
}
