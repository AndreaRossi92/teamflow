import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm, FormProvider, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ControlledPasswordField } from "./ControlledPasswordField";

const DEFAULT_SCHEMA = z.object({
  password: z.string().min(3, "At least 3 characters required"),
});

function Wrapper({
  schema = DEFAULT_SCHEMA,
  defaultValues = { password: "" },
  onSubmit = vi.fn(),
}: {
  schema?: z.ZodType<unknown, FieldValues>;
  defaultValues?: Record<string, string>;
  onSubmit?: (values: unknown) => void;
}) {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <ControlledPasswordField name="password" label="Password" />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

describe("ControlledPasswordField", () => {
  describe("Rendering", () => {
    it("renders the field with the correct label", () => {
      render(<Wrapper />);
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("renders as a password input by default", () => {
      render(<Wrapper />);
      expect(screen.getByLabelText("Password")).toHaveAttribute(
        "type",
        "password",
      );
    });

    it("renders the toggle visibility button", () => {
      render(<Wrapper />);
      expect(
        screen.getByRole("button", { name: "showPassword" }),
      ).toBeInTheDocument();
    });
  });

  describe("Show/hide password toggle", () => {
    it("shows the password when the toggle button is clicked", async () => {
      const user = userEvent.setup();
      render(<Wrapper />);

      await user.click(screen.getByRole("button", { name: "showPassword" }));

      expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    });

    it("hides the password again when the toggle button is clicked twice", async () => {
      const user = userEvent.setup();
      render(<Wrapper />);

      const toggle1 = screen.getByRole("button", {
        name: "showPassword",
      });
      await user.click(toggle1);
      const toggle2 = screen.getByRole("button", {
        name: "hidePassword",
      });
      await user.click(toggle2);

      expect(screen.getByLabelText("Password")).toHaveAttribute(
        "type",
        "password",
      );
    });

    it("shows the VisibilityOff icon when password is visible", async () => {
      const user = userEvent.setup();
      render(<Wrapper />);

      await user.click(screen.getByRole("button", { name: "showPassword" }));

      expect(screen.getByTestId("VisibilityOffIcon")).toBeInTheDocument();
    });

    it("shows the Visibility icon when password is hidden", () => {
      render(<Wrapper />);
      expect(screen.getByTestId("VisibilityIcon")).toBeInTheDocument();
    });
  });

  describe("Validation", () => {
    it("displays the error message after submitting an invalid value", async () => {
      const user = userEvent.setup();
      render(<Wrapper />);

      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(
        await screen.findByText("At least 3 characters required"),
      ).toBeInTheDocument();
    });

    it("does not call onSubmit when the form is invalid", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<Wrapper onSubmit={onSubmit} />);

      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("calls onSubmit with the correct values when the form is valid", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<Wrapper onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText("Password"), "hello");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(
        { password: "hello" },
        expect.anything(),
      );
    });
  });
});
