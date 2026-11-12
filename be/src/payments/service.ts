import { prisma } from "../lib/prisma";
import { providers } from "./index";

// Asks the provider what happened to a payment and updates our records.
// Safe to call many times: only the first call that sees SUCCESSFUL pays the contribution.
export async function syncPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return null;
  if (payment.status !== "PENDING") return payment;

  const provider = providers[payment.provider];
  if (!provider) {
    throw new Error(`No provider configured for ${payment.provider}`);
  }

  const result = await provider.verifyPayment(payment.providerReference);

  if (result.status === "SUCCESSFUL") {
    await prisma.$transaction(async (tx) => {
      // Only one caller can flip PENDING to SUCCESSFUL, so a repeat does nothing.
      const flipped = await tx.payment.updateMany({
        where: { id: payment.id, status: "PENDING" },
        data: { status: "SUCCESSFUL" },
      });

      if (flipped.count === 1) {
        await tx.contribution.update({
          where: { id: payment.contributionId },
          data: { status: "PAID", paidAt: new Date() },
        });
      }
    });
  } else if (result.status === "FAILED") {
    await prisma.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "FAILED" },
    });
  }

  return prisma.payment.findUnique({ where: { id: payment.id } });
}