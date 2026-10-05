import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import React, { useState } from "react";
import { forgotPassword } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await forgotPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      console.error("Forgot password failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to process your request"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05060a] px-6 py-10 text-white">

      {/* Background glow */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[-250px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[150px]"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.65, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
        }}
      />

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
          scale: 0.97,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10 w-full max-w-md"
      >

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <motion.div
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0 0 30px rgba(139,92,246,0.4)",
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10"
            >
              <ShieldCheck
                size={21}
                className="text-violet-300"
              />
            </motion.div>

            <span className="text-xl font-semibold">
              AegisFlow
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 shadow-2xl shadow-violet-950/20 backdrop-blur-xl sm:p-9">

          <div className="mb-7">

            <div className="mb-3 flex items-center gap-2 text-sm text-violet-300">
              <Sparkles size={15} />
              Account recovery
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              Forgot your password?
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Enter your email and we'll send you a secure
              password reset link.
            </p>

          </div>

          {success ? (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="space-y-5"
            >
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-4 text-sm leading-6 text-emerald-300">
                If an account exists with this email,
                we've sent a password reset link.
                Please check your inbox.
              </div>

              <Link
                to="/login"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:scale-[1.02]"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </motion.div>
          ) : (
            <form
              className="space-y-5"
              onSubmit={handleSubmit}
            >

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Email
                </label>

                <div className="relative">

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pr-11 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                  />

                  <Mail
                    size={17}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600"
                  />

                </div>
              </div>

              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={
                  !loading
                    ? {
                        scale: 1.02,
                        boxShadow:
                          "0 0 35px rgba(139,92,246,0.28)",
                      }
                    : undefined
                }
                whileTap={
                  !loading
                    ? {
                        scale: 0.97,
                        boxShadow:
                          "0 0 55px rgba(139,92,246,0.45)",
                      }
                    : undefined
                }
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Sending reset link..."
                  : "Send reset link"}

                {!loading && (
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                )}
              </motion.button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 pt-2 text-sm text-zinc-500 transition hover:text-violet-300"
              >
                <ArrowLeft size={15} />
                Back to Login
              </Link>

            </form>
          )}

        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Protected by AegisFlow infrastructure.
        </p>

      </motion.div>
    </main>
  );
}