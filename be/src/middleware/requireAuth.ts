import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Login required" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === "string" || !payload.sub) {
      throw new Error("Bad token");
    }
    res.locals.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}