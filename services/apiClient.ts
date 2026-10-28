import { getStoredToken, normalizeApiUrl } from "./authService";

// Fallback to localhost:5000/api/v1 if env variable is unset or points to Vercel during local dev
const RAW_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1`
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const API_BASE_URL = normalizeApiUrl(RAW_URL);

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

function resolveToken(): string {
  const token = getStoredToken();
  if (token && token.trim() !== "") return token.trim();

  if (typeof window !== "undefined") {
    const betterAuthToken = localStorage.getItem("dinedesk_auth_token");
    if (betterAuthToken) return betterAuthToken.trim();

    const match = document.cookie.match(
      /(?:^|;\s*)(?:dinedesk_auth_token|better-auth\.session_token|token|auth_token|accessToken)=([^;]+)/
    );
    if (match && match[1]) return match[1].trim();
  }
  return "";
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...customConfig } = options;
  const token = resolveToken();

  let url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(token
      ? {
        Authorization: `Bearer ${token}`,
        "x-session-token": token,
        "better-auth-session-token": token,
      }
      : {}),
    ...headers,
  };

  const response = await fetch(url, {
    headers: defaultHeaders,
    credentials: "include",
    ...customConfig,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      data.message || data.error || `API request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}