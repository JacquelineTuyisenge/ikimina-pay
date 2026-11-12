import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { formatDate, formatRwf } from "../lib/format";
import type { MyContribution } from "../types";

function statusInfo(item: MyContribution) {
  if (item.status === "PAID") {
    return { label: "Paid", className: "text-green-700 bg-green-50" };
  }
  if (item.isLate) {
    return { label: "Late", className: "text-red-700 bg-red-50" };
  }
  return { label: "Pending", className: "text-gray-700 bg-gray-100" };
}

type Props = { groupId: string };

export default function MyContributions({ groupId }: Props) {
  const { token } = useAuth();

  const [items, setItems] = useState<MyContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ contributions: MyContribution[] }>(
      `/groups/${groupId}/my-contributions`,
      { token }
    )
      .then((data) => setItems(data.contributions))
      .catch(() => setError("Could not load your contributions"))
      .finally(() => setLoading(false));
  }, [groupId, token]);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">My contributions</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="text-gray-600">You do not owe anything yet.</p>
      )}

      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          const status = statusInfo(item);
          return (
            <li
              key={item.id}
              className="border rounded p-3 flex items-center justify-between gap-3"
            >
              <div>
                <p className="font-medium">{item.cycle.title}</p>
                <p className="text-sm text-gray-600">
                  {formatRwf(item.amount)}, due {formatDate(item.cycle.dueDate)}
                </p>
              </div>
              <span className={`text-sm rounded px-2 py-1 ${status.className}`}>
                {status.label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}