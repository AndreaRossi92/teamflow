export type AuthUser = {
  id: string;
  email: string;
  role: "admin" | "manager" | "dev";
  fullName: string;
};
