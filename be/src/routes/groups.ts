import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";
import { createGroupSchema } from "../utilities/zod";

export const groupsRouter = Router();

// Every route below this line needs a logged-in user.
groupsRouter.use(requireAuth);

// Create a group. The creator becomes its admin.
groupsRouter.post("/", async (req, res) => {
  const parsed = createGroupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid input",
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const userId = res.locals.userId as string;
  const { name, description } = parsed.data;

  const duplicate = await prisma.membership.findFirst({
    where: {
      userId,
      group: { name: { equals: name, mode: "insensitive" } },
    },
  });

  if (duplicate) {
    res.status(409).json({
      error: "You already belong to a group with this name",
    });
    return;
  }

  const group = await prisma.group.create({
    data: {
      name,
      description,
      memberships: { create: { userId, role: "ADMIN" } },
    },
  });

  res.status(201).json({
    group: {
      id: group.id,
      name: group.name,
      description: group.description,
      role: "ADMIN",
    },
  });
});

// List the groups I belong to.
groupsRouter.get("/", async (_req, res) => {
  const userId = res.locals.userId as string;

  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: { group: true },
    orderBy: { joinedAt: "desc" },
  });

  res.json({
    groups: memberships.map((membership) => ({
      id: membership.group.id,
      name: membership.group.name,
      description: membership.group.description,
      role: membership.role,
    })),
  });
});

// Show one group, only if I am a member of it.
groupsRouter.get("/:groupId", async (req, res) => {
  const userId = res.locals.userId as string;

  const membership = await prisma.membership.findUnique({
    where: { userId_groupId: { userId, groupId: req.params.groupId } },
    include: { group: true },
  });

  if (!membership) {
    res.status(404).json({ error: "Group not found" });
    return;
  }

  res.json({
    group: {
      id: membership.group.id,
      name: membership.group.name,
      description: membership.group.description,
      role: membership.role,
    },
  });
});