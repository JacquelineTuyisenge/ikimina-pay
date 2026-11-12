import { MtnMomoProvider } from "./mtnMomo";
import type { PaymentProvider } from "./types";

// Later we add AIRTEL_MONEY here, without changing any other code.
export const providers: Record<string, PaymentProvider> = {
  MTN_MOMO: new MtnMomoProvider(),
};