import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-3">
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <p className="text-gray-600">{user?.email}</p>
      <p className="text-gray-600">{user?.phone}</p>
      <button className="border rounded px-3 py-1" onClick={logout}>
        Log out
      </button>
    </main>
  );
}