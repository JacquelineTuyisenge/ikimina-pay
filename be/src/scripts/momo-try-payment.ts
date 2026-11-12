import "dotenv/config";
import { randomUUID } from "node:crypto";
import { MtnMomoProvider } from "../payments/mtnMomo";

const phoneArg = process.argv[2];
if (!phoneArg) {
  console.error("Usage: npx tsx src/scripts/momo-try-payment.ts PHONE_NUMBER");
  process.exit(1);
}
const phone: string = phoneArg;

const provider = new MtnMomoProvider();
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const reference = randomUUID();

  await provider.initiatePayment({
    reference,
    amount: 100,
    currency: process.env.MTN_CURRENCY ?? "EUR",
    phone,
    payerMessage: "Ikimina Pay test",
    payeeNote: "Sandbox test",
  });
  console.log("Payment requested. Reference:", reference);

  for (let attempt = 1; attempt <= 6; attempt++) {
    const result = await provider.verifyPayment(reference);
    console.log(
      `Check ${attempt}: ${result.status}${result.reason ? ` (${result.reason})` : ""}`
    );
    if (result.status !== "PENDING") return;
    await sleep(2000);
  }
  console.log("Still pending after 6 checks.");
}

main().catch((error) => {
  console.error("Error:", error instanceof Error ? error.message : error);
  process.exit(1);
});