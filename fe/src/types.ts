export type Role = "ADMIN" | "TREASURER" | "MEMBER";

export type Group = {
  id: string;
  name: string;
  description: string | null;
  role: Role;
};

export type Member = {
  id: string;
  role: Role;
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
};