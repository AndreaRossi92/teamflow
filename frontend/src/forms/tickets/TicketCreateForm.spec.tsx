import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { TicketCreateForm } from "./TicketCreateForm";
import { TICKET_PRIORITIES } from "../../types/ticket";
import type { TicketCreateFormValues } from "../../types/ticketForm";
import type { Project } from "../../types/project";
import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { PaginatedResponse } from "../../types/paginatedResponse";
import type { AxiosError } from "axios";

// ── Child mocks ─────────────────────────────────────────────────────────────
vi.mock("../../components/ControlledAutocomplete", () => {
  function MockControlledAutocomplete({
    name,
    label,
    options,
    disabled,
  }: {
    name: string;
    label: string;
    options: string[];
    disabled?: boolean;
  }) {
    const { setValue } = useFormContext();

    return (
      <label>
        {label}
        <select
          aria-label={label}
          disabled={disabled}
          onChange={(e) => setValue(name, e.target.value)}
        >
          <option value="">--</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return {
    ControlledAutocomplete: MockControlledAutocomplete,
  };
});

vi.mock("../../components/ControlledInfiniteQueryAutocomplete", () => {
  function MockControlledInfiniteQueryAutocomplete({
    name,
    label,
    infiniteQuery,
    getOptionLabel,
    disabled,
  }: {
    name: string;
    label: string;
    infiniteQuery: UseInfiniteQueryResult<
      InfiniteData<PaginatedResponse<Project>, number>,
      AxiosError
    >;
    getOptionLabel: (option: Project) => string;
    disabled?: boolean;
  }) {
    const { setValue } = useFormContext();
    const projects: Project[] =
      infiniteQuery.data?.pages.flatMap((page) => page.data) ?? [];
    return (
      <label>
        {label}
        <select
          aria-label={label}
          disabled={disabled}
          onChange={(e) => {
            const selected = projects.find((p) => p.id === e.target.value);
            setValue(name, selected);
          }}
        >
          <option value="">--</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {getOptionLabel(p)}
            </option>
          ))}
        </select>
      </label>
    );
  }
  return {
    default: MockControlledInfiniteQueryAutocomplete,
  };
});

// ── Fixtures ────────────────────────────────────────────────────────────────
const mockProject: Project = {
  id: "project-1",
  name: "TeamFlow v2",
} as Project;

function buildProjectListQuery(
  projects: Project[] = [mockProject],
): UseInfiniteQueryResult<
  InfiniteData<PaginatedResponse<Project>, number>,
  AxiosError
> {
  return {
    data: {
      pages: [
        {
          data: projects,
          total: projects.length,
          page: 1,
          limit: 20,
          hasNextPage: false,
        },
      ],
      pageParams: [1],
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
  } as unknown as UseInfiniteQueryResult<
    InfiniteData<PaginatedResponse<Project>, number>,
    AxiosError
  >;
}

// ── Render helper ──────────────────────────────────────────────────────────────
function renderTicketCreateForm(
  onEnter?: () => void,
  projectListQuery = buildProjectListQuery(),
) {
  function Wrapper() {
    const methods = useForm<TicketCreateFormValues>({
      defaultValues: {
        title: "",
        description: "",
        priority: "",
        project: null,
      },
    });

    return (
      <FormProvider {...methods}>
        <TicketCreateForm
          onEnter={onEnter}
          projectListQuery={projectListQuery}
        />
      </FormProvider>
    );
  }

  return render(<Wrapper />);
}

// ── Field helpers ──────────────────────────────────────────────────────────────
const getTitleInput = () => screen.getByRole("textbox", { name: /title/i });
const getDescriptionInput = () =>
  screen.getByRole("textbox", { name: /description/i });
const getPrioritySelect = () =>
  screen.getByRole("combobox", { name: /priority/i });
const getProjectSelect = () =>
  screen.getByRole("combobox", { name: /project/i });

// ── Tests ──────────────────────────────────────────────────────────────────────
describe("TicketCreateForm", () => {
  describe("rendering", () => {
    it("shows all form fields", () => {
      renderTicketCreateForm();

      expect(getTitleInput()).toBeInTheDocument();
      expect(getDescriptionInput()).toBeInTheDocument();
      expect(getPrioritySelect()).toBeInTheDocument();
      expect(getProjectSelect()).toBeInTheDocument();
    });

    it("title and description are empty by default", () => {
      renderTicketCreateForm();

      expect(getTitleInput()).toHaveValue("");
      expect(getDescriptionInput()).toHaveValue("");
    });

    it("renders description as a multiline textarea", () => {
      renderTicketCreateForm();

      expect(getDescriptionInput().tagName.toLowerCase()).toBe("textarea");
    });

    it("lists every ticket priority as an option", () => {
      renderTicketCreateForm();

      for (const priority of TICKET_PRIORITIES) {
        expect(
          screen.getByRole("option", { name: priority }),
        ).toBeInTheDocument();
      }
    });

    it("lists the projects returned by the infinite query", () => {
      renderTicketCreateForm(
        undefined,
        buildProjectListQuery([
          mockProject,
          { id: "project-2", name: "Design System" } as Project,
        ]),
      );

      expect(
        screen.getByRole("option", { name: "TeamFlow v2" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Design System" }),
      ).toBeInTheDocument();
    });
  });

  describe("typing", () => {
    it("accepts input in the title field", async () => {
      renderTicketCreateForm();
      const user = userEvent.setup();

      await user.type(getTitleInput(), "Fix login bug");
      expect(getTitleInput()).toHaveValue("Fix login bug");
    });

    it("accepts input in the description field", async () => {
      renderTicketCreateForm();
      const user = userEvent.setup();

      await user.type(getDescriptionInput(), "Login fails on Safari");
      expect(getDescriptionInput()).toHaveValue("Login fails on Safari");
    });

    it("allows selecting a priority", async () => {
      renderTicketCreateForm();
      const user = userEvent.setup();

      await user.selectOptions(getPrioritySelect(), TICKET_PRIORITIES[0]);
      expect(getPrioritySelect()).toHaveValue(TICKET_PRIORITIES[0]);
    });

    it("allows selecting a project", async () => {
      renderTicketCreateForm();
      const user = userEvent.setup();

      await user.selectOptions(getProjectSelect(), "project-1");
      expect(getProjectSelect()).toHaveValue("project-1");
    });
  });

  describe("Enter key", () => {
    it("calls onEnter when Enter is pressed on the title field", async () => {
      const onEnter = vi.fn();
      renderTicketCreateForm(onEnter);
      const user = userEvent.setup();

      await user.click(getTitleInput());
      await user.keyboard("{Enter}");

      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it("calls onEnter when Enter is pressed on the description field", async () => {
      const onEnter = vi.fn();
      renderTicketCreateForm(onEnter);
      const user = userEvent.setup();

      await user.click(getDescriptionInput());
      await user.keyboard("{Enter}");

      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it("does not throw if onEnter is not provided", async () => {
      renderTicketCreateForm();
      const user = userEvent.setup();

      await user.click(getTitleInput());
      await expect(user.keyboard("{Enter}")).resolves.not.toThrow();
    });
  });
});
