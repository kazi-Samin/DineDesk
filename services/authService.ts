import { AuthResponse, AuthUser, LoginCredentials, RegisterCredentials } from "@/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://dine-desk-backend.vercel.app/api/v1";

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
    return JSON.parse(userJson) as AuthUser;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: AuthUser): void => {
  if (typeof window === "undefined") return;
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

  const data = await response.json();

  if (response.ok && data.success && data.token) {
    setStoredToken(data.token);
    if (data.data) {
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

  const data = await response.json();
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

  const data = await response.json();
  if (response.ok && data.success && data.data) {
    setStoredUser(data.data);
  }
  return data;
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
