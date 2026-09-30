import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  Coins,
  Database,
  KeyRound,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  XCircle,
  Zap,
} from "lucide-react";

import {
  getDashboardOverview,
  DashboardOverview,
} from "../lib/api";


export default function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState<DashboardOverview | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem(
      "aegisflow_access_token"
    );

    if (!token) {
      navigate("/login");
      return;
    }

    async function loadDashboard() {
      try {
        const data =
          await getDashboardOverview(token);

        setDashboard(data);
      } catch (err) {
        localStorage.removeItem(
          "aegisflow_access_token"
        );

        localStorage.removeItem(
          "aegisflow_user"
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);


  function logout() {
    localStorage.removeItem(
      "aegisflow_access_token"
    );

    localStorage.removeItem(
      "aegisflow_user"
    );

    navigate("/login");
  }


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05060a] text-white">
        <div className="flex items-center gap-3 text-zinc-400">
          <Activity
            size={20}
            className="animate-pulse text-violet-400"
          />
          Loading AegisFlow...
        </div>
      </div>
    );
  }


  if (error || !dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05060a] px-6 text-white">
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-6 py-5 text-red-300">
          {error || "Unable to load dashboard"}
        </div>
      </div>
    );
  }


  const { stats, user, recent_requests } =
    dashboard;


  return (
    <div className="min-h-screen bg-[#05060a] text-white">

      {/* Sidebar */}

      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-[#08090f] lg:block">

        <div className="flex h-full flex-col">

          <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10">
              <ShieldCheck
                size={21}
                className="text-violet-300"
              />
            </div>

            <div>
              <div className="font-semibold">
                AegisFlow
              </div>

              <div className="text-xs text-zinc-600">
                Control Plane
              </div>
            </div>

          </div>


          <nav className="flex-1 space-y-2 p-4">

            <button className="flex w-full items-center gap-3 rounded-xl bg-violet-500/10 px-4 py-3 text-sm text-violet-300">
              <BarChart3 size={18} />
              Overview
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-500 transition hover:bg-white/5 hover:text-white">
              <Activity size={18} />
              Requests
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-500 transition hover:bg-white/5 hover:text-white">
              <KeyRound size={18} />
              API Keys
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-500 transition hover:bg-white/5 hover:text-white">
              <Database size={18} />
              Usage
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-500 transition hover:bg-white/5 hover:text-white">
              <Settings size={18} />
              Settings
            </button>

          </nav>


          <div className="border-t border-white/10 p-4">

            <div className="mb-3 px-2">

              <div className="truncate text-sm text-zinc-300">
                {user.name}
              </div>

              <div className="truncate text-xs text-zinc-600">
                {user.email}
              </div>

            </div>

            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut size={17} />
              Log out
            </button>

          </div>

        </div>

      </aside>


      {/* Main */}

      <main className="lg:ml-64">

        {/* Header */}

        <header className="flex h-20 items-center justify-between border-b border-white/10 bg-[#08090f]/80 px-6 backdrop-blur-xl lg:px-10">

          <div>

            <div className="text-sm text-zinc-500">
              Overview
            </div>

            <h1 className="text-xl font-semibold">
              AI Traffic Control
            </h1>

          </div>


          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">

              <div className="text-sm font-medium">
                {user.name}
              </div>

              <div className="text-xs text-zinc-600">
                {user.email}
              </div>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-sm font-semibold text-violet-300">
              {user.name.charAt(0).toUpperCase()}
            </div>

          </div>

        </header>


        <div className="p-6 lg:p-10">

          {/* Welcome */}

          <div className="mb-8">

            <p className="text-sm text-violet-300">
              <Zap
                size={14}
                className="mr-1 inline"
              />
              System overview
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Welcome back, {user.name.split(" ")[0]}
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Monitor your AI traffic, reliability,
              performance and spending.
            </p>

          </div>


          {/* Stats */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Total Requests"
              value={stats.total_requests.toLocaleString()}
              icon={<Activity size={19} />}
            />

            <StatCard
              title="Successful"
              value={stats.successful_requests.toLocaleString()}
              icon={<CheckCircle2 size={19} />}
            />

            <StatCard
              title="Failed"
              value={stats.failed_requests.toLocaleString()}
              icon={<XCircle size={19} />}
            />

            <StatCard
              title="Avg. Latency"
              value={`${Math.round(
                stats.average_latency_ms
              )} ms`}
              icon={<Clock3 size={19} />}
            />

          </div>


          {/* Second row */}

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Total Tokens"
              value={stats.total_tokens.toLocaleString()}
              icon={<Database size={19} />}
            />

            <StatCard
              title="Prompt Tokens"
              value={stats.total_prompt_tokens.toLocaleString()}
              icon={<BarChart3 size={19} />}
            />

            <StatCard
              title="Cache Hit Rate"
              value={`${stats.cache_hit_rate}%`}
              icon={<Zap size={19} />}
            />

            <StatCard
              title="Total AI Cost"
              value={`$${stats.total_cost_usd.toFixed(6)}`}
              icon={<Coins size={19} />}
            />

          </div>


          {/* Recent Requests */}

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

              <div>

                <h3 className="font-semibold">
                  Recent AI Requests
                </h3>

                <p className="mt-1 text-xs text-zinc-600">
                  Latest traffic through AegisFlow
                </p>

              </div>

              <Activity
                size={18}
                className="text-violet-300"
              />

            </div>


            {recent_requests.length === 0 ? (

              <div className="px-6 py-16 text-center">

                <Activity
                  size={28}
                  className="mx-auto mb-3 text-zinc-700"
                />

                <p className="text-sm text-zinc-500">
                  No AI requests yet.
                </p>

                <p className="mt-1 text-xs text-zinc-700">
                  Your request activity will appear here.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[800px] text-left">

                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-600">

                      <th className="px-6 py-4">
                        Request
                      </th>

                      <th className="px-6 py-4">
                        Model
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                      <th className="px-6 py-4">
                        Latency
                      </th>

                      <th className="px-6 py-4">
                        Tokens
                      </th>

                      <th className="px-6 py-4">
                        Cost
                      </th>

                    </tr>
                  </thead>


                  <tbody>

                    {recent_requests.map(
                      (request) => (

                        <tr
                          key={request.request_id}
                          className="border-b border-white/5 last:border-0"
                        >

                          <td className="px-6 py-4">

                            <div className="max-w-[180px] truncate font-mono text-xs text-zinc-400">
                              {request.request_id}
                            </div>

                            {request.cache_hit && (
                              <span className="mt-1 inline-block text-[10px] text-violet-300">
                                CACHE HIT
                              </span>
                            )}

                          </td>


                          <td className="px-6 py-4">

                            <div className="text-sm text-zinc-300">
                              {request.model}
                            </div>

                            <div className="text-xs text-zinc-600">
                              {request.provider}
                            </div>

                          </td>


                          <td className="px-6 py-4">

                            <span
                              className={
                                request.status ===
                                "success"
                                  ? "inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300"
                                  : "inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-2.5 py-1 text-xs text-red-300"
                              }
                            >
                              {request.status}
                            </span>

                          </td>


                          <td className="px-6 py-4 text-sm text-zinc-400">

                            {request.latency_ms !==
                            null
                              ? `${request.latency_ms} ms`
                              : "—"}

                          </td>


                          <td className="px-6 py-4 text-sm text-zinc-400">

                            {request.total_tokens ??
                              "—"}

                          </td>


                          <td className="px-6 py-4 text-sm text-zinc-400">

                            {request.cost_usd !==
                            null
                              ? `$${request.cost_usd.toFixed(
                                  6
                                )}`
                              : "—"}

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>


          {/* Footer */}

          <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6 text-xs text-zinc-700">

            <span>
              AegisFlow AI Infrastructure
            </span>

            <span>
              Control plane online
            </span>

          </div>

        </div>

      </main>

    </div>
  );
}


function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-violet-400/20 hover:bg-white/[0.04]">

      <div className="mb-5 flex items-center justify-between">

        <span className="text-sm text-zinc-500">
          {title}
        </span>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-500/10 text-violet-300">
          {icon}
        </div>

      </div>

      <div className="text-2xl font-semibold tracking-tight">
        {value}
      </div>

    </div>
  );
}