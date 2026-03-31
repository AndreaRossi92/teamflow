import type { GeneratedTicket } from "../../types/generatedTicket";

export const mockGeneratedTicket: GeneratedTicket = {
  title: "Add PDF export button to reports page",
  description:
    "Implement a button on the reports page that allows users to export " +
    "the current view as a PDF file. The export should include all visible " +
    "data and respect the current filters applied by the user.",
  priority: "medium",
  estimatedDays: 3,
  tags: ["export", "pdf", "reports", "frontend"],
};
