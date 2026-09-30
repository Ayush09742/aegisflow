import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import React, { useState } from "react";

import { signup } from "../lib/api";

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.72-.06-1.41-.18-2.08H12v3.94h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.24Z"
      />
      <path
        fill="#34A853"
        d="M12 21.76c2.63 0 4.84-.87 6.45-2.33l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.76Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.88A5.85 5.85 0 0 1 6.24 12c0-.65.11-1.28.3-1.88V7.6H3.3A9.74 9.74 0 0 0 2.26 12c0 1.57.38 3.05 1.04 4.4l3.24-2.52Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.09c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.22 14.63 2.24 12 2.24a9.74 9.74 0 0 0-8.7 5.36l3.24 2.52C7.31 7.81 9.46 6.09 12 6.09Z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5A11.5 11.5 0 0 0 8.36 22.9c.58.1.79-.25.79-.56v-2.02c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.04 1.77 2.72 1.26 3.39.96.1-.75.41-1.26.74-1.55-2.57-.29-5.27-1.29-5.27-5.73 0-1.27.46-2.31 1.2-3.12-.12-.3-.52-1.48.11-3.08 0 0 .98-.31 3.17 1.19a11 11 0 0 1 5.77 0c2.19-1.5 3.17-1.19 3.17-1.19.63 1.6.23 2.78.11 3.08.74.81 1.2 1.85 1.2 3.12 0 4.45-2.71 5.43-5.29 5.72.42.36.79 1.06.79 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function SocialButton({
  provider,
  icon,
}: {
  provider: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{
        scale: 1.02,
        boxShadow: "0 0 30px rgba(139,92,246,0.16)",
      }}
      whileTap={{
        scale: 0.97,
        boxShadow: "0 0 45px rgba(139,92,246,0.3)",
      }}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-violet-400/25 hover:bg-white/[0.05]"
    >
      {icon}
      Continue with {provider}
    </motion.button>
  );
}

export default function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const data = await signup(
        name.trim(),
        email.trim(),
        password
      );

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      localStorage.setItem(
        "aegisflow_user",
        JSON.stringify({
          id: data.user_id,
          name: data.name,
          email: data.email,
        })
      );

      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05060a] px-6 py-10 text-white">
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

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 flex justify-center">
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 30px rgba(139,92,246,0.4)",
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

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 shadow-2xl shadow-violet-950/20 backdrop-blur-xl sm:p-9">
          <div className="mb-7">
            <div className="mb-3 flex items-center gap-2 text-sm text-violet-300">
              <Sparkles size={15} />
              Start building
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              Create your account
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Start controlling your AI traffic with AegisFlow.
            </p>
          </div>

          <div className="space-y-3">
            <SocialButton
              provider="Google"
              icon={<GoogleIcon />}
            />

            <SocialButton
              provider="GitHub"
              icon={<GitHubIcon />}
            />
          </div>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />

            <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">
              or continue with email
            </span>

            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Your name"
                autoComplete="name"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@company.com"
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Password
              </label>

              <div className="relative">
                <input
                  type={
                    showPassword ? "text" : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                />

                <motion.button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  whileTap={{ scale: 0.85 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-violet-300"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <motion.div
                    key={
                      showPassword
                        ? "open"
                        : "closed"
                    }
                    initial={{
                      opacity: 0,
                      rotate: -20,
                      scale: 0.7,
                    }}
                    animate={{
                      opacity: 1,
                      rotate: 0,
                      scale: 1,
                    }}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </motion.div>
                </motion.button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
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
                ? "Creating account..."
                : "Create account"}

              {!loading && (
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              )}
            </motion.button>
          </form>

          <p className="mt-7 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-violet-300 transition hover:text-violet-200"
            >
              Log in
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-700">
          Protected by AegisFlow infrastructure.
        </p>
      </motion.div>
    </main>
  );
}