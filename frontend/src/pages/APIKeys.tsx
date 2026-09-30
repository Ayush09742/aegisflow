import { useEffect, useState } from "react";
import { KeyRound, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

import {
  createUserApiKey,
  getUserApiKeys,
  revokeUserApiKey,
  type APIKey,
  type APIKeyCreateResponse,
} from "../lib/api";

export default function APIKeys() {
  const navigate = useNavigate();

  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  const [name, setName] = useState("");
  const [rateLimit, setRateLimit] = useState("10");
  const [budget, setBudget] = useState("5");

  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] =
    useState<APIKeyCreateResponse | null>(null);

  async function loadKeys() {
    try {
      setLoading(true);
      setError("");

      const data = await getUserApiKeys();
      setKeys(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load API keys."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadKeys();
  }, []);

  async function handleCreate() {
    if (!name.trim()) {
      setError("Please enter a name for the API key.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const result = await createUserApiKey({
        name: name.trim(),
        rate_limit: Number(rateLimit),
        monthly_budget_usd:
          budget.trim() === ""
            ? null
            : Number(budget),
      });

      setCreatedKey(result);

      setName("");
      setRateLimit("10");
      setBudget("5");
      setShowCreate(false);

      await loadKeys();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create API key."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: number) {
    const confirmed = window.confirm(
      "Revoke this API key? Applications using it will stop working."
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await revokeUserApiKey(id);

      await loadKeys();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to revoke API key."
      );
    }
  }

  function closeCreatedKey() {
    setCreatedKey(null);
  }

  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[160px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
      </div>

      <div className="relative min-h-screen">
        <header className="flex h-20 items-center justify-between border-b border-white/10 px-6 lg:px-10">
          <div>
            <p className="text-sm text-zinc-500">
              Developer access
            </p>

            <h1 className="text-lg font-semibold">
              API Keys
            </h1>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            <Plus size={16} />
            Create API key
          </button>
        </header>

        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
          <div className="mb-10">
            <div className="mb-3 flex items-center gap-2 text-sm text-violet-300">
              <KeyRound size={15} />
              Credentials
            </div>

            <h2 className="text-3xl font-semibold tracking-tight">
              Manage your API keys.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Create credentials for applications sending
              AI traffic through AegisFlow.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {createdKey && (
            <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <ShieldCheck size={18} />
                    API key created
                  </div>

                  <p className="mt-2 text-sm text-zinc-400">
                    Copy this key now. For security, the raw
                    secret is only returned when the key is created.
                  </p>
                </div>

                <button
                  onClick={closeCreatedKey}
                  className="text-zinc-500 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
                <code className="break-all text-sm text-white">
                  {createdKey.api_key}
                </code>
              </div>

              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    createdKey.api_key
                  )
                }
                className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                Copy API key
              </button>
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center text-sm text-zinc-500">
              Loading API keys...
            </div>
          ) : keys.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-10 text-center">
              <KeyRound
                size={28}
                className="mx-auto text-violet-300"
              />

              <h3 className="mt-4 text-lg font-semibold">
                No API keys yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                Create your first API key to start sending
                application traffic through AegisFlow.
              </p>

              <button
                onClick={() => setShowCreate(true)}
                className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black"
              >
                Create your first key
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {keys.map((apiKey) => (
                <motion.div
                  key={apiKey.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                          <KeyRound
                            size={18}
                            className="text-violet-300"
                          />
                        </div>

                        <div>
                          <h3 className="font-semibold">
                            {apiKey.name}
                          </h3>

                          <div className="mt-1 flex items-center gap-2 text-xs">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                apiKey.is_active
                                  ? "bg-emerald-400"
                                  : "bg-red-400"
                              }`}
                            />

                            <span className="text-zinc-500">
                              {apiKey.is_active
                                ? "Active"
                                : "Revoked"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                      <div>
                        <div className="text-xs text-zinc-600">
                          Rate limit
                        </div>

                        <div className="mt-1 text-sm text-zinc-300">
                          {apiKey.rate_limit}/min
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-zinc-600">
                          Monthly budget
                        </div>

                        <div className="mt-1 text-sm text-zinc-300">
                          {apiKey.monthly_budget_usd === null
                            ? "Unlimited"
                            : `$${apiKey.monthly_budget_usd}`}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-zinc-600">
                          Type
                        </div>

                        <div className="mt-1 text-sm text-zinc-300">
                          User key
                        </div>
                      </div>
                    </div>

                    {apiKey.is_active && (
                      <button
                        onClick={() =>
                          handleRevoke(apiKey.id)
                        }
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/5 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-500/10"
                      >
                        <Trash2 size={15} />
                        Revoke
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0c13] p-7 shadow-2xl shadow-violet-950/30"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-violet-300">
                  <KeyRound size={17} />
                  New API key
                </div>

                <h2 className="text-2xl font-semibold">
                  Create credentials
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Configure how your application can use
                  AegisFlow.
                </p>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Key name
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="production-app"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-400/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Rate limit / minute
                </label>

                <input
                  type="number"
                  min="1"
                  value={rateLimit}
                  onChange={(event) =>
                    setRateLimit(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Monthly budget (USD)
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={budget}
                  onChange={(event) =>
                    setBudget(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/50"
                />
              </div>
            </div>

            <div className="mt-7 flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-50"
              >
                {creating
                  ? "Creating..."
                  : "Create API key"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}