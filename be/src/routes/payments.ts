import { Router } from "express";
import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";
import { requireGroupRole } from "../middleware/requireGroupRole";
import { providers } from "../payments";
import { syncPayment } from "../payments/service";

export const paymentsRouter = Router();

function publicPayment(payment: {
  id: string;
  status: string;
  amount: number;
  currency: string;
  isSandbox: boolean;
  createdAt: Date;
}) {
  return {
    id: payment.id,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency,
    isSandbox: payment.isSandbox,
    createdAt: payment.createdAt,
  };
}

// Start a payment for one of my own contributions.
paymentsRouter.post(
  "/groups/:groupId/contributions/:contributionId/pay",
  requireAuth,
  requireGroupRole("ADMIN", "TREASURER", "MEMBER"),
  async (req, res) => {
    const userId = res.locals.userId as string;
    const membership = res.locals.membership as { id: string };
    const contributionId = req.params.contributionId as string;

    // 1. It must be MY contribution, in this group.
    const contribution = await prisma.contribution.findFirst({
      where: { id: contributionId, membershipId: membership.id },
      include: { cycle: { select: { title: true } } },
    });
    if (!contribution) {
      res.status(404).json({ error: "Contribution not found" });
      return;
    }

    // 2. Already paid?
    if (contribution.status === "PAID") {
      res.status(409).json({ error: "This contribution is already paid" });
      return;
    }

    // 3. Is an earlier attempt still open? Ask MTN about it first.
    const open = await prisma.payment.findFirst({
      where: { contributionId, status: "PENDING" },
    });
    if (open) {
      const current = await syncPayment(open.id).catch(() => open);

      if (current?.status === "SUCCESSFUL") {
        res.status(409).json({ error: "This contribution is already paid" });
        return;
      }
      if (!current || current.status === "PENDING") {
        res.status(409).json({
          error: "A payment is already in progress. Check your phone.",
          paymentId: open.id,
        });
        return;
      }
      // The earlier attempt failed, so a new one is allowed.
    }

    // 4. Which phone gets the prompt? The one saved on the account.
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(401).json({ error: "Login required" });
      return;
    }

    const isSandbox = process.env.MTN_TARGET_ENVIRONMENT === "sandbox";
    const sandboxPhone = process.env.MTN_SANDBOX_PHONE_OVERRIDE;
    const phone = isSandbox && sandboxPhone ? sandboxPhone : user.phone;
    const currency = process.env.MTN_CURRENCY ?? "EUR";

    // 5. Save the attempt BEFORE asking MTN, so we never lose a reference.
    const payment = await prisma.payment.create({
      data: {
        contributionId,
        provider: "MTN_MOMO",
        providerReference: randomUUID(),
        phone,
        amount: contribution.amount,
        currency,
        isSandbox,
      },
    });

    // 6. Ask MTN to request the money.
    try {
      await providers.MTN_MOMO.initiatePayment({
        reference: payment.providerReference,
        amount: payment.amount,
        currency,
        phone,
        payerMessage: `Ikimina Pay: ${contribution.cycle.title}`,
        payeeNote: `Contribution ${contribution.id}`,
      });
    } catch (error) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      console.error(
        "MTN payment request failed:",
        error instanceof Error ? error.message : error
      );
      res.status(502).json({ error: "Could not start the payment. Please try again." });
      return;
    }

    res.status(201).json({ payment: publicPayment(payment) });
  }
);

// Check a payment. If it is still pending, ask MTN and update our records.
paymentsRouter.get("/payments/:paymentId", requireAuth, async (req, res) => {
  const userId = res.locals.userId as string;
  const paymentId = req.params.paymentId as string;

  // Only the person who owns the contribution may see this payment.
  const owned = await prisma.payment.findFirst({
    where: { id: paymentId, contribution: { membership: { userId } } },
  });
  if (!owned) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  let payment = owned;
  if (owned.status === "PENDING") {
    try {
      payment = (await syncPayment(owned.id)) ?? owned;
    } catch (error) {
      // A temporary problem reaching MTN must not break the page: stay pending.
      console.error(
        "Could not check payment with MTN:",
        error instanceof Error ? error.message : error
      );
    }
  }

  const contribution = await prisma.contribution.findUnique({
    where: { id: payment.contributionId },
    select: { id: true, status: true, paidAt: true },
  });

  res.json({ payment: publicPayment(payment), contribution });
});