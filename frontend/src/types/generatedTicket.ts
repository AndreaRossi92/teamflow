export interface GeneratedTicket {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  estimatedDays: number;
  tags: string[];
}
