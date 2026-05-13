import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { FormProvider, useForm } from "react-hook-form";
import { UserCreateForm } from "./UserCreateForm";
import type { UserCreateFormValues } from "../../types/userForm";

// ── Render helper ──────────────────────────────────────────────────────────────
// UserCreateForm relies on FormProvider/useFormContext, so we need to wrap it
// in a form context with sensible defaults.
function renderUserCreateForm(onEnter?: () => void) {
  function Wrapper() {
    const methods = useForm<UserCreateFormValues>({
      defaultValues: {
        email: "",
        fullName: "",
        password: "",
        confirmPassword: "",
        role: "dev",
      },
    });

    return (
      <FormProvider {...methods}>
        <UserCreateForm onEnter={onEnter} />
      </FormProvider>
    );
  }

  return render(<Wrapper />);
}

// ── Field helpers ──────────────────────────────────────────────────────────────
const getEmailInput = () => screen.getByRole("textbox", { name: /email/i });
const getFullNameInput = () =>
  screen.getByRole("textbox", { name: /fullName/i });
const getPasswordInput = () => screen.getByLabelText(/^password$/i);
const getConfirmPasswordInput = () => screen.getByLabelText(/confirmPassword/i);

// ── Tests ──────────────────────────────────────────────────────────────────────
describe("UserCreateForm", () => {
  describe("rendering", () => {
    it("shows all form fields", () => {
      renderUserCreateForm();

      expect(getEmailInput()).toBeInTheDocument();
      expect(getFullNameInput()).toBeInTheDocument();
      expect(getPasswordInput()).toBeInTheDocument();
      expect(getConfirmPasswordInput()).toBeInTheDocument();
    });

    it("shows the role autocomplete", () => {
      renderUserCreateForm();
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    });

    it("all fields are empty by default", () => {
      renderUserCreateForm();

      expect(getEmailInput()).toHaveValue("");
      expect(getFullNameInput()).toHaveValue("");
      expect(getPasswordInput()).toHaveValue("");
      expect(getConfirmPasswordInput()).toHaveValue("");
    });
  });

  describe("typing", () => {
    it("accepts input in the email field", async () => {
      renderUserCreateForm();
      const user = userEvent.setup();

      await user.type(getEmailInput(), "test@example.com");
      expect(getEmailInput()).toHaveValue("test@example.com");
    });

    it("accepts input in the fullName field", async () => {
      renderUserCreateForm();
      const user = userEvent.setup();

      await user.type(getFullNameInput(), "John Doe");
      expect(getFullNameInput()).toHaveValue("John Doe");
    });

    it("accepts input in the password field", async () => {
      renderUserCreateForm();
      const user = userEvent.setup();

      await user.type(getPasswordInput(), "secret123");
      expect(getPasswordInput()).toHaveValue("secret123");
    });

    it("accepts input in the confirmPassword field", async () => {
      renderUserCreateForm();
      const user = userEvent.setup();

      await user.type(getConfirmPasswordInput(), "secret123");
      expect(getConfirmPasswordInput()).toHaveValue("secret123");
    });
  });

  describe("Enter key", () => {
    it("calls onEnter when Enter is pressed on the email field", async () => {
      const onEnter = vi.fn();
      renderUserCreateForm(onEnter);
      const user = userEvent.setup();

      await user.click(getEmailInput());
      await user.keyboard("{Enter}");

      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it("calls onEnter when Enter is pressed on the fullName field", async () => {
      const onEnter = vi.fn();
      renderUserCreateForm(onEnter);
      const user = userEvent.setup();

      await user.click(getFullNameInput());
      await user.keyboard("{Enter}");

      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it("calls onEnter when Enter is pressed on the password field", async () => {
      const onEnter = vi.fn();
      renderUserCreateForm(onEnter);
      const user = userEvent.setup();

      await user.click(getPasswordInput());
      await user.keyboard("{Enter}");

      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it("calls onEnter when Enter is pressed on the confirmPassword field", async () => {
      const onEnter = vi.fn();
      renderUserCreateForm(onEnter);
      const user = userEvent.setup();

      await user.click(getConfirmPasswordInput());
      await user.keyboard("{Enter}");

      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it("does not throw if onEnter is not provided", async () => {
      renderUserCreateForm(); // no onEnter prop
      const user = userEvent.setup();

      await user.click(getEmailInput());
      await expect(user.keyboard("{Enter}")).resolves.not.toThrow();
    });
  });
});
