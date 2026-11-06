import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const [status, setStatus] = useState("Checking...");
  const { user } = useAuth();

  useEffect(() => {
    api<{ status: string }>("/health")
      .then((data) =>
        setStatus(data.status === "ok" ? "API is running" : "API problem")
      )
      .catch(() => setStatus("Cannot reach the API"));
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-3">
      <h1 className="text-3xl font-bold">Ikimina Pay</h1>
      <p className="text-gray-600">Savings groups, simple contributions.</p>
      <p className="text-sm text-gray-500">{status}</p>

      <div className="flex gap-3">
        {user ? (
          <Link to="/dashboard" className="bg-black text-white rounded px-3 py-2">
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link to="/register" className="bg-black text-white rounded px-3 py-2">
              Register
            </Link>
            <Link to="/login" className="border rounded px-3 py-2">
              Log in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}