const API_BASE_URL = "http://127.0.0.1:8000";

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

function getAccessToken(): string {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Authentication required");
  }

  return token;
}

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to create account"
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to log in"
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to get current user"
    );
  }

  return data;
}

export async function getUserApiKeys(): Promise<APIKey[]> {
  const token = getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/v1/user/keys`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to load API keys"
    );
  }

  return data;
}

export async function createUserApiKey(
  payload: {
    name: string;
    rate_limit: number;
    monthly_budget_usd: number | null;
  }
): Promise<APIKeyCreateResponse> {
  const token = getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/v1/user/keys`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to create API key"
    );
  }

  return data;
}

export async function revokeUserApiKey(
  keyId: number
): Promise<void> {
  const token = getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/v1/user/keys/${keyId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to revoke API key"
    );
  }
}

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
  const token = getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/v1/user/usage`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to load usage"
    );
  }

  return {
    ...data,
    average_latency_ms: data.average_latency_ms ?? 0,
  };
}

export async function getRequests(): Promise<
  RequestRecord[]
> {
  const token = getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/v1/user/requests`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to load requests"
    );
  }

  return data;
}
