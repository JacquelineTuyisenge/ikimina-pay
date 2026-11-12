import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";

type Role = "ADMIN" | "TREASURER" | "MEMBER";

// Usage: requireGroupRole("ADMIN") or requireGroupRole("ADMIN", "TREASURER")
export function requireGroupRole(...allowed: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.userId as string;
    const groupId = req.params.groupId as string;

    const membership = await prisma.membership.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!membership) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    if (!allowed.includes(membership.role)) {
      res.status(403).json({ error: "You do not have permission to do this" });
      return;
    }

    res.locals.membership = membership;
    next();
  };
}