import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { api, ApiError } from "../lib/api";
import { formatDate, formatRwf } from "../lib/format";
import type { Cycle } from "../types";

const inputClass = "w-full border rounded px-3 py-2";

type Props = { groupId: string };

export default function CyclesSection({ groupId }: Props) {
  const { token } = useAuth();

  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api<{ cycles: Cycle[] }>(`/groups/${groupId}/cycles`, { token })
      .then((data) => setCycles(data.cycles))
      .catch(() => setLoadError("Could not load contribution cycles"))
      .finally(() => setLoading(false));
  }, [groupId, token]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});
    setSubmitting(true);

    try {
      const data = await api<{ cycle: Cycle }>(`/groups/${groupId}/cycles`, {
        method: "POST",
        token,
        body: { title, amount: Number(amount), dueDate },
      });
      setCycles([data.cycle, ...cycles]);
      setTitle("");
      setAmount("");
      setDueDate("");
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        setFieldErrors(err.details ?? {});
      } else {
        setFormError("Cannot reach the server");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Contribution cycles</h2>

      <form onSubmit={handleCreate} className="flex flex-col gap-3">
        <div>
          <input
            className={inputClass}
            placeholder="Title, e.g. November savings"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <p className="text-sm text-red-600">{fieldErrors.title?.[0]}</p>
        </div>

        <div>
          <input
            className={inputClass}
            type="number"
            placeholder="Amount per member (RWF)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <p className="text-sm text-red-600">{fieldErrors.amount?.[0]}</p>
        </div>

        <div>
          <input
            className={inputClass}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <p className="text-sm text-red-600">{fieldErrors.dueDate?.[0]}</p>
        </div>

        {formError && <p className="text-red-600">{formError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-black text-white rounded px-3 py-2 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create cycle"}
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {loadError && <p className="text-red-600">{loadError}</p>}
      {!loading && !loadError && cycles.length === 0 && (
        <p className="text-gray-600">No cycles yet. Create the first one above.</p>
      )}

      <ul className="flex flex-col gap-2">
        {cycles.map((cycle) => (
          <li
            key={cycle.id}
            className="border rounded p-3 flex items-center justify-between gap-3"
          >
            <div>
              <p className="font-medium">{cycle.title}</p>
              <p className="text-sm text-gray-600">
                {formatRwf(cycle.amount)} per member, due {formatDate(cycle.dueDate)}
              </p>
            </div>
            <span className="text-sm text-gray-600">
              {cycle.paidCount} of {cycle.totalMembers} paid
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}