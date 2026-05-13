import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider } from "react-hook-form";
import * as z from "zod";
import { ControlledAutocomplete } from "./ControlledAutocomplete";
import { vi } from "vitest";
import useCustomForm from "../hooks/useCustomForm";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ROLES = ["admin", "manager", "dev"];

const ROLE_OBJECTS = [
  { label: "Admin", value: "admin" },
  { label: "Manager", value: "manager" },
  { label: "Dev", value: "dev" },
];

const SINGLE_SCHEMA = z.object({
  role: z.string({ error: "Field is required" }).min(1, "Field is required"),
});

const MULTI_SCHEMA = z.object({
  roles: z.array(z.string()).min(1, "Select at least one option"),
});

// ─── Wrappers ─────────────────────────────────────────────────────────────────

function SingleWrapper({
  onSubmit = vi.fn(),
  defaultValues = { role: "" },
  options = ROLES,
}: {
  onSubmit?: (values: unknown) => void;
  defaultValues?: Record<string, unknown>;
  options?: string[];
}) {
  const methods = useCustomForm({
    schema: SINGLE_SCHEMA,
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <ControlledAutocomplete name="role" label="Role" options={options} />
        <button type="submit">Submit</button>
        <button type="button" onClick={() => methods.reset()}>
          Reset
        </button>
      </form>
    </FormProvider>
  );
}

function MultiWrapper({
  onSubmit = vi.fn(),
  defaultValues = { roles: [] },
}: {
  onSubmit?: (values: unknown) => void;
  defaultValues?: Record<string, unknown>;
}) {
  const methods = useCustomForm({
    schema: MULTI_SCHEMA,
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <ControlledAutocomplete
          name="roles"
          label="Roles"
          options={ROLES}
          multiple
        />
        <button type="submit">Submit</button>
        <button type="button" onClick={() => methods.reset()}>
          Reset
        </button>
      </form>
    </FormProvider>
  );
}

function ObjectWrapper({
  onSubmit = vi.fn(),
}: {
  onSubmit?: (values: unknown) => void;
}) {
  const schema = z.object({
    role: z
      .object({ label: z.string(), value: z.string() })
      .nullable()
      .refine((v) => v !== null, "Field is required"),
  });

  const methods = useCustomForm({
    schema,
    defaultValues: { role: null },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <ControlledAutocomplete
          name="role"
          label="Role"
          options={ROLE_OBJECTS}
          getOptionLabel={(o) => (typeof o === "string" ? o : o.label)}
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function openAndSelect(
  user: ReturnType<typeof userEvent.setup>,
  optionLabel: string,
) {
  const combobox = screen.getByRole("combobox");
  await user.click(combobox);
  await user.keyboard("{ArrowDown}");
  await user.click(await screen.findByRole("option", { name: optionLabel }));
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("ControlledAutocomplete", () => {
  describe("Rendering", () => {
    it("renders with the correct label", () => {
      render(<SingleWrapper />);
      expect(screen.getByLabelText("Role")).toBeInTheDocument();
    });

    it("pre-fills with a default value", () => {
      render(<SingleWrapper defaultValues={{ role: "admin" }} />);
      expect(screen.getByRole("combobox")).toHaveValue("admin");
    });

    it("renders all options when the dropdown is opened", async () => {
      const user = userEvent.setup();
      render(<SingleWrapper />);
      await user.click(screen.getByRole("combobox"));
      for (const role of ROLES) {
        expect(
          await screen.findByRole("option", { name: role }),
        ).toBeInTheDocument();
      }
    });
  });

  describe("Single selection", () => {
    it("updates the input value after selecting an option", async () => {
      const user = userEvent.setup();
      render(<SingleWrapper />);
      await openAndSelect(user, "manager");
      expect(screen.getByRole("combobox")).toHaveValue("manager");
    });

    it("calls onSubmit with the selected value when the form is valid", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<SingleWrapper onSubmit={onSubmit} />);
      await openAndSelect(user, "dev");
      await user.click(screen.getByRole("button", { name: "Submit" }));
      expect(onSubmit).toHaveBeenCalledWith({ role: "dev" }, expect.anything());
    });
  });

  describe("Multiple selection", () => {
    it("allows selecting multiple options", async () => {
      const user = userEvent.setup();
      render(<MultiWrapper />);
      await openAndSelect(user, "admin");
      await openAndSelect(user, "manager");
      expect(screen.getByText("admin")).toBeInTheDocument();
      expect(screen.getByText("manager")).toBeInTheDocument();
    });

    it("calls onSubmit with an array of selected values", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<MultiWrapper onSubmit={onSubmit} />);
      await openAndSelect(user, "admin");
      await openAndSelect(user, "manager");
      await user.click(screen.getByRole("button", { name: "Submit" }));
      expect(onSubmit).toHaveBeenCalledWith(
        { roles: ["admin", "manager"] },
        expect.anything(),
      );
    });
  });

  describe("Object options", () => {
    it("submits the full option object when options are objects", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<ObjectWrapper onSubmit={onSubmit} />);
      await openAndSelect(user, "Manager");
      await user.click(screen.getByRole("button", { name: "Submit" }));
      expect(onSubmit).toHaveBeenCalledWith(
        { role: { label: "Manager", value: "manager" } },
        expect.anything(),
      );
    });
  });

  describe("Validation", () => {
    it("displays an error message after submitting without a selection", async () => {
      const user = userEvent.setup();
      render(<SingleWrapper />);
      await user.click(screen.getByRole("button", { name: "Submit" }));
      expect(await screen.findByText("Field is required")).toBeInTheDocument();
    });

    it("sets aria-invalid on the input when there is a validation error", async () => {
      const user = userEvent.setup();
      render(<SingleWrapper />);
      await user.click(screen.getByRole("button", { name: "Submit" }));
      await waitFor(() => {
        expect(screen.getByRole("combobox")).toHaveAttribute(
          "aria-invalid",
          "true",
        );
      });
    });

    it("shows a multi-select error when no option is chosen", async () => {
      const user = userEvent.setup();
      render(<MultiWrapper />);
      await user.click(screen.getByRole("button", { name: "Submit" }));
      expect(
        await screen.findByText("Select at least one option"),
      ).toBeInTheDocument();
    });

    it("does not call onSubmit when the form is invalid", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<SingleWrapper onSubmit={onSubmit} />);
      await user.click(screen.getByRole("button", { name: "Submit" }));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("clears the error after a valid selection is made", async () => {
      const user = userEvent.setup();
      render(<SingleWrapper />);
      await user.click(screen.getByRole("button", { name: "Submit" }));
      expect(await screen.findByText("Field is required")).toBeInTheDocument();

      await openAndSelect(user, "admin");
      await waitFor(() => {
        expect(screen.queryByText("Field is required")).not.toBeInTheDocument();
      });
    });
  });

  describe("Reset", () => {
    it("clears the selection and removes errors after a reset", async () => {
      const user = userEvent.setup();
      render(<SingleWrapper />);

      await user.click(screen.getByRole("button", { name: "Submit" }));
      expect(await screen.findByText("Field is required")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Reset" }));

      await waitFor(() => {
        expect(screen.getByRole("combobox")).toHaveValue("");
        expect(screen.queryByText("Field is required")).not.toBeInTheDocument();
      });
    });
  });
});
