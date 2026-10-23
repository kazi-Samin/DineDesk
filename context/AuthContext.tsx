"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthResponse, AuthUser, LoginCredentials, RegisterCredentials, UserRole } from "@/types/auth";
import {
  getMeApi,
  getStoredToken,
  getStoredUser,
  loginApi,
  logoutApi,
  registerApi,
  setStoredToken,
  setStoredUser,
  clearStoredAuth,
} from "@/services/authService";
import { authClient } from "@/lib/auth-client";
import { getCustomerProfile, saveCustomerProfile } from "@/services/mockCustomerProfileService";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserAvatar: (newAvatarUrl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to enrich user with dynamic avatar fallback if missing
  const enrichUserWithAvatar = (userData: AuthUser): AuthUser => {
    if (!userData.avatarUrl || userData.avatarUrl.trim() === "") {
      const nameSeed = userData.name || userData.email || "User";
      userData.avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameSeed)}`;
    }
    return userData;
  };

  // Initialize auth state on client mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const storedToken = getStoredToken();
        const storedUser = getStoredUser();

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(enrichUserWithAvatar(storedUser));
          }

          if (storedToken.startsWith("better_auth_")) {
            // Better-Auth OAuth Session - verify with better-auth client
            try {
              const sessionRes = await authClient.getSession();
              if (isMounted) {
                if (sessionRes?.data?.user) {
                  const bUser = sessionRes.data.user;
                  const enriched = enrichUserWithAvatar({
                    id: bUser.id,
                    name: bUser.name || bUser.email?.split("@")[0] || "Diner",
                    email: bUser.email,
                    role: ((bUser as unknown as { role?: UserRole }).role) || "USER",
                    avatarUrl: bUser.image || storedUser?.avatarUrl || "",
                    createdAt: storedUser?.createdAt || new Date().toISOString(),
                  });
                  setUser(enriched);
                  setStoredUser(enriched);
                } else if (!storedUser) {
                  clearStoredAuth();
                  setToken(null);
                  setUser(null);
                }
              }
            } catch (sessionErr) {
              console.error("Better-Auth session verification failed:", sessionErr);
            }
          } else {
            // Verify and refresh with live backend /api/v1/auth/me
            const meResult = await getMeApi();
            if (isMounted) {
              if (meResult.success && meResult.data) {
                const meUser = enrichUserWithAvatar(meResult.data);
                setUser(meUser);
                setStoredUser(meUser);
              } else if (!storedUser) {
                // Token invalid or expired
                clearStoredAuth();
                localStorage.removeItem("dinedesk_customer_profile");
                setToken(null);
                setUser(null);
              }
            }
          }
        } else {
          // No stored token in localStorage - check if arriving via Better-Auth OAuth (e.g. Google)
          try {
            const sessionRes = await authClient.getSession();
            if (isMounted && sessionRes?.data?.user) {
              const bUser = sessionRes.data.user;
              const bSession = sessionRes.data.session;
              const gToken = `better_auth_${bSession?.token || bSession?.id || bUser.id}`;
              const gUser: AuthUser = enrichUserWithAvatar({
                id: bUser.id,
                name: bUser.name || bUser.email?.split("@")[0] || "Diner",
                email: bUser.email,
                role: ((bUser as unknown as { role?: UserRole }).role) || "USER",
                avatarUrl: bUser.image || "",
                createdAt: new Date().toISOString(),
              });

              setStoredToken(gToken);
              setStoredUser(gUser);
              setToken(gToken);
              setUser(gUser);

              try {
                const existingProfile = getCustomerProfile();
                saveCustomerProfile({
                  ...existingProfile,
                  fullName: gUser.name,
                  email: gUser.email,
                  phone: existingProfile.phone || "(313) 555-0142",
                  roleBadge: "Diner",
                });
              } catch (profileErr) {
                console.error("Failed to sync customer profile:", profileErr);
              }
            }
          } catch (sessionErr) {
            console.error("Better-Auth session check failed:", sessionErr);
          }
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      // Clear any previous user's cached profile storage before logging in new user
      if (typeof window !== "undefined") {
        localStorage.removeItem("dinedesk_customer_profile");
      }

      const result = await loginApi(credentials);
      if (result.success && result.token) {
        setToken(result.token);
        if (result.data) {
          const enrichedUser = enrichUserWithAvatar(result.data);
          setUser(enrichedUser);
          setStoredUser(enrichedUser);
        }
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      // Clear any previous user's cached profile storage before registering new user
      if (typeof window !== "undefined") {
        localStorage.removeItem("dinedesk_customer_profile");
      }

      const result = await registerApi(credentials);
      if (result.success && result.token && result.data) {
        setToken(result.token);
        const enrichedUser = enrichUserWithAvatar(result.data);
        setUser(enrichedUser);
        setStoredUser(enrichedUser);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      if (token?.startsWith("better_auth_")) {
        await authClient.signOut().catch(() => {});
      } else {
        await logoutApi().catch(() => {});
      }
    } finally {
      // Completely clear auth and local profile caches on logout
      clearStoredAuth();
      if (typeof window !== "undefined") {
        localStorage.removeItem("dinedesk_customer_profile");
        localStorage.removeItem("dinedesk_user_avatar");
      }
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  }, [token]);

  const refreshUser = useCallback(async () => {
    if (token?.startsWith("better_auth_")) {
      try {
        const sessionRes = await authClient.getSession();
        if (sessionRes?.data?.user) {
          const bUser = sessionRes.data.user;
          const updatedUser: AuthUser = enrichUserWithAvatar({
            id: bUser.id,
            name: bUser.name || bUser.email?.split("@")[0] || "Diner",
            email: bUser.email,
            role: ((bUser as unknown as { role?: UserRole }).role) || "USER",
            avatarUrl: bUser.image || user?.avatarUrl || "",
            createdAt: user?.createdAt || new Date().toISOString(),
          });
          setUser(updatedUser);
          setStoredUser(updatedUser);
        }
      } catch (err) {
        console.error("Failed to refresh Better-Auth session:", err);
      }
      return;
    }

    const result = await getMeApi();
    if (result.success && result.data) {
      const enrichedUser = enrichUserWithAvatar(result.data);
      setUser(enrichedUser);
      setStoredUser(enrichedUser);
    }
  }, [token, user]);

  const updateUserAvatar = useCallback((newAvatarUrl: string) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updated = { ...prevUser, avatarUrl: newAvatarUrl };
      setStoredUser(updated);
      return updated;
    });
    if (typeof window !== "undefined") {
      localStorage.setItem("dinedesk_user_avatar", newAvatarUrl);
      const storedProfile = JSON.parse(localStorage.getItem("dinedesk_customer_profile") || "{}");
      storedProfile.avatarUrl = newAvatarUrl;
      localStorage.setItem("dinedesk_customer_profile", JSON.stringify(storedProfile));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("profile-updated"));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateUserAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
