import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ControlledTextField } from "../../../components/ControlledTextField";
import { TICKET_PRIORITIES } from "../types/ticket";
import { ControlledAutocomplete } from "../../../components/ControlledAutocomplete";
import type { Project } from "../../project/types/project";
import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { PaginatedResponse } from "../../../types/paginatedResponse";
import ControlledInfiniteQueryAutocomplete from "../../../components/ControlledInfiniteQueryAutocomplete";
import type { AxiosError } from "axios";

type TicketCreateFormProps = {
  onEnter?: () => void;
  projectListQuery: UseInfiniteQueryResult<
    InfiniteData<PaginatedResponse<Project>, number>,
    AxiosError
  >;
  disabled?: boolean;
};

export function TicketCreateForm({
  onEnter,
  projectListQuery,
  disabled,
}: TicketCreateFormProps) {
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
        disabled={disabled}
      />

      <ControlledTextField
        name="description"
        label={t("description")}
        multiline
        rows={4}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />

      <ControlledAutocomplete
        name="priority"
        label={t("priority")}
        options={TICKET_PRIORITIES}
        getOptionLabel={(option) => t(option)}
        disabled={disabled}
      />

      <ControlledInfiniteQueryAutocomplete<Project>
        name="project"
        label={t("project")}
        infiniteQuery={projectListQuery}
        getOptionKey={(option) => option.id}
        getOptionLabel={(option) => option.name ?? ""}
        disabled={disabled}
      />
    </Stack>
  );
}
