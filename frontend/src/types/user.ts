export type User = {
  id: string;
  email: string;
  role: "admin" | "manager" | "dev";
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
};
