import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, ApiError } from "../lib/api";
import type { Group, Role } from "../types";

const roleLabel: Record<Role, string> = {
  ADMIN: "Admin",
  TREASURER: "Treasurer",
  MEMBER: "Member",
};

const inputClass = "w-full border rounded px-3 py-2";

export default function Dashboard() {
  const { user, token, logout } = useAuth();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api<{ groups: Group[] }>("/groups", { token })
      .then((data) => setGroups(data.groups))
      .catch(() => setLoadError("Could not load your groups"))
      .finally(() => setLoadingGroups(false));
  }, [token]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});
    setSubmitting(true);

    try {
      const data = await api<{ group: Group }>("/groups", {
        method: "POST",
        token,
        body: { name, description: description || undefined },
      });
      setGroups([data.group, ...groups]);
      setName("");
      setDescription("");
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
    <main className="max-w-2xl mx-auto p-4 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>
        <button className="border rounded px-3 py-1" onClick={logout}>
          Log out
        </button>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-2">Create a group</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div>
            <input
              className={inputClass}
              placeholder="Group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-sm text-red-600">{fieldErrors.name?.[0]}</p>
          </div>

          <div>
            <textarea
              className={inputClass}
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="text-sm text-red-600">{fieldErrors.description?.[0]}</p>
          </div>

          {formError && <p className="text-red-600">{formError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-black text-white rounded px-3 py-2 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create group"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">My groups</h2>

        {loadingGroups && <p>Loading...</p>}
        {loadError && <p className="text-red-600">{loadError}</p>}
        {!loadingGroups && !loadError && groups.length === 0 && (
          <p className="text-gray-600">You are not in any group yet. Create one above.</p>
        )}

        <ul className="flex flex-col gap-2">
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                to={`/groups/${group.id}`}
                className="block border rounded p-3 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{group.name}</span>
                  <span className="text-sm text-gray-600">{roleLabel[group.role]}</span>
                </div>
                {group.description && (
                  <p className="text-sm text-gray-600">{group.description}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}