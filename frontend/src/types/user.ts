export type User = {
  id: string;
  email: string;
  role: "admin" | "manager" | "dev";
  isActive: boolean;
  fullName: string;
  createdAt: string;
  updatedAt: string;
};
