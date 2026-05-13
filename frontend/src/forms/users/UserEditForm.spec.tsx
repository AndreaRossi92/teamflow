import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { FormProvider, useForm } from "react-hook-form";
import { UserEditForm } from "./UserEditForm";
import type { UserEditFormValues } from "../../types/userForm";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// ── Render helper ──────────────────────────────────────────────────────────────
function renderUserEditForm(
  onEnter?: () => void,
  defaultValues: Partial<UserEditFormValues> = {},
) {
  function Wrapper() {
    const methods = useForm<UserEditFormValues>({
      defaultValues: {
        email: "",
        fullName: "",
        role: "dev",
        ...defaultValues,
      },
    });

    return (
      <FormProvider {...methods}>
        <UserEditForm onEnter={onEnter} />
      </FormProvider>
    );
  }

  return render(<Wrapper />);
}

// ── Field helpers ──────────────────────────────────────────────────────────────
const getEmailInput = () => screen.getByRole("textbox", { name: /email/i });
const getFullNameInput = () =>
  screen.getByRole("textbox", { name: /fullName/i });

// ── Tests ──────────────────────────────────────────────────────────────────────
describe("UserEditForm", () => {
  describe("rendering", () => {
    it("shows email, fullName and role fields", () => {
      renderUserEditForm();

      expect(getEmailInput()).toBeInTheDocument();
      expect(getFullNameInput()).toBeInTheDocument();
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    });

    it("does NOT show password fields", () => {
      renderUserEditForm();

      expect(screen.queryByLabelText(/^password$/i)).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText(/confirmPassword/i),
      ).not.toBeInTheDocument();
    });

    it("fields are empty when no defaultValues are provided", () => {
      renderUserEditForm();

      expect(getEmailInput()).toHaveValue("");
      expect(getFullNameInput()).toHaveValue("");
    });

    it("pre-fills fields when defaultValues are provided", () => {
      renderUserEditForm(undefined, {
        email: "john@example.com",
        fullName: "John Doe",
      });

      expect(getEmailInput()).toHaveValue("john@example.com");
      expect(getFullNameInput()).toHaveValue("John Doe");
    });
  });

  describe("typing", () => {
    it("accepts input in the email field", async () => {
      renderUserEditForm();
      const user = userEvent.setup();

      await user.type(getEmailInput(), "updated@example.com");
      expect(getEmailInput()).toHaveValue("updated@example.com");
    });

    it("accepts input in the fullName field", async () => {
      renderUserEditForm();
      const user = userEvent.setup();

      await user.type(getFullNameInput(), "Jane Doe");
      expect(getFullNameInput()).toHaveValue("Jane Doe");
    });
  });

  describe("Enter key", () => {
    it("calls onEnter when Enter is pressed on the email field", async () => {
      const onEnter = vi.fn();
      renderUserEditForm(onEnter);
      const user = userEvent.setup();

      await user.click(getEmailInput());
      await user.keyboard("{Enter}");

      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it("calls onEnter when Enter is pressed on the fullName field", async () => {
      const onEnter = vi.fn();
      renderUserEditForm(onEnter);
      const user = userEvent.setup();

      await user.click(getFullNameInput());
      await user.keyboard("{Enter}");

      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it("does not throw if onEnter is not provided", async () => {
      renderUserEditForm(); // no onEnter prop
      const user = userEvent.setup();

      await user.click(getEmailInput());
      await expect(user.keyboard("{Enter}")).resolves.not.toThrow();
    });
  });
});
