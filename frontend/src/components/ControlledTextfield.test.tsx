import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm, FormProvider, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ControlledTextField } from "./ControlledTextField";
import { vi } from "vitest";

const DEFAULT_SCHEMA = z.object({
  field: z.string().min(3, "At least 3 characters required"),
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

function Wrapper({
  schema = DEFAULT_SCHEMA,
  defaultValues = { field: "" },
  onSubmit = vi.fn(),
  textFieldProps = {},
}: {
  schema?: z.ZodType<unknown, FieldValues>;
  defaultValues?: Record<string, string>;
  onSubmit?: (values: unknown) => void;
  textFieldProps?: Record<string, unknown>;
}) {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <ControlledTextField
          name="field"
          label="Test field"
          {...textFieldProps}
        />
        <button type="submit">Submit</button>
        <button type="button" onClick={() => methods.reset()}>
          Reset
        </button>
      </form>
    </FormProvider>
  );
}

async function renderAndSubmit(value?: string, onSubmit = vi.fn()) {
  const user = userEvent.setup();
  render(<Wrapper onSubmit={onSubmit} />);
  const input = screen.getByLabelText("Test field");
  if (value) await user.type(input, value);
  await user.click(screen.getByRole("button", { name: "Submit" }));
  return { user, input, onSubmit };
}

describe("ControlledTextField", () => {
  describe("Rendering", () => {
    it("renders the field with the correct label", () => {
      render(<Wrapper />);
      expect(screen.getByLabelText("Test field")).toBeInTheDocument();
    });

    it("pre-fills the field with the default value", () => {
      render(<Wrapper defaultValues={{ field: "initial value" }} />);
      expect(screen.getByLabelText("Test field")).toHaveValue("initial value");
    });

    it("correctly forwards the 'type' prop to the underlying input", () => {
      render(<Wrapper textFieldProps={{ type: "email" }} />);
      expect(screen.getByLabelText("Test field")).toHaveAttribute(
        "type",
        "email",
      );
    });

    it("correctly forwards the 'placeholder' prop to the underlying input", () => {
      render(<Wrapper textFieldProps={{ placeholder: "Type here..." }} />);
      expect(screen.getByPlaceholderText("Type here...")).toBeInTheDocument();
    });

    it("renders as disabled when the 'disabled' prop is passed", () => {
      render(<Wrapper textFieldProps={{ disabled: true }} />);
      expect(screen.getByLabelText("Test field")).toBeDisabled();
    });
  });

  describe("Validation", () => {
    it("displays the error message after submitting an invalid value", async () => {
      await renderAndSubmit();
      expect(
        await screen.findByText("At least 3 characters required"),
      ).toBeInTheDocument();
    });

    it("sets aria-invalid on the input when there is a validation error", async () => {
      await renderAndSubmit();
      await waitFor(() => {
        expect(screen.getByLabelText("Test field")).toHaveAttribute(
          "aria-invalid",
          "true",
        );
      });
    });

    it("clears the error message once the user provides a valid value", async () => {
      const user = userEvent.setup();
      render(<Wrapper />);

      await user.click(screen.getByRole("button", { name: "Submit" }));
      expect(
        await screen.findByText("At least 3 characters required"),
      ).toBeInTheDocument();

      await user.type(screen.getByLabelText("Test field"), "hello");
      await waitFor(() => {
        expect(
          screen.queryByText("At least 3 characters required"),
        ).not.toBeInTheDocument();
      });
    });

    it("does not call onSubmit when the form is invalid", async () => {
      const { onSubmit } = await renderAndSubmit("");
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Submit", () => {
    it("calls onSubmit with the correct values when the form is valid", async () => {
      const onSubmit = vi.fn();
      await renderAndSubmit("hello", onSubmit);
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(
        { field: "hello" },
        expect.anything(),
      );
    });
  });

  describe("Reset", () => {
    it("clears the field and removes errors after a reset", async () => {
      const user = userEvent.setup();
      render(<Wrapper />);

      await user.type(screen.getByLabelText("Test field"), "ab");
      await user.click(screen.getByRole("button", { name: "Submit" }));
      expect(
        await screen.findByText("At least 3 characters required"),
      ).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Reset" }));

      await waitFor(() => {
        expect(screen.getByLabelText("Test field")).toHaveValue("");
        expect(
          screen.queryByText("At least 3 characters required"),
        ).not.toBeInTheDocument();
      });
    });
  });
});
