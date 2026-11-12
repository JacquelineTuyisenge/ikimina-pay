import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";
import { requireGroupRole } from "../middleware/requireGroupRole";
import { createGroupSchema, addMemberSchema, changeRoleSchema } from "../utilities/zod";

const memberUser = { id: true, name: true, email: true, phone: true };

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

// List the members of a group (admin and treasurer only).
groupsRouter.get(
  "/:groupId/members",
  requireGroupRole("ADMIN", "TREASURER"),
  async (req, res) => {
    const groupId = req.params.groupId as string;

    const members = await prisma.membership.findMany({
      where: { groupId },
      include: { user: { select: memberUser } },
      orderBy: { joinedAt: "asc" },
    });

    res.json({
      members: members.map((member) => ({
        id: member.id,
        role: member.role,
        joinedAt: member.joinedAt,
        user: member.user,
      })),
    });
  }
);

// Add a registered user to the group (admin only).
groupsRouter.post(
  "/:groupId/members",
  requireGroupRole("ADMIN"),
  async (req, res) => {
    const parsed = addMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid input",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const groupId = req.params.groupId as string;

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (!user) {
      res.status(404).json({
        error: "No registered user with this email. Ask them to register first.",
      });
      return;
    }

    const existing = await prisma.membership.findUnique({
      where: { userId_groupId: { userId: user.id, groupId } },
    });
    if (existing) {
      res.status(409).json({ error: "This person is already in the group" });
      return;
    }

    const member = await prisma.membership.create({
      data: { userId: user.id, groupId, role: "MEMBER" },
      include: { user: { select: memberUser } },
    });

    res.status(201).json({
      member: {
        id: member.id,
        role: member.role,
        joinedAt: member.joinedAt,
        user: member.user,
      },
    });
  }
);

// Make a member a treasurer, or turn a treasurer back into a member (admin only).
groupsRouter.patch(
  "/:groupId/members/:membershipId",
  requireGroupRole("ADMIN"),
  async (req, res) => {
    const parsed = changeRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid input",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const groupId = req.params.groupId as string;
    const membershipId = req.params.membershipId as string;

    // Search by id AND group, so an admin can only touch members of their own group.
    const target = await prisma.membership.findFirst({
      where: { id: membershipId, groupId },
    });
    if (!target) {
      res.status(404).json({ error: "Member not found" });
      return;
    }

    if (target.role === "ADMIN") {
      res.status(400).json({ error: "The group admin's role cannot be changed" });
      return;
    }

    const member = await prisma.membership.update({
      where: { id: target.id },
      data: { role: parsed.data.role },
      include: { user: { select: memberUser } },
    });

    res.json({
      member: {
        id: member.id,
        role: member.role,
        joinedAt: member.joinedAt,
        user: member.user,
      },
    });
  }
);