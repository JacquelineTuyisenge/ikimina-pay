import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api, ApiError } from "../lib/api";

type PaymentInfo = { id: string; status: "PENDING" | "SUCCESSFUL" | "FAILED" };

type Props = {
  groupId: string;
  contributionId: string;
  onPaid: () => void;
};

const CHECK_EVERY_MS = 3000;
const GIVE_UP_AFTER_MS = 120000;

export default function PayButton({ groupId, contributionId, onPaid }: Props) {
  const { token, user } = useAuth();

  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState("");
  const [timedOut, setTimedOut] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!paymentId) return;

    let stopped = false;
    const startedAt = Date.now();

    async function check() {
      try {
        const data = await api<{ payment: PaymentInfo }>(`/payments/${paymentId}`, {
          token,
        });
        if (stopped) return;

        if (data.payment.status === "SUCCESSFUL") {
          clearInterval(timer);
          setPaymentId(null);
          onPaid();
        } else if (data.payment.status === "FAILED") {
          clearInterval(timer);
          setPaymentId(null);
          setMessage("The payment failed or was rejected. You can try again.");
        } else if (Date.now() - startedAt > GIVE_UP_AFTER_MS) {
          clearInterval(timer);
          setTimedOut(true);
        }
      } catch {
        // A network problem: do nothing, and check again at the next tick.
      }
    }

    const timer = setInterval(check, CHECK_EVERY_MS);

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [paymentId, token, round]);

  async function handlePay() {
    setMessage("");
    setTimedOut(false);
    setStarting(true);

    try {
      const data = await api<{ payment: PaymentInfo }>(
        `/groups/${groupId}/contributions/${contributionId}/pay`,
        { method: "POST", token }
      );
      setPaymentId(data.payment.id);
    } catch (err) {
      const existingId = err instanceof ApiError ? err.body?.paymentId : undefined;

      if (err instanceof ApiError && err.status === 409 && typeof existingId === "string") {
        // A payment is already in progress: watch that one.
        setPaymentId(existingId);
      } else {
        setMessage(err instanceof ApiError ? err.message : "Cannot reach the server");
      }
    } finally {
      setStarting(false);
    }
  }

  if (paymentId && !timedOut) {
    return (
      <div className="border rounded p-3 bg-yellow-50">
        <p className="font-medium">Check your phone and approve the payment request.</p>
        <p className="text-sm text-gray-600">Waiting for MTN MoMo...</p>
      </div>
    );
  }

  if (paymentId && timedOut) {
    return (
      <div className="border rounded p-3 bg-yellow-50 flex items-center justify-between gap-3">
        <p>Still waiting for your approval.</p>
        <button
          className="border rounded px-3 py-1"
          onClick={() => {
            setTimedOut(false);
            setRound((current) => current + 1);
          }}
        >
          Keep waiting
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handlePay}
        disabled={starting}
        className="bg-yellow-400 text-black font-medium rounded px-3 py-2 disabled:opacity-50"
      >
        {starting ? "Starting..." : "Pay with MTN MoMo"}
      </button>
      <p className="text-xs text-gray-600">
        The request will be sent to {user?.phone}
      </p>
      {message && <p className="text-sm text-red-600">{message}</p>}
    </div>
  );
}