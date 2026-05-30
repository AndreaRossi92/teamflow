import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { FormProvider, useForm } from "react-hook-form";
import { ProjectCreateForm } from "./ProjectCreateForm";
import type { ProjectCreateFormValues } from "../../types/projectForm";

// ── Render helper ──────────────────────────────────────────────────────────────
// ProjectCreateForm relies on FormProvider/useFormContext, so we need to wrap it
// in a form context with sensible defaults.
function renderProjectCreateForm(onEnter?: () => void) {
  function Wrapper() {
    const methods = useForm<ProjectCreateFormValues>({
      defaultValues: {
        name: "",
        description: "",
      },
    });

    return (
      <FormProvider {...methods}>
        <ProjectCreateForm onEnter={onEnter} />
      </FormProvider>
    );
  }

  return render(<Wrapper />);
}

// ── Field helpers ──────────────────────────────────────────────────────────────
const getNameInput = () => screen.getByRole("textbox", { name: /name/i });
const getDescriptionInput = () =>
  screen.getByRole("textbox", { name: /description/i });

// ── Tests ──────────────────────────────────────────────────────────────────────
describe("ProjectCreateForm", () => {
  describe("rendering", () => {
    it("shows all form fields", () => {
      renderProjectCreateForm();

      expect(getNameInput()).toBeInTheDocument();
      expect(getDescriptionInput()).toBeInTheDocument();
    });

    it("all fields are empty by default", () => {
      renderProjectCreateForm();

      expect(getNameInput()).toHaveValue("");
      expect(getDescriptionInput()).toHaveValue("");
    });

    it("renders description as a multiline textarea", () => {
      renderProjectCreateForm();

      const description = getDescriptionInput();
      expect(description.tagName.toLowerCase()).toBe("textarea");
    });
  });

  describe("typing", () => {
    it("accepts input in the name field", async () => {
      renderProjectCreateForm();
      const user = userEvent.setup();

      await user.type(getNameInput(), "My Project");
      expect(getNameInput()).toHaveValue("My Project");
    });

    it("accepts input in the description field", async () => {
      renderProjectCreateForm();
      const user = userEvent.setup();

      await user.type(getDescriptionInput(), "A short project description.");
      expect(getDescriptionInput()).toHaveValue("A short project description.");
    });
  });

  describe("Enter key", () => {
    it("calls onEnter when Enter is pressed on the name field", async () => {
      const onEnter = vi.fn();
      renderProjectCreateForm(onEnter);
      const user = userEvent.setup();

      await user.click(getNameInput());
      await user.keyboard("{Enter}");

      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it("calls onEnter when Enter is pressed on the description field", async () => {
      const onEnter = vi.fn();
      renderProjectCreateForm(onEnter);
      const user = userEvent.setup();

      await user.click(getDescriptionInput());
      await user.keyboard("{Enter}");

      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it("does not throw if onEnter is not provided", async () => {
      renderProjectCreateForm(); // no onEnter prop
      const user = userEvent.setup();

      await user.click(getNameInput());
      await expect(user.keyboard("{Enter}")).resolves.not.toThrow();
    });
  });
});
