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

export type Cycle = {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  createdAt: string;
  totalMembers: number;
  paidCount: number;
};

export type MyContribution = {
  id: string;
  amount: number;
  status: "PENDING" | "PAID";
  paidAt: string | null;
  isLate: boolean;
  cycle: { id: string; title: string; dueDate: string };
};