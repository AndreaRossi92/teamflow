import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { FormProvider, useForm } from "react-hook-form";
import { ProjectEditForm } from "./ProjectEditForm";
import type { ProjectEditFormValues } from "../types/projectForm";

// ── Render helper ──────────────────────────────────────────────────────────────
function renderProjectEditForm(
  onEnter?: () => void,
  defaultValues: Partial<ProjectEditFormValues> = {},
) {
  function Wrapper() {
    const methods = useForm<ProjectEditFormValues>({
      defaultValues: {
        name: "",
        description: "",
        ...defaultValues,
      },
    });

    return (
      <FormProvider {...methods}>
        <ProjectEditForm onEnter={onEnter} />
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
describe("ProjectEditForm", () => {
  describe("rendering", () => {
    it("shows name and description fields", () => {
      renderProjectEditForm();

      expect(getNameInput()).toBeInTheDocument();
      expect(getDescriptionInput()).toBeInTheDocument();
    });

    it("fields are empty when no defaultValues are provided", () => {
      renderProjectEditForm();

      expect(getNameInput()).toHaveValue("");
      expect(getDescriptionInput()).toHaveValue("");
    });

    it("pre-fills fields when defaultValues are provided", () => {
      renderProjectEditForm(undefined, {
        name: "My Existing Project",
        description: "An existing project description.",
      });

      expect(getNameInput()).toHaveValue("My Existing Project");
      expect(getDescriptionInput()).toHaveValue(
        "An existing project description.",
      );
    });

    it("renders description as a multiline textarea", () => {
      renderProjectEditForm();

      const description = getDescriptionInput();
      expect(description.tagName.toLowerCase()).toBe("textarea");
    });
  });

  describe("typing", () => {
    it("accepts input in the name field", async () => {
      renderProjectEditForm();
      const user = userEvent.setup();

      await user.type(getNameInput(), "Updated Project Name");
      expect(getNameInput()).toHaveValue("Updated Project Name");
    });

    it("accepts input in the description field", async () => {
      renderProjectEditForm();
      const user = userEvent.setup();

      await user.type(getDescriptionInput(), "Updated description.");
      expect(getDescriptionInput()).toHaveValue("Updated description.");
    });
  });

  describe("Enter key", () => {
    it("calls onEnter when Enter is pressed on the name field", async () => {
      const onEnter = vi.fn();
      renderProjectEditForm(onEnter);
      const user = userEvent.setup();

      await user.click(getNameInput());
      await user.keyboard("{Enter}");

      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it("calls onEnter when Enter is pressed on the description field", async () => {
      const onEnter = vi.fn();
      renderProjectEditForm(onEnter);
      const user = userEvent.setup();

      await user.click(getDescriptionInput());
      await user.keyboard("{Enter}");

      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it("does not throw if onEnter is not provided", async () => {
      renderProjectEditForm(); // no onEnter prop
      const user = userEvent.setup();

      await user.click(getNameInput());
      await expect(user.keyboard("{Enter}")).resolves.not.toThrow();
    });
  });
});
