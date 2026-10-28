import { AuthResponse, AuthUser, LoginCredentials, RegisterCredentials } from "@/types/auth";

export const normalizeApiUrl = (rawUrl?: string): string => {
  let url = (rawUrl || "https://dine-desk-backend.vercel.app/api/v1").trim();
  url = url.replace(/\/+$/, "");
  if (!url.endsWith("/api/v1")) {
    url = `${url}/api/v1`;
  }
  return url;
};

const API_BASE_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Backend returned unexpected response (${response.status}). Please verify API URL.`
    );
  }
}

const TOKEN_KEY = "dinedesk_auth_token";
const USER_KEY = "dinedesk_auth_user";

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  // Also store in document.cookie so server / middleware can access if needed
  document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
};

export const clearStoredAuth = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "role=; path=/; max-age=0; SameSite=Lax";
};

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    const user = JSON.parse(userJson) as AuthUser;
    if (user && user.email && !user.avatarUrl) {
      const cachedAvatar = localStorage.getItem(`dinedesk_avatar_${user.email.toLowerCase()}`);
      if (cachedAvatar) {
        user.avatarUrl = cachedAvatar;
      }
    }
    return user;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: AuthUser): void => {
  if (typeof window === "undefined") return;

  // Preserve user custom uploaded avatar across logins
  if (user.email) {
    const avatarKey = `dinedesk_avatar_${user.email.toLowerCase()}`;
    if (user.avatarUrl) {
      localStorage.setItem(avatarKey, user.avatarUrl);
    } else {
      const cachedAvatar = localStorage.getItem(avatarKey);
      if (cachedAvatar) {
        user.avatarUrl = cachedAvatar;
      }
    }
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.cookie = `role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
};

export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  const data = await parseJsonResponse<AuthResponse>(response);

  if (response.ok && data.success && data.token) {
    setStoredToken(data.token);
    if (data.data) {
      // Merge cached avatar before saving
      if (!data.data.avatarUrl && data.data.email) {
        const cached = localStorage.getItem(`dinedesk_avatar_${data.data.email.toLowerCase()}`);
        if (cached) {
          data.data.avatarUrl = cached;
        }
      }
      setStoredUser(data.data);
    }
  }

  return data;
}

export async function registerApi(credentials: RegisterCredentials): Promise<AuthResponse> {
  const payload = {
    name: credentials.name,
    email: credentials.email,
    password: credentials.password,
    role: credentials.role || "USER",
    ...(credentials.phone ? { phone: credentials.phone } : {}),
  };

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse<AuthResponse>(response);
  return data;
}

export async function getMeApi(): Promise<{ success: boolean; data?: AuthUser; message?: string }> {
  const token = getStoredToken();
  if (!token) {
    return { success: false, message: "No token available" };
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  const data = await parseJsonResponse<{ success: boolean; data?: AuthUser; message?: string }>(response);
  if (response.ok && data.success && data.data) {
    setStoredUser(data.data);
  }
  return data;
}

/**
 * Called after Google/social OAuth - exchanges the OAuth user info for a backend JWT.
 * The backend creates or finds the user by email and returns its own JWT token.
 */
export async function socialLoginApi(userData: {
  email: string;
  name: string;
  googleId?: string;
  avatarUrl?: string;
}): Promise<AuthResponse> {
  try {
    // 1. Direct Next.js internal API route: /api/auth/google-sync
    // This runs server-side in Next.js (both local and deployed), queries Neon Postgres directly,
    // ensures the User row exists, and signs a genuine HS256 JWT using JWT_SECRET.
    try {
      const syncRes = await fetch("/api/auth/google-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name,
          googleId: userData.googleId,
          avatarUrl: userData.avatarUrl,
        }),
      });

      if (syncRes.ok) {
        const syncData = await parseJsonResponse<AuthResponse>(syncRes);
        if (syncData.success && syncData.token) {
          setStoredToken(syncData.token);
          if (syncData.data) {
            setStoredUser(syncData.data);
          }
          return syncData;
        }
      }
    } catch (syncErr) {
      console.warn("/api/auth/google-sync failed, falling back to backend endpoints:", syncErr);
    }

    // 2. Try /auth/social-login endpoint first
    const response = await fetch(`${API_BASE_URL}/auth/social-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: userData.email,
        name: userData.name,
        googleId: userData.googleId,
        avatarUrl: userData.avatarUrl,
        provider: "google",
      }),
    });

    if (response.ok) {
      const data = await parseJsonResponse<AuthResponse>(response);
      if (data.success && data.token) {
        setStoredToken(data.token);
        if (data.data) setStoredUser(data.data);
        return data;
      }
    }

    // 3. Fallback: try /auth/google endpoint
    const res2 = await fetch(`${API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: userData.email,
        name: userData.name,
        googleId: userData.googleId,
        avatarUrl: userData.avatarUrl,
      }),
    });

    if (res2.ok) {
      const data2 = await parseJsonResponse<AuthResponse>(res2);
      if (data2.success && data2.token) {
        setStoredToken(data2.token);
        if (data2.data) setStoredUser(data2.data);
        return data2;
      }
    }

    // 4. Fallback: try /auth/oauth-callback
    const res3 = await fetch(`${API_BASE_URL}/auth/oauth-callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: userData.email,
        name: userData.name,
        provider: "google",
        providerId: userData.googleId,
        avatarUrl: userData.avatarUrl,
      }),
    });

    if (res3.ok) {
      const data3 = await parseJsonResponse<AuthResponse>(res3);
      if (data3.success && data3.token) {
        setStoredToken(data3.token);
        if (data3.data) setStoredUser(data3.data);
        return data3;
      }
    }

    return { success: false, message: "Backend social login endpoint not available" };
  } catch (err) {
    console.error("socialLoginApi error:", err);
    return { success: false, message: "Social login backend sync failed" };
  }
}

export async function logoutApi(): Promise<{ success: boolean; message?: string }> {
  const token = getStoredToken();
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
    });
  } catch {
    // If network fails during logout, still proceed with client cleanup
  } finally {
    clearStoredAuth();
  }

  return { success: true, message: "Logged out successfully" };
}
