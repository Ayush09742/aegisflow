import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ShieldCheck, LockKeyhole } from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!token) {
      setError("This password reset link is invalid.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            new_password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Unable to reset your password."
        );
      }

      setMessage("Password reset successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reset your password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#05060a] px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full">

          {/* Logo */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10">
              <ShieldCheck
                size={21}
                className="text-violet-300"
              />
            </div>

            <span className="text-xl font-semibold">
              AegisFlow
            </span>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7 shadow-2xl shadow-violet-950/20 backdrop-blur-xl sm:p-9">

            <div className="mb-7">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                <LockKeyhole
                  size={20}
                  className="text-violet-300"
                />
              </div>

              <h1 className="text-2xl font-semibold">
                Reset your password
              </h1>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Choose a new password for your AegisFlow account.
              </p>
            </div>

            {!token ? (
              <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                This password reset link is invalid or missing.
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    New password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-400/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Confirm password
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-400/40"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-sm text-emerald-300">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Resetting password..."
                    : "Reset password"}
                </button>
              </form>
            )}

            <div className="mt-7 text-center text-sm text-zinc-600">
              <Link
                to="/login"
                className="text-zinc-400 transition hover:text-white"
              >
                Back to login
              </Link>
            </div>

          </div>

          <p className="mt-6 text-center text-xs text-zinc-700">
            AegisFlow · AI Gateway & Infrastructure Layer
          </p>

        </div>
      </div>
    </main>
  );
}