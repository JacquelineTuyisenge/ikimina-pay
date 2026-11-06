import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";

const inputClass = "w-full border rounded px-3 py-2";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Cannot reach the server");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-3">
        <h1 className="text-2xl font-bold">Log in</h1>

        <input
          className={inputClass}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={inputClass}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-black text-white rounded px-3 py-2 disabled:opacity-50"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm">
          No account yet?{" "}
          <Link to="/register" className="underline">
            Register
          </Link>
        </p>
      </form>
    </main>
  );
}