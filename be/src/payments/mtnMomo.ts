import {
  PaymentProviderError,
  type InitiatePaymentInput,
  type PaymentProvider,
  type VerifyResult,
} from "./types";

const DEFAULT_BASE_URL = "https://sandbox.momodeveloper.mtn.com";

function readConfig() {
  const required = [
    "MTN_SUBSCRIPTION_KEY",
    "MTN_API_USER",
    "MTN_API_KEY",
    "MTN_TARGET_ENVIRONMENT",
  ] as const;

  for (const name of required) {
    if (!process.env[name]) {
      throw new PaymentProviderError(`${name} is missing. Add it to your environment.`);
    }
  }

  return {
    baseUrl: process.env.MTN_BASE_URL ?? DEFAULT_BASE_URL,
    subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY as string,
    apiUser: process.env.MTN_API_USER as string,
    apiKey: process.env.MTN_API_KEY as string,
    targetEnvironment: process.env.MTN_TARGET_ENVIRONMENT as string,
    callbackUrl: process.env.MTN_CALLBACK_URL,
  };
}

type Config = ReturnType<typeof readConfig>;

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(config: Config): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const basic = Buffer.from(`${config.apiUser}:${config.apiKey}`).toString("base64");
  const response = await fetch(`${config.baseUrl}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
    },
  });

  if (!response.ok) {
    throw new PaymentProviderError(
      `Could not get an MTN token (HTTP ${response.status})`,
      response.status
    );
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };

  // Renew one minute before MTN says it expires.
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

export class MtnMomoProvider implements PaymentProvider {
  async initiatePayment(input: InitiatePaymentInput): Promise<void> {
    const config = readConfig();
    const token = await getAccessToken(config);

    const response = await fetch(`${config.baseUrl}/collection/v1_0/requesttopay`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reference-Id": input.reference,
        "X-Target-Environment": config.targetEnvironment,
        "Ocp-Apim-Subscription-Key": config.subscriptionKey,
        "Content-Type": "application/json",
        ...(config.callbackUrl ? { "X-Callback-Url": config.callbackUrl } : {}),
      },
      body: JSON.stringify({
        amount: String(input.amount),
        currency: input.currency,
        externalId: input.reference,
        payer: { partyIdType: "MSISDN", partyId: input.phone },
        payerMessage: input.payerMessage,
        payeeNote: input.payeeNote,
      }),
    });

    // 202 means "accepted": MTN will now ask the phone. It does not mean paid.
    if (response.status !== 202) {
      const text = await response.text();
      throw new PaymentProviderError(
        `MTN refused the payment request (HTTP ${response.status}): ${text}`,
        response.status
      );
    }
  }

  async verifyPayment(reference: string): Promise<VerifyResult> {
    const config = readConfig();
    const token = await getAccessToken(config);

    const response = await fetch(
      `${config.baseUrl}/collection/v1_0/requesttopay/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Target-Environment": config.targetEnvironment,
          "Ocp-Apim-Subscription-Key": config.subscriptionKey,
        },
      }
    );

    if (!response.ok) {
      throw new PaymentProviderError(
        `Could not check the payment with MTN (HTTP ${response.status})`,
        response.status
      );
    }

    const data = (await response.json()) as { status?: string; reason?: unknown };

    const reason =
      data.reason === undefined
        ? undefined
        : typeof data.reason === "string"
          ? data.reason
          : JSON.stringify(data.reason);

    if (data.status === "SUCCESSFUL") return { status: "SUCCESSFUL" };
    if (data.status === "FAILED") return { status: "FAILED", reason };
    return { status: "PENDING" };
  }
}