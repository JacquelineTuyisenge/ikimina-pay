import "dotenv/config";
import { randomUUID } from "node:crypto";

const BASE_URL = "https://sandbox.momodeveloper.mtn.com";

const subscriptionKeyFromEnv = process.env.MTN_SUBSCRIPTION_KEY;
if (!subscriptionKeyFromEnv) {
  console.error("MTN_SUBSCRIPTION_KEY is missing in be/.env");
  process.exit(1);
}
const subscriptionKey: string = subscriptionKeyFromEnv;

async function fail(step: string, response: Response): Promise<never> {
  console.error(`${step} failed: HTTP ${response.status}`);
  console.error(await response.text());
  process.exit(1);
}

async function main() {
  // Step 1: create the API user. We invent its id ourselves.
  const apiUser = randomUUID();

  const createUser = await fetch(`${BASE_URL}/v1_0/apiuser`, {
    method: "POST",
    headers: {
      "X-Reference-Id": apiUser,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ providerCallbackHost: "ikimina-pay.onrender.com" }),
  });
  if (createUser.status !== 201) {
    await fail("Creating the API user", createUser);
  }
  console.log("Step 1 OK: API user created");

  // Step 2: create the API key for that user. MTN shows it only once.
  const createKey = await fetch(`${BASE_URL}/v1_0/apiuser/${apiUser}/apikey`, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": subscriptionKey },
  });
  if (!createKey.ok) {
    await fail("Creating the API key", createKey);
  }
  const { apiKey } = (await createKey.json()) as { apiKey: string };
  console.log("Step 2 OK: API key created");

  // Step 3 (check only): ask for a token to prove the credentials work.
  const basic = Buffer.from(`${apiUser}:${apiKey}`).toString("base64");
  const tokenResponse = await fetch(`${BASE_URL}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
    },
  });
  if (!tokenResponse.ok) {
    await fail("Requesting a token", tokenResponse);
  }
  console.log("Step 3 OK: token request works");

  console.log("\nCopy these two lines into be/.env (and into Render):\n");
  console.log(`MTN_API_USER=${apiUser}`);
  console.log(`MTN_API_KEY=${apiKey}`);
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});