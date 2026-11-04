import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) =>
        setStatus(data.status === "ok" ? "API is running" : "API problem")
      )
      .catch(() => setStatus("Cannot reach the API"));
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-2">
      <h1 className="text-3xl font-bold">Ikimina Pay</h1>
      <p className="text-gray-600">{status}</p>
    </main>
  );
}