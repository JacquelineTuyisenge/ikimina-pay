import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";

const inputClass = "w-full border rounded px-3 py-2";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);

    try {
      await register({ name, email, phone, password });
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.details ?? {});
      } else {
        setError("Cannot reach the server");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-3">
        <h1 className="text-2xl font-bold">Create your account</h1>

        <div>
          <input
            className={inputClass}
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="text-sm text-red-600">{fieldErrors.name?.[0]}</p>
        </div>

        <div>
          <input
            className={inputClass}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-sm text-red-600">{fieldErrors.email?.[0]}</p>
        </div>

        <div>
          <input
            className={inputClass}
            placeholder="Phone, e.g. 0788123456"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="text-sm text-red-600">{fieldErrors.phone?.[0]}</p>
        </div>

        <div>
          <input
            className={inputClass}
            type="password"
            placeholder="Password (at least 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-sm text-red-600">{fieldErrors.password?.[0]}</p>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-black text-white rounded px-3 py-2 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Register"}
        </button>

        <p className="text-sm">
          Already have an account?{" "}
          <Link to="/login" className="underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}