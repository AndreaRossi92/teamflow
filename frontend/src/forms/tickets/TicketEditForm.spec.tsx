import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { TicketEditForm } from "./TicketEditForm";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "../../types/ticket";
import type { TicketEditFormValues } from "../../types/ticketForm";
import { useAuth } from "../../providers/useAuth";
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

vi.mock("../../providers/useAuth", () => ({
  useAuth: vi.fn(),
}));

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

function mockAuthAs(role: "admin" | "manager" | "dev") {
  vi.mocked(useAuth).mockReturnValue({
    user: { id: "user-1", fullName: "Test User", email: "t@t.com", role },
  } as unknown as ReturnType<typeof useAuth>);
}

// ── Render helper ──────────────────────────────────────────────────────────────
function renderTicketEditForm(
  onEnter?: () => void,
  defaultValues: Partial<TicketEditFormValues> = {},
  projectListQuery = buildProjectListQuery(),
) {
  function Wrapper() {
    const methods = useForm<TicketEditFormValues>({
      defaultValues: {
        title: "",
        description: "",
        priority: "",
        project: null,
        status: "",
        ...defaultValues,
      },
    });

    return (
      <FormProvider {...methods}>
        <TicketEditForm onEnter={onEnter} projectListQuery={projectListQuery} />
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
const getStatusSelect = () => screen.getByRole("combobox", { name: /status/i });

// ── Tests ──────────────────────────────────────────────────────────────────────
describe("TicketEditForm", () => {
  beforeEach(() => {
    mockAuthAs("admin");
  });

  describe("rendering", () => {
    it("shows all form fields including status", () => {
      renderTicketEditForm();

      expect(getTitleInput()).toBeInTheDocument();
      expect(getDescriptionInput()).toBeInTheDocument();
      expect(getPrioritySelect()).toBeInTheDocument();
      expect(getProjectSelect()).toBeInTheDocument();
      expect(getStatusSelect()).toBeInTheDocument();
    });

    it("fields are empty when no defaultValues are provided", () => {
      renderTicketEditForm();

      expect(getTitleInput()).toHaveValue("");
      expect(getDescriptionInput()).toHaveValue("");
    });

    it("pre-fills fields when defaultValues are provided", () => {
      renderTicketEditForm(undefined, {
        title: "Existing ticket",
        description: "Existing description",
      });

      expect(getTitleInput()).toHaveValue("Existing ticket");
      expect(getDescriptionInput()).toHaveValue("Existing description");
    });

    it("renders description as a multiline textarea", () => {
      renderTicketEditForm();

      expect(getDescriptionInput().tagName.toLowerCase()).toBe("textarea");
    });

    it("lists every ticket status as an option", () => {
      renderTicketEditForm();

      for (const status of TICKET_STATUSES) {
        expect(
          screen.getByRole("option", { name: status }),
        ).toBeInTheDocument();
      }
    });

    it("lists every ticket priority as an option", () => {
      renderTicketEditForm();

      for (const priority of TICKET_PRIORITIES) {
        expect(
          screen.getByRole("option", { name: priority }),
        ).toBeInTheDocument();
      }
    });
  });

  describe("role-based access", () => {
    it("enables title, description, priority and project for admins", () => {
      mockAuthAs("admin");
      renderTicketEditForm();

      expect(getTitleInput()).not.toBeDisabled();
      expect(getDescriptionInput()).not.toBeDisabled();
      expect(getPrioritySelect()).not.toBeDisabled();
      expect(getProjectSelect()).not.toBeDisabled();
    });

    it("enables title, description, priority and project for managers", () => {
      mockAuthAs("manager");
      renderTicketEditForm();

      expect(getTitleInput()).not.toBeDisabled();
      expect(getDescriptionInput()).not.toBeDisabled();
      expect(getPrioritySelect()).not.toBeDisabled();
      expect(getProjectSelect()).not.toBeDisabled();
    });

    it("disables title, description, priority and project for devs", () => {
      mockAuthAs("dev");
      renderTicketEditForm();

      expect(getTitleInput()).toBeDisabled();
      expect(getDescriptionInput()).toBeDisabled();
      expect(getPrioritySelect()).toBeDisabled();
      expect(getProjectSelect()).toBeDisabled();
    });

    it("never disables the status field, even for devs", () => {
      mockAuthAs("dev");
      renderTicketEditForm();

      expect(getStatusSelect()).not.toBeDisabled();
    });
  });

  describe("typing", () => {
    it("accepts input in the title field", async () => {
      renderTicketEditForm();
      const user = userEvent.setup();

      await user.type(getTitleInput(), "Updated title");
      expect(getTitleInput()).toHaveValue("Updated title");
    });

    it("accepts input in the description field", async () => {
      renderTicketEditForm();
      const user = userEvent.setup();

      await user.type(getDescriptionInput(), "Updated description");
      expect(getDescriptionInput()).toHaveValue("Updated description");
    });

    it("allows changing the status", async () => {
      renderTicketEditForm();
      const user = userEvent.setup();

      await user.selectOptions(getStatusSelect(), TICKET_STATUSES[0]);
      expect(getStatusSelect()).toHaveValue(TICKET_STATUSES[0]);
    });
  });

  describe("Enter key", () => {
    it("calls onEnter when Enter is pressed on the title field", async () => {
      const onEnter = vi.fn();
      renderTicketEditForm(onEnter);
      const user = userEvent.setup();

      await user.click(getTitleInput());
      await user.keyboard("{Enter}");

      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it("calls onEnter when Enter is pressed on the description field", async () => {
      const onEnter = vi.fn();
      renderTicketEditForm(onEnter);
      const user = userEvent.setup();

      await user.click(getDescriptionInput());
      await user.keyboard("{Enter}");

      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it("does not throw if onEnter is not provided", async () => {
      renderTicketEditForm();
      const user = userEvent.setup();

      await user.click(getTitleInput());
      await expect(user.keyboard("{Enter}")).resolves.not.toThrow();
    });
  });
});
