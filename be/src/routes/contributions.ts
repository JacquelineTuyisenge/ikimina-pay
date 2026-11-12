import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";
import { requireGroupRole } from "../middleware/requireGroupRole";
import { createCycleSchema } from "../utilities/zod";


type CycleWithStatuses = {
  id: string;
  title: string;
  amount: number;
  dueDate: Date;
  createdAt: Date;
  contributions: { status: string }[];
};

function summarizeCycle(cycle: CycleWithStatuses) {
  return {
    id: cycle.id,
    title: cycle.title,
    amount: cycle.amount,
    dueDate: cycle.dueDate,
    createdAt: cycle.createdAt,
    totalMembers: cycle.contributions.length,
    paidCount: cycle.contributions.filter((c) => c.status === "PAID").length,
  };
}

export const contributionsRouter = Router();

contributionsRouter.use(requireAuth);

// Create a cycle and one contribution per current member (admin and treasurer).
contributionsRouter.post(
  "/:groupId/cycles",
  requireGroupRole("ADMIN", "TREASURER"),
  async (req, res) => {
    const parsed = createCycleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid input",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const groupId = req.params.groupId as string;
    const { title, amount, dueDate } = parsed.data;

    const members = await prisma.membership.findMany({
      where: { groupId },
      select: { id: true },
    });

    const cycle = await prisma.contributionCycle.create({
      data: {
        groupId,
        title,
        amount,
        // "Due on the 30th" means until the end of the 30th.
        dueDate: new Date(`${dueDate}T23:59:59.999Z`),
        contributions: {
          create: members.map((member) => ({
            membershipId: member.id,
            amount,
          })),
        },
      },
      include: { contributions: { select: { status: true } } },
    });

    res.status(201).json({ cycle: summarizeCycle(cycle) });
  }
);

// List the cycles of a group (admin and treasurer).
contributionsRouter.get(
  "/:groupId/cycles",
  requireGroupRole("ADMIN", "TREASURER"),
  async (req, res) => {
    const groupId = req.params.groupId as string;

    const cycles = await prisma.contributionCycle.findMany({
      where: { groupId },
      orderBy: { dueDate: "desc" },
      include: { contributions: { select: { status: true } } },
    });

    res.json({ cycles: cycles.map(summarizeCycle) });
  }
);

// What I owe in this group (any member).
contributionsRouter.get(
  "/:groupId/my-contributions",
  requireGroupRole("ADMIN", "TREASURER", "MEMBER"),
  async (_req, res) => {
    const membership = res.locals.membership as { id: string };

    const contributions = await prisma.contribution.findMany({
      where: { membershipId: membership.id },
      orderBy: { cycle: { dueDate: "desc" } },
      include: { cycle: { select: { id: true, title: true, dueDate: true } } },
    });

    const now = new Date();

    res.json({
      contributions: contributions.map((contribution) => ({
        id: contribution.id,
        amount: contribution.amount,
        status: contribution.status,
        paidAt: contribution.paidAt,
        cycle: contribution.cycle,
        isLate:
          contribution.status === "PENDING" && contribution.cycle.dueDate < now,
      })),
    });
  }
);