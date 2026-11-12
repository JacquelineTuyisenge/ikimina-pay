export type ProviderStatus = "PENDING" | "SUCCESSFUL" | "FAILED";

export type InitiatePaymentInput = {
  reference: string; // our own unique id for this payment attempt
  amount: number;
  currency: string;
  phone: string; //
  payerMessage: string;
  payeeNote: string;
};

export type VerifyResult = {
  status: ProviderStatus;
  reason?: string;
};

export interface PaymentProvider {
  initiatePayment(input: InitiatePaymentInput): Promise<void>;
  verifyPayment(reference: string): Promise<VerifyResult>;
}

export class PaymentProviderError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}