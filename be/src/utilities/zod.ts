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