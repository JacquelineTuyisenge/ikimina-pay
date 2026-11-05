import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { normalizeRwandaPhone } from "../lib/phone";
import { JWT_SECRET } from "../config";
import { requireAuth } from "../middleware/requireAuth";
import { registerSchema, loginSchema } from "../utilities/zod";


const publicUser = { id: true, name: true, email: true, phone: true };

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid input",
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { name, email, phone, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      phone: normalizeRwandaPhone(phone)!, // checked by the schema above
      passwordHash,
    },
    select: publicUser,
  });

  res.status(201).json({ user });
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  const passwordOk = user
    ? await bcrypt.compare(parsed.data.password, user.passwordHash)
    : false;

  if (!user || !passwordOk) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
  });
});

authRouter.get("/me", requireAuth, async (_req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: res.locals.userId },
    select: publicUser,
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ user });
});