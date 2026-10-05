const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

export interface APIKey {
  id: number;
  name: string;
  rate_limit: number;
  monthly_budget_usd: number | null;
  is_active: boolean;
  is_admin: boolean;
}

export interface APIKeyCreateResponse {
  id: number;
  name: string;
  api_key: string;
  rate_limit: number;
  monthly_budget_usd: number | null;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  name: string;
  email: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
}

export interface RequestRecord {
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

export interface ProviderConnectionTestResponse {
  provider: string;
  connected: boolean;
  message: string;
}

export interface ProviderCredential {
  id: number;
  provider: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/* =========================================================
   API ERROR
   ========================================================= */

export class APIError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "APIError";
    this.status = status;
  }
}

/* =========================================================
   HELPERS
   ========================================================= */

function getAccessToken(): string {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new APIError("Authentication required", 401);
  }

  return token;
}

async function parseResponse(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  return {
    detail: text || "Unexpected server response",
  };
}

function throwAPIError(
  response: Response,
  data: any,
  fallbackMessage: string
): never {
  throw new APIError(
    data?.detail || fallbackMessage,
    response.status
  );
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  fallbackMessage = "Request failed"
): Promise<T> {
  const token = getAccessToken();

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

try {
  response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
} catch (error) {
  console.error("AegisFlow API request failed:", error);

  throw new APIError(
    "Unable to reach AegisFlow. Please check your connection and try again.",
    0
  );
}

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await parseResponse(response);

  if (!response.ok) {
  if (response.status === 401) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("aegisflow_api_key");

    window.location.href = "/login";

    throw new APIError(
      "Session expired. Please log in again.",
      401
    );
  }

  throwAPIError(response, data, fallbackMessage);
}

  return data as T;
}

/* =========================================================
   AUTH
   ========================================================= */

export async function signup(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(
    `${API_BASE_URL}/v1/auth/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throwAPIError(
      response,
      data,
      "Unable to create account"
    );
  }

  return data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(
    `${API_BASE_URL}/v1/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throwAPIError(
      response,
      data,
      "Unable to log in"
    );
  }

  return data;
}
export async function forgotPassword(
  email: string
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/v1/auth/forgot-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throwAPIError(
      response,
      data,
      "Unable to process password reset request"
    );
  }

  return data;
}

export async function getCurrentUser(
  token: string
): Promise<UserResponse> {
  const response = await fetch(
    `${API_BASE_URL}/v1/auth/me`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throwAPIError(
      response,
      data,
      "Unable to get current user"
    );
  }

  return data;
}
export async function exchangeOAuthCode(
  code: string
): Promise<AuthResponse> {
  const response = await fetch(
    `${API_BASE_URL}/v1/auth/oauth/exchange`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
      }),
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throwAPIError(
      response,
      data,
      "Unable to complete OAuth login"
    );
  }

  return data;
}

export function getOAuthStartUrl(
  provider: "google" | "github"
): string {
  return `${API_BASE_URL}/v1/auth/${provider}/start`;
}

/* =========================================================
   USER API KEYS
   ========================================================= */

export async function getUserApiKeys(): Promise<APIKey[]> {
  return apiRequest<APIKey[]>(
    "/v1/user/keys",
    { method: "GET" },
    "Unable to load API keys"
  );
}

export async function createUserApiKey(
  payload: {
    name: string;
    rate_limit: number;
    monthly_budget_usd: number | null;
  }
): Promise<APIKeyCreateResponse> {
  return apiRequest<APIKeyCreateResponse>(
    "/v1/user/keys",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "Unable to create API key"
  );
}

export async function revokeUserApiKey(
  keyId: number
): Promise<void> {
  await apiRequest<void>(
    `/v1/user/keys/${keyId}`,
    { method: "DELETE" },
    "Unable to revoke API key"
  );
}

/* =========================================================
   USAGE
   ========================================================= */

export async function getUsage(): Promise<{
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
}> {
  const data = await apiRequest<{
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    cache_hits: number;
    cache_hit_rate: number;
    average_latency_ms: number | null;
    total_prompt_tokens: number;
    total_completion_tokens: number;
    total_tokens: number;
    total_cost_usd: number;
  }>(
    "/v1/user/usage",
    { method: "GET" },
    "Unable to load usage"
  );

  return {
    ...data,
    average_latency_ms: data.average_latency_ms ?? 0,
  };
}

/* =========================================================
   REQUESTS
   ========================================================= */

export async function getRequests(): Promise<RequestRecord[]> {
  return apiRequest<RequestRecord[]>(
    "/v1/user/requests",
    { method: "GET" },
    "Unable to load requests"
  );
}

/* =========================================================
   PROVIDER / BYOK
   ========================================================= */

export async function testProviderConnection(
  provider: string,
  apiKey: string
): Promise<ProviderConnectionTestResponse> {
  return apiRequest<ProviderConnectionTestResponse>(
    "/v1/user/providers/test",
    {
      method: "POST",
      body: JSON.stringify({
        provider,
        api_key: apiKey,
      }),
    },
    "Unable to test provider connection"
  );
}

export async function saveProviderCredential(
  provider: string,
  apiKey: string
): Promise<ProviderCredential> {
  return apiRequest<ProviderCredential>(
    "/v1/user/providers",
    {
      method: "POST",
      body: JSON.stringify({
        provider,
        api_key: apiKey,
      }),
    },
    "Unable to save provider credential"
  );
}

export async function getProviderCredentials(): Promise<
  ProviderCredential[]
> {
  return apiRequest<ProviderCredential[]>(
    "/v1/user/providers",
    { method: "GET" },
    "Unable to load provider credentials"
  );
}

export async function deleteProviderCredential(
  provider: string
): Promise<void> {
  await apiRequest<void>(
    `/v1/user/providers/${provider}`,
    { method: "DELETE" },
    "Unable to remove provider credential"
  );
}
