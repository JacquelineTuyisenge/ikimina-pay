import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { api, ApiError } from "../lib/api";
import type { Member, Role } from "../types";

const roleLabel: Record<Role, string> = {
  ADMIN: "Admin",
  TREASURER: "Treasurer",
  MEMBER: "Member",
};

type Props = { groupId: string; myRole: Role };

export default function MembersSection({ groupId, myRole }: Props) {
  const { token } = useAuth();
  const isAdmin = myRole === "ADMIN";

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    api<{ members: Member[] }>(`/groups/${groupId}/members`, { token })
      .then((data) => setMembers(data.members))
      .catch(() => setLoadError("Could not load members"))
      .finally(() => setLoading(false));
  }, [groupId, token]);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const data = await api<{ member: Member }>(`/groups/${groupId}/members`, {
        method: "POST",
        token,
        body: { email },
      });
      setMembers([...members, data.member]);
      setEmail("");
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.details?.email?.[0] ?? err.message);
      } else {
        setFormError("Cannot reach the server");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function changeRole(member: Member, role: "TREASURER" | "MEMBER") {
    setActionError("");

    try {
      const data = await api<{ member: Member }>(
        `/groups/${groupId}/members/${member.id}`,
        { method: "PATCH", token, body: { role } }
      );
      setMembers(members.map((m) => (m.id === member.id ? data.member : m)));
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Cannot reach the server");
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Members</h2>

      {isAdmin && (
        <form onSubmit={handleAdd} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded px-3 py-2"
              type="email"
              placeholder="Email of a registered person"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-black text-white rounded px-3 py-2 disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add"}
            </button>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </form>
      )}

      {actionError && <p className="text-sm text-red-600">{actionError}</p>}
      {loading && <p>Loading...</p>}
      {loadError && <p className="text-red-600">{loadError}</p>}

      <ul className="flex flex-col gap-2">
        {members.map((member) => (
          <li
            key={member.id}
            className="border rounded p-3 flex items-center justify-between gap-3"
          >
            <div>
              <p className="font-medium">{member.user.name}</p>
              <p className="text-sm text-gray-600">{member.user.email}</p>
              <p className="text-sm text-gray-600">{member.user.phone}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{roleLabel[member.role]}</span>

              {isAdmin && member.role === "MEMBER" && (
                <button
                  className="border rounded px-2 py-1 text-sm"
                  onClick={() => changeRole(member, "TREASURER")}
                >
                  Make treasurer
                </button>
              )}
              {isAdmin && member.role === "TREASURER" && (
                <button
                  className="border rounded px-2 py-1 text-sm"
                  onClick={() => changeRole(member, "MEMBER")}
                >
                  Make member
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}