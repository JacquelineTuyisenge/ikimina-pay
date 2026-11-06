export type Role = "ADMIN" | "TREASURER" | "MEMBER";

export type Group = {
  id: string;
  name: string;
  description: string | null;
  role: Role;
};