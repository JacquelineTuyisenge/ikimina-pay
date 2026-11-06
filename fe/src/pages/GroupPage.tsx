import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, ApiError } from "../lib/api";
import type { Group } from "../types";

export default function GroupPage() {
  const { groupId } = useParams();
  const { token } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ group: Group }>(`/groups/${groupId}`, { token })
      .then((data) => setGroup(data.group))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Cannot reach the server")
      )
      .finally(() => setLoading(false));
  }, [groupId, token]);

  return (
    <main className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
      <Link to="/dashboard" className="underline text-sm">
        Back to dashboard
      </Link>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {group && (
        <>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          {group.description && <p className="text-gray-600">{group.description}</p>}
          <p className="text-sm">Your role: {group.role.toLowerCase()}</p>
          <p className="text-gray-500">Members and contributions come next.</p>
        </>
      )}
    </main>
  );
}