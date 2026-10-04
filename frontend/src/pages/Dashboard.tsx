import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  Coins,
  Database,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogOut,
  Menu,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

import {
  APIError,
  deleteProviderCredential,
  getProviderCredentials,
  getRequests,
  getUsage,
  saveProviderCredential,
  testProviderConnection,
  type ProviderCredential,
} from "../lib/api";
import APIKeys from "./APIKeys";

interface UsageData {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  cache_hits: number;
  cache_hit_rate: number;
  average_latency_ms: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
}

interface RequestRecord {
  id: number;
  request_id: string;
  prompt: string;
  model: string;
  provider: string;
  response: string | null;
  status: string;
  cache_hit: boolean;
  latency_ms: number | null;
  error_message: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  cost_usd: number | null;
  created_at: string;
}

const emptyUsage: UsageData = {
  total_requests: 0,
  successful_requests: 0,
  failed_requests: 0,
  cache_hits: 0,
  cache_hit_rate: 0,
  average_latency_ms: 0,
  total_prompt_tokens: 0,
  total_completion_tokens: 0,
  total_tokens: 0,
  total_cost_usd: 0,
};

function getUserFriendlyAPIError(
  error: unknown,
  fallback: string
): string {
  if (error instanceof APIError) {
    if (error.status === 401) {
      return "Your session has expired. Please log in again.";
    }

    if (error.status === 403) {
      return "You don't have permission to access this resource.";
    }

    if (error.status >= 500) {
      return "AegisFlow is temporarily unavailable. Please try again.";
    }

    return error.message || fallback;
  }

  if (error instanceof TypeError) {
    return "Unable to connect to AegisFlow. Check that the API is running and try again.";
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  loading = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl"
    >
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm text-zinc-500">{title}</span>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
          {icon}
        </div>
      </div>

      {loading ? (
  <>
    <div className="h-7 w-28 animate-pulse rounded-lg bg-white/[0.06]" />

    <div className="mt-3 h-3 w-24 animate-pulse rounded bg-white/[0.04]" />
  </>
) : (
  <>
    <div className="text-2xl font-semibold tracking-tight text-white">
      {value}
    </div>

    <div className="mt-2 text-xs text-zinc-600">
      {subtitle}
    </div>
  </>
)}
    </motion.div>
  );
}


function RequestsView({
  requests,
  loading,
  error,
  onRetry,
  
}: {
  requests: RequestRecord[];
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  const [selectedRequest, setSelectedRequest] =
    useState<RequestRecord | null>(null);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-violet-300">
            <Activity size={15} />
            Request observability
          </div>

          <h2 className="text-3xl font-semibold tracking-tight">
            AI requests.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Inspect requests flowing through the AegisFlow gateway.
          </p>
        </div>

      </div>

      {error && (
  <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="text-sm text-red-300">
      {error}
    </div>

    <button
      type="button"
      onClick={onRetry}
      disabled={loading}
      className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <RefreshCw
        size={14}
        className={loading ? "animate-spin" : ""}
      />
      Retry
    </button>
  </div>
)}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-white/10 bg-white/[0.02]">
              <tr className="text-xs uppercase tracking-wider text-zinc-600">
                <th className="px-5 py-4">Request</th>
                <th className="px-5 py-4">Model</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Latency</th>
                <th className="px-5 py-4">Tokens</th>
                <th className="px-5 py-4">Cache</th>
                <th className="px-5 py-4">Cost</th>
                <th className="px-5 py-4">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-sm text-zinc-600"
                  >
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
  <tr>
    <td colSpan={8} className="px-5 py-16">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
          <Activity size={24} />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-white">
          No AI requests yet
        </h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
          Your AegisFlow traffic will appear here once your first
          request is processed.
        </p>

        <button
          onClick={() => window.open("/docs", "_blank")}
          className="mt-6 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-2.5 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20"
        >
          View API Docs
        </button>
      </div>
    </td>
  </tr>
) : (
                requests.map((request) => (
                  <tr
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className="cursor-pointer transition hover:bg-white/[0.04]"
                  >
                    <td className="px-5 py-4">
                      <div className="font-mono text-xs text-zinc-300">
                        {request.request_id.slice(0, 12)}...
                      </div>

                      <div className="mt-1 max-w-[220px] truncate text-xs text-zinc-600">
                        {request.prompt}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-sm text-zinc-300">
                        {request.model}
                      </div>

                      <div className="mt-1 text-xs text-zinc-600">
                        {request.provider}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs ${
                          request.status === "success"
                            ? "bg-emerald-400/10 text-emerald-400"
                            : "bg-red-400/10 text-red-400"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-zinc-400">
                      {request.latency_ms !== null
                        ? `${request.latency_ms} ms`
                        : "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-zinc-400">
                      {request.total_tokens?.toLocaleString() ?? "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          request.cache_hit
                            ? "text-violet-300"
                            : "text-zinc-600"
                        }
                      >
                        {request.cache_hit ? "HIT" : "MISS"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-zinc-400">
                      ${(request.cost_usd ?? 0).toFixed(4)}
                    </td>

                    <td className="px-5 py-4 text-xs text-zinc-600">
                      {new Date(request.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0a0b12] p-6 shadow-2xl shadow-black/50"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-violet-300">
                  <Activity size={15} />
                  Request details
                </div>

                <h3 className="text-xl font-semibold text-white">
                  AI request
                </h3>

                <p className="mt-1 break-all font-mono text-xs text-zinc-600">
                  {selectedRequest.request_id}
                </p>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-zinc-500 transition hover:bg-white/[0.04] hover:text-white"
                aria-label="Close request details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="text-xs text-zinc-600">Status</div>
                <div
                  className={`mt-2 text-sm font-medium ${
                    selectedRequest.status === "success"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {selectedRequest.status}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="text-xs text-zinc-600">Model</div>
                <div className="mt-2 break-all text-sm text-zinc-300">
                  {selectedRequest.model}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="text-xs text-zinc-600">Provider</div>
                <div className="mt-2 text-sm text-zinc-300">
                  {selectedRequest.provider}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="text-xs text-zinc-600">Latency</div>
                <div className="mt-2 text-sm text-zinc-300">
                  {selectedRequest.latency_ms !== null
                    ? `${selectedRequest.latency_ms} ms`
                    : "—"}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="text-xs text-zinc-600">Prompt tokens</div>
                <div className="mt-2 text-sm text-zinc-300">
                  {selectedRequest.prompt_tokens?.toLocaleString() ?? "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="text-xs text-zinc-600">Completion tokens</div>
                <div className="mt-2 text-sm text-zinc-300">
                  {selectedRequest.completion_tokens?.toLocaleString() ?? "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="text-xs text-zinc-600">Total tokens</div>
                <div className="mt-2 text-sm text-zinc-300">
                  {selectedRequest.total_tokens?.toLocaleString() ?? "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="text-xs text-zinc-600">Cost</div>
                <div className="mt-2 text-sm text-zinc-300">
                  ${(selectedRequest.cost_usd ?? 0).toFixed(4)}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="text-xs text-zinc-600">Cache</div>
                <div className="mt-2 text-sm text-zinc-300">
                  {selectedRequest.cache_hit ? "HIT" : "MISS"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="text-xs text-zinc-600">Created</div>
                <div className="mt-2 text-sm text-zinc-300">
                  {new Date(selectedRequest.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-2 text-xs text-zinc-600">Prompt</div>
              <div className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">
                {selectedRequest.prompt}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-2 text-xs text-zinc-600">Response</div>
              <div className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">
                {selectedRequest.response || "No response recorded."}
              </div>
            </div>

            {selectedRequest.error_message && (
              <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-5">
                <div className="mb-2 text-xs text-red-300">Error</div>
                <div className="whitespace-pre-wrap break-words text-sm leading-6 text-red-200">
                  {selectedRequest.error_message}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}


function UsageView({
  usage,
  loading,
  error,
}: {
  usage: UsageData;
  loading: boolean;
  error: string;
}) {
  const successRate =
    usage.total_requests > 0
      ? (usage.successful_requests / usage.total_requests) * 100
      : 0;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-zinc-500">
          Loading usage data...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-violet-300">
            <TrendingUp size={15} />
            Usage analytics
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">
            AI usage.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Track requests, tokens, latency, caching, and AI spend
            across your AegisFlow traffic.
          </p>
        </div>

      </div>

      {error && (
  <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <div className="text-sm font-medium text-red-300">
        Unable to load dashboard data
      </div>

      <p className="mt-1 text-xs leading-5 text-red-300/70">
        {error}
      </p>
    </div>

    <button
      onClick={() => {
  window.location.reload();
}}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <RefreshCw
        size={14}
        className={loading ? "animate-spin" : ""}
      />
      Retry
    </button>
  </div>
)}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={usage.total_requests.toLocaleString()}
          subtitle={`${usage.successful_requests} successful`}
          icon={<Activity size={18} />}
          loading={loading}
        />
        <StatCard
          title="Total Tokens"
          value={usage.total_tokens.toLocaleString()}
          subtitle={`${usage.total_prompt_tokens.toLocaleString()} prompt tokens`}
          icon={<Coins size={18} />}
        />
        <StatCard
          title="Average Latency"
          value={`${Math.round(usage.average_latency_ms)} ms`}
          subtitle="Average response time"
          icon={<Clock3 size={18} />}
          loading={loading}
        />
        <StatCard
          title="Total Cost"
          value={`$${usage.total_cost_usd.toFixed(4)}`}
          subtitle="Tracked AI spend"
          icon={<TrendingUp size={18} />}
           loading={loading}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
          <div className="text-sm text-zinc-500">Request success rate</div>
          {loading ? (
  <div className="mt-3 h-9 w-24 animate-pulse rounded-lg bg-white/[0.06]" />
) : (
  <div className="mt-3 text-3xl font-semibold">
    {successRate.toFixed(1)}%
  </div>
)}
          {loading ? (
  <div className="mt-4 h-2 animate-pulse rounded-full bg-white/[0.05]" />
) : (
  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
    <div
      className="h-full rounded-full bg-emerald-400 transition-all"
      style={{
        width: `${Math.min(successRate, 100)}%`,
      }}
    />
  </div>
)}
          <div className="mt-4 flex justify-between text-xs">
            <span className="text-emerald-400">
              {usage.successful_requests} successful
            </span>
            <span className="text-red-400">
              {usage.failed_requests} failed
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
          <div className="text-sm text-zinc-500">Cache performance</div>
          <div className="mt-3 text-4xl font-semibold">
            {usage.cache_hit_rate.toFixed(1)}%
          </div>
          <p className="mt-3 text-sm text-zinc-500">
            {usage.cache_hits.toLocaleString()} requests served from cache.
          </p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-violet-400 transition-all"
              style={{ width: `${Math.min(usage.cache_hit_rate, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-6">
        <h3 className="font-semibold">Token usage</h3>
        <p className="mt-1 text-xs text-zinc-600">
          Token consumption across your AI traffic.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div>
            <div className="text-xs text-zinc-600">Prompt tokens</div>
            <div className="mt-2 text-2xl font-semibold">
              {usage.total_prompt_tokens.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-600">Completion tokens</div>
            <div className="mt-2 text-2xl font-semibold">
              {usage.total_completion_tokens.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-600">Total tokens</div>
            <div className="mt-2 text-2xl font-semibold text-violet-300">
              {usage.total_tokens.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
function CacheView({
  usage,
  loading,
  error,
}: {
  usage: UsageData;
  loading: boolean;
  error: string;
}) {
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-zinc-500">
          Loading cache data...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-sm text-violet-300">
          <Database size={15} />
          Cache analytics
        </div>

        <h2 className="text-3xl font-semibold tracking-tight">
          Redis cache.
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Monitor how AegisFlow reduces duplicate AI requests using
          response caching.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Cache Hits"
          value={usage.cache_hits.toLocaleString()}
          subtitle="Requests served from cache"
          icon={<Database size={18} />}
        />

        <StatCard
          title="Cache Hit Rate"
          value={`${usage.cache_hit_rate.toFixed(1)}%`}
          subtitle="Requests served without provider call"
          icon={<TrendingUp size={18} />}
        />

        <StatCard
          title="Total Requests"
          value={usage.total_requests.toLocaleString()}
          subtitle="Requests processed"
          icon={<Activity size={18} />}
        />

        <StatCard
          title="Provider Calls"
          value={Math.max(
            usage.total_requests - usage.cache_hits,
            0
          ).toLocaleString()}
          subtitle="Requests that reached AI provider"
          icon={<Zap size={18} />}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
          <div className="text-sm text-zinc-500">
            Cache efficiency
          </div>

          <div className="mt-3 text-4xl font-semibold">
            {usage.cache_hit_rate.toFixed(1)}%
          </div>

          <p className="mt-3 text-sm text-zinc-500">
            {usage.cache_hits.toLocaleString()} of{" "}
            {usage.total_requests.toLocaleString()} requests
            were served from cache.
          </p>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-violet-400 transition-all"
              style={{
                width: `${Math.min(
                  usage.cache_hit_rate,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
          <div className="text-sm text-zinc-500">
            Cache configuration
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-sm text-zinc-400">
                Storage
              </span>

              <span className="text-sm text-violet-300">
                Redis
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-sm text-zinc-400">
                TTL
              </span>

              <span className="text-sm text-zinc-200">
                300 seconds
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">
                Status
              </span>

              <span className="flex items-center gap-2 text-sm text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-6">
        <h3 className="font-semibold">
          How AegisFlow caching works
        </h3>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          AegisFlow creates a deterministic cache key from the AI
          model and normalized prompt. If a matching response exists
          in Redis, the cached response is returned instead of making
          another provider request.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="text-xs text-zinc-600">
              01
            </div>

            <div className="mt-2 text-sm font-medium">
              Request
            </div>

            <p className="mt-2 text-xs leading-5 text-zinc-600">
              Client sends an AI prompt through the gateway.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="text-xs text-zinc-600">
              02
            </div>

            <div className="mt-2 text-sm font-medium">
              Redis lookup
            </div>

            <p className="mt-2 text-xs leading-5 text-zinc-600">
              AegisFlow checks whether a matching response exists.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="text-xs text-zinc-600">
              03
            </div>

            <div className="mt-2 text-sm font-medium">
              HIT or MISS
            </div>

            <p className="mt-2 text-xs leading-5 text-zinc-600">
              HIT returns cached data; MISS calls the AI provider
              and stores the response.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}


function ProvidersView({
  providers,
  loading,
  error,
  success,
  apiKey,
  showApiKey,
  testing,
  saving,
  onRetry,
  removing,
  onApiKeyChange,
  onToggleApiKey,
  onTest,
  onSave,
  onRemove,
}: {
  providers: ProviderCredential[];
  loading: boolean;
  error: string;
  success: string;
   onRetry: () => void;
  apiKey: string;
  showApiKey: boolean;
  testing: boolean;
  saving: boolean;
  removing: string;
  onApiKeyChange: (value: string) => void;
  onToggleApiKey: () => void;
  onTest: () => void;
  onSave: () => void;
  onRemove: (provider: string) => void;
}) {
  const openRouterCredential = providers.find(
    (provider) =>
      provider.provider.toLowerCase() === "openrouter" &&
      provider.is_active
  );

  const isBusy = testing || saving;

  return (
    <>
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-sm text-violet-300">
          <ShieldCheck size={15} />
          Provider connections
        </div>

        <h2 className="text-3xl font-semibold tracking-tight">
          Your providers.
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Connect your own AI provider credentials and route your traffic
          through the AegisFlow control plane.
        </p>
      </div>

      {error && (
  <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="text-sm text-red-300">
      {error}
    </div>

    <button
      type="button"
      onClick={onRetry}
      disabled={loading}
      className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <RefreshCw
        size={14}
        className={loading ? "animate-spin" : ""}
      />
      Retry
    </button>
  </div>
)}

      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <Loader2 size={17} className="animate-spin" />
            Loading provider connections...
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                  <Sparkles size={22} className="text-violet-300" />
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-600">
                    Provider
                  </div>
                  <h3 className="mt-1 text-xl font-semibold text-white">
                    OpenRouter
                  </h3>
                </div>
              </div>

              {openRouterCredential ? (
                <span className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Connected
                </span>
              ) : (
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-500">
                  Not connected
                </span>
              )}
            </div>

            {openRouterCredential ? (
              <div className="mt-8">
                <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                  <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    OpenRouter credential active
                  </div>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Your provider credential is encrypted and associated with
                    your AegisFlow user account. The secret key is never
                    displayed here.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <div className="text-xs text-zinc-600">
                        Credential storage
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-zinc-300">
                        <ShieldCheck size={15} className="text-violet-300" />
                        Encrypted
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <div className="text-xs text-zinc-600">
                        Routing
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-zinc-300">
                        <CheckCircle2 size={15} className="text-emerald-400" />
                        BYOK enabled
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-white/5 pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs text-zinc-600">
                          Last updated
                        </div>
                        <div className="mt-1 text-sm text-zinc-400">
                          {new Date(
                            openRouterCredential.updated_at
                          ).toLocaleString()}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onRemove(openRouterCredential.provider)
                        }
                        disabled={
                          removing === openRouterCredential.provider
                        }
                        className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/5 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {removing === openRouterCredential.provider ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs text-zinc-600">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Applications can now use your OpenRouter credential through
                  AegisFlow.
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                  <KeyRound size={21} className="text-zinc-500" />
                </div>

                <h3 className="mt-4 font-medium text-white">
                  No OpenRouter credential connected
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                  Add your OpenRouter API key to enable BYOK routing for your
                  AegisFlow traffic.
                </p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                <KeyRound size={19} className="text-violet-300" />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  {openRouterCredential
                    ? "Update OpenRouter"
                    : "Connect OpenRouter"}
                </h3>
                <p className="mt-1 text-xs text-zinc-600">
                  Bring your own provider key
                </p>
              </div>
            </div>

            <div className="mt-7">
              <label className="text-sm text-zinc-400">Provider</label>

              <div className="mt-2 flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-violet-400 shadow-[0_0_14px_rgba(167,139,250,0.7)]" />
                  <span className="text-sm text-zinc-200">
                    OpenRouter
                  </span>
                </div>

                <span className="text-xs text-zinc-600">AI provider</span>
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="openrouter-api-key"
                className="text-sm text-zinc-400"
              >
                OpenRouter API key
              </label>

              <div className="relative mt-2">
                <input
                  id="openrouter-api-key"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(event) => onApiKeyChange(event.target.value)}
                  placeholder="sk-or-v1-••••••••••••••••"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 pr-12 font-mono text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/10"
                />

                <button
                  type="button"
                  onClick={onToggleApiKey}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 transition hover:text-zinc-300"
                  aria-label={
                    showApiKey ? "Hide API key" : "Show API key"
                  }
                >
                  {showApiKey ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs leading-5 text-zinc-600">
                Your key is sent over the authenticated connection, validated
                by AegisFlow, and stored encrypted. It is not shown after
                saving.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onTest}
                disabled={!apiKey.trim() || isBusy}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-medium text-zinc-200 transition hover:border-violet-400/30 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {testing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Test connection
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onSave}
                disabled={!apiKey.trim() || isBusy}
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    {openRouterCredential ? "Update key" : "Save key"}
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <ShieldCheck size={14} className="text-violet-300" />
                Security
              </div>

              <div className="mt-3 space-y-2 text-xs text-zinc-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  Credential encrypted at rest
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  Isolated per user
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  Secret never returned by the API
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [usage, setUsage] = useState<UsageData>(emptyUsage);
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestsError, setRequestsError] = useState("");
  const [providers, setProviders] = useState<ProviderCredential[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState("");
  const [providersSuccess, setProvidersSuccess] = useState("");
  const [providerApiKey, setProviderApiKey] = useState("");
  const [showProviderApiKey, setShowProviderApiKey] = useState(false);
  const [testingProvider, setTestingProvider] = useState(false);
  const [savingProvider, setSavingProvider] = useState(false);
  const [removingProvider, setRemovingProvider] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeView, setActiveView] = useState<
    "overview" | "requests" | "usage" | "api-keys" | "cache" | "providers"
  >("overview");

  async function loadUsage() {
  try {
    setLoading(true);
    setError("");

    const data = await getUsage();
    setUsage(data);
  } catch (err) {
    setError(
      getUserFriendlyAPIError(
        err,
        "Unable to load usage data."
      )
    );
  } finally {
    setLoading(false);
  }
}

  async function loadRequests() {
  try {
    setRequestsLoading(true);
    setRequestsError("");

    const data = await getRequests();
    setRequests(data);
  } catch (err) {
    setRequestsError(
      getUserFriendlyAPIError(
        err,
        "Unable to load request data."
      )
    );
  } finally {
    setRequestsLoading(false);
  }
}

  async function loadProviders() {
  try {
    setProvidersLoading(true);
    setProvidersError("");

    const data = await getProviderCredentials();
    setProviders(data);
  } catch (err) {
    setProvidersError(
      getUserFriendlyAPIError(
        err,
        "Unable to load provider connections."
      )
    );
  } finally {
    setProvidersLoading(false);
  }
}

  async function handleTestProvider() {
    if (!providerApiKey.trim()) {
      setProvidersError("Enter an OpenRouter API key first.");
      setProvidersSuccess("");
      return;
    }

    try {
      setTestingProvider(true);
      setProvidersError("");
      setProvidersSuccess("");

      const result = await testProviderConnection(
        "openrouter",
        providerApiKey.trim()
      );

      if (!result.connected) {
        setProvidersError(result.message);
        return;
      }

      setProvidersSuccess(
        "OpenRouter connection verified successfully."
      );
    } catch (err) {
      console.error(err);
      setProvidersError(
        err instanceof Error
          ? err.message
          : "Unable to test provider connection."
      );
    } finally {
      setTestingProvider(false);
    }
  }

  async function handleSaveProvider() {
    if (!providerApiKey.trim()) {
      setProvidersError("Enter an OpenRouter API key first.");
      setProvidersSuccess("");
      return;
    }

    try {
      setSavingProvider(true);
      setProvidersError("");
      setProvidersSuccess("");

      await saveProviderCredential(
        "openrouter",
        providerApiKey.trim()
      );

      setProviderApiKey("");
      setShowProviderApiKey(false);
      await loadProviders();

      setProvidersSuccess(
        "OpenRouter credential saved securely."
      );
    } catch (err) {
      console.error(err);
      setProvidersError(
        err instanceof Error
          ? err.message
          : "Unable to save provider credential."
      );
    } finally {
      setSavingProvider(false);
    }
  }

  async function handleRemoveProvider(provider: string) {
    const confirmed = window.confirm(
      `Remove your ${provider} credential from AegisFlow?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingProvider(provider);
      setProvidersError("");
      setProvidersSuccess("");

      await deleteProviderCredential(provider);
      await loadProviders();

      setProvidersSuccess(`${provider} credential removed.`);
    } catch (err) {
      console.error(err);
      setProvidersError(
        err instanceof Error
          ? err.message
          : "Unable to remove provider credential."
      );
    } finally {
      setRemovingProvider("");
    }
  }

  useEffect(() => {
    loadUsage();
    loadRequests();
    loadProviders();
  }, []);

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const successRate =
    usage.total_requests > 0
      ? (usage.successful_requests / usage.total_requests) * 100
      : 0;

  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      {/* Background */}
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

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-[#08090f]/95 p-5 backdrop-blur-xl transition-transform lg:static lg:translate-x-0 ${
            mobileMenu
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="mb-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
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

              <button
                onClick={() => setMobileMenu(false)}
                className="text-zinc-500 lg:hidden"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <button
                onClick={() => {
                  setActiveView("overview");
                  setMobileMenu(false);
                }}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm transition ${
                  activeView === "overview"
                    ? "border border-violet-400/20 bg-violet-500/10 text-violet-200"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} />
                  Overview
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveView("requests");
                  setMobileMenu(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  activeView === "requests"
                    ? "border border-violet-400/20 bg-violet-500/10 text-violet-200"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <Activity size={18} />
                Requests
              </button>

              <button
                onClick={() => {
                  setActiveView("api-keys");
                  setMobileMenu(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  activeView === "api-keys"
                    ? "border border-violet-400/20 bg-violet-500/10 text-violet-200"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <KeyRound size={18} />
                API Keys
              </button>
              <button
  onClick={() => {
    setActiveView("usage");
    setMobileMenu(false);
  }}
  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
    activeView === "usage"
      ? "border border-violet-400/20 bg-violet-500/10 text-violet-200"
      : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
  }`}
>
  <TrendingUp size={18} />
  Usage
</button>

              <button
  onClick={() => {
    setActiveView("cache");
    setMobileMenu(false);
  }}
  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
    activeView === "cache"
      ? "border border-violet-400/20 bg-violet-500/10 text-violet-200"
      : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
  }`}
>
  <Database size={18} />
  Cache
</button>

              <button
                onClick={() => {
                  setActiveView("providers");
                  setProvidersSuccess("");
                  setProvidersError("");
                  setMobileMenu(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  activeView === "providers"
                    ? "border border-violet-400/20 bg-violet-500/10 text-violet-200"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <ShieldCheck size={18} />
                Providers
              </button>
            </nav>

            {/* Bottom */}
            <div className="mt-auto">
              <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <Sparkles
                    size={15}
                    className="text-violet-300"
                  />
                  System status
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Operational
                </div>
              </div>

              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut size={18} />
                Log out
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <section className="flex-1">
          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-white/10 px-6 lg:px-10">
            <button
              onClick={() => setMobileMenu(true)}
              className="text-zinc-400 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div className="hidden lg:block">
              <p className="text-sm text-zinc-500">
                AI infrastructure
              </p>

              <h1 className="text-lg font-semibold">
                {activeView === "requests"
                  ? "Requests"
                  : activeView === "usage"
                    ? "Usage"
                    : activeView === "api-keys"
                      ? "API Keys"
                      :activeView === "cache"
                        ? "Cache"
                        : activeView === "providers"
                          ? "Providers"
                          : "Overview"}
              </h1>
            </div>

            {activeView !== "api-keys" && (
  <button
    onClick={() => {
      if (activeView === "requests") {
        loadRequests();
      } else {
        loadUsage();
      }
    }}
    disabled={
      activeView === "requests"
        ? requestsLoading
        : loading
    }
    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm text-zinc-300 transition hover:border-violet-400/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
  >
    <RefreshCw
      size={15}
      className={
        activeView === "requests"
          ? requestsLoading
            ? "animate-spin"
            : ""
          : loading
            ? "animate-spin"
            : ""
      }
    />

    {activeView === "requests"
      ? requestsLoading
        ? "Refreshing..."
        : "Refresh"
      : loading
        ? "Refreshing..."
        : "Refresh"}
  </button>
)}
          </header>

          {/* Content */}
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
            {activeView === "requests" ? (
  <RequestsView
    requests={requests}
    loading={requestsLoading}
    error={requestsError}
    onRetry={loadRequests}
  />
) : activeView === "usage" ? (
  <UsageView
    usage={usage}
    loading={loading}
    error={error}
  />
) : activeView === "api-keys" ? (
  <APIKeys />
) : activeView === "cache" ? (
  <CacheView
    usage={usage}
    loading={loading}
    error={error}
  />
) : activeView === "providers" ? (
  <ProvidersView
    providers={providers}
    loading={providersLoading}
    error={providersError}
    success={providersSuccess}
      onRetry={loadProviders}
    apiKey={providerApiKey}
    showApiKey={showProviderApiKey}
    testing={testingProvider}
    saving={savingProvider}
    removing={removingProvider}
    onApiKeyChange={setProviderApiKey}
    onToggleApiKey={() =>
      setShowProviderApiKey((current) => !current)
    }
    onTest={handleTestProvider}
    onSave={handleSaveProvider}
    onRemove={handleRemoveProvider}
  />
) : (
              <>
                {/* Hero */}
            <div className="mb-8">
              <div className="mb-2 flex items-center gap-2 text-sm text-violet-300">
                <Sparkles size={15} />
                Welcome to AegisFlow
              </div>

              <h2 className="text-3xl font-semibold tracking-tight">
                AI traffic at a glance.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Monitor requests, latency, token usage, cost,
                and caching from one control plane.
              </p>
            </div>

            {error && (
  <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="text-sm text-red-300">
      {error}
    </div>

    <button
      type="button"
      onClick={loadUsage}
      disabled={loading}
      className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <RefreshCw
        size={14}
        className={loading ? "animate-spin" : ""}
      />
      Retry
    </button>
  </div>
)}
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Requests"
                value={usage.total_requests.toLocaleString()}
                subtitle={`${usage.successful_requests} successful`}
                icon={<Activity size={18} />}
              />

              <StatCard
                title="Average Latency"
                value={`${Math.round(
                  usage.average_latency_ms
                )} ms`}
                subtitle="Average response time"
                icon={<Clock3 size={18} />}
              />

              <StatCard
                title="Total Tokens"
                value={usage.total_tokens.toLocaleString()}
                subtitle={`${usage.total_prompt_tokens.toLocaleString()} prompt tokens`}
                icon={<Coins size={18} />}
              />

              <StatCard
                title="Total Cost"
                value={`$${usage.total_cost_usd.toFixed(4)}`}
                subtitle="Tracked AI spend"
                icon={<TrendingUp size={18} />}
              />
            </div>

            {/* Secondary stats */}
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="text-sm text-zinc-500">
                  Success Rate
                </div>

                <div className="mt-3 text-3xl font-semibold">
                  {successRate.toFixed(1)}%
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{
                      width: `${Math.min(successRate, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="text-sm text-zinc-500">
                  Cache Hit Rate
                </div>

                {loading ? (
  <div className="mt-3 h-9 w-24 animate-pulse rounded-lg bg-white/[0.06]" />
) : (
  <div className="mt-3 text-3xl font-semibold">
    {usage.cache_hit_rate.toFixed(1)}%
  </div>
)}

                <p className="mt-2 text-xs text-zinc-600">
                  {usage.cache_hits} requests served from cache
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="text-sm text-zinc-500">
                  Failed Requests
                </div>

                <div className="mt-3 text-3xl font-semibold">
                  {usage.failed_requests}
                </div>

                <p className="mt-2 text-xs text-zinc-600">
                  Provider or gateway failures
                </p>
              </div>
            </div>

            {/* Request overview */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    Request Overview
                  </h3>

                  <p className="mt-1 text-xs text-zinc-600">
                    Current AegisFlow usage statistics
                  </p>
                </div>

                <Activity
                  size={20}
                  className="text-violet-300"
                />
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                <div>
                  <div className="text-xs text-zinc-600">
                    Successful
                  </div>

                  <div className="mt-2 text-2xl font-semibold text-emerald-400">
                    {usage.successful_requests}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-zinc-600">
                    Failed
                  </div>

                  <div className="mt-2 text-2xl font-semibold text-red-400">
                    {usage.failed_requests}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-zinc-600">
                    Cache Hits
                  </div>

                  <div className="mt-2 text-2xl font-semibold text-violet-300">
                    {usage.cache_hits}
                  </div>
                </div>
              </div>
            </div>
              </>
            )}

            {/* Footer */}
            <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-zinc-700 sm:flex-row sm:items-center sm:justify-between">
              <span>
                AegisFlow · AI Gateway & Infrastructure Layer
              </span>

              <span>
                Protected by AegisFlow infrastructure.
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}