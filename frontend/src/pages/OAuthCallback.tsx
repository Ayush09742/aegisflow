import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";

import { exchangeOAuthCode } from "../lib/api";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [error, setError] = useState("");
  const exchangeStarted = useRef(false);

  useEffect(() => {
    if (exchangeStarted.current) {
      return;
    }

    exchangeStarted.current = true;

    async function completeOAuthLogin() {
      const code = searchParams.get("code");
      const oauthError = searchParams.get("error");

      if (oauthError) {
        setError(oauthError);
        return;
      }

      if (!code) {
        setError("Missing OAuth authorization code.");
        return;
      }

      try {
        const data = await exchangeOAuthCode(code);

        localStorage.setItem(
          "access_token",
          data.access_token
        );

        localStorage.setItem(
          "user",
          JSON.stringify({
            user_id: data.user_id,
            name: data.name,
            email: data.email,
          })
        );

        navigate("/dashboard", {
          replace: true,
        });
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to complete OAuth login."
        );
      }
    }

    completeOAuthLogin();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05060a] px-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-red-400/20 bg-red-500/10 p-8 text-center">
          <div className="text-sm font-medium text-red-300">
            Authentication failed
          </div>

          <p className="mt-3 text-sm leading-6 text-red-200/70">
            {error}
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-6 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-zinc-200 transition hover:bg-white/[0.08]"
          >
            Back to login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05060a] text-white">
      <div className="flex flex-col items-center text-center">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10"
        >
          <ShieldCheck
            size={22}
            className="text-violet-300"
          />
        </motion.div>

        <h1 className="mt-6 text-lg font-semibold">
          Completing authentication
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Securely signing you into AegisFlow...
        </p>
      </div>
    </main>
  );
}