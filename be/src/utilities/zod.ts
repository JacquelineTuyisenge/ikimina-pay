import z from "zod";
import { normalizeRwandaPhone } from "../lib/phone";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  email: z.string().trim().email("Invalid email"),
  phone: z
    .string()
    .refine(
      (value) => normalizeRwandaPhone(value) !== null,
      "Enter a valid Rwandan mobile number, e.g. 0788123456"
    ),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({ 
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Group name must be at least 3 characters")
    .max(60, "Group name is too long"),
  description: z.string().trim().max(300, "Description is too long").optional(),
});

export const addMemberSchema = z.object({
  email: z.string().trim().email("Invalid email"),
});

export const changeRoleSchema = z.object({
  role: z.enum(["TREASURER", "MEMBER"]),
});

export const createCycleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(60, "Title is too long"),
  amount: z
    .number("Amount must be a number")
    .int("Amount must be a whole number of RWF")
    .min(100, "Amount must be at least 100 RWF")
    .max(10_000_000, "Amount is too large"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date"),
});