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
  updateAuthUser: (updatedFields: Partial<AuthUser>) => void;
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

  // Direct updater to synchronously update user across app
  const updateAuthUser = useCallback((updatedFields: Partial<AuthUser>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updated: AuthUser = enrichUserWithAvatar({
        ...prevUser,
        ...updatedFields,
      });

      setStoredUser(updated);

      if (typeof window !== "undefined") {
        if (updated.name) localStorage.setItem("dinedesk_user_name", updated.name);
        if (updated.email) localStorage.setItem("dinedesk_user_email", updated.email);
        if (updated.avatarUrl) localStorage.setItem("dinedesk_user_avatar", updated.avatarUrl);
      }

      return updated;
    });
  }, []);

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
                  const customStoredName =
                    typeof window !== "undefined" ? localStorage.getItem("dinedesk_user_name") : null;

                  const enriched = enrichUserWithAvatar({
                    id: bUser.id,
                    name: customStoredName || bUser.name || bUser.email?.split("@")[0] || "Diner",
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
                clearStoredAuth();
                localStorage.removeItem("dinedesk_customer_profile");
                setToken(null);
                setUser(null);
              }
            }
          }
        } else {
          // Check if arriving via Better-Auth OAuth
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

  // Listen for real-time profile and storage updates
  useEffect(() => {
    const handleAuthSync = (event?: any) => {
      try {
        if (event?.detail) {
          const detail = event.detail;
          setUser((prev) => {
            if (!prev) return null;
            return enrichUserWithAvatar({
              ...prev,
              name: detail.fullName || detail.name || prev.name,
              email: detail.email || prev.email,
              avatarUrl: detail.avatarUrl || prev.avatarUrl,
            });
          });
          return;
        }

        const stored = getStoredUser();
        const storedName = typeof window !== "undefined" ? localStorage.getItem("dinedesk_user_name") : null;
        const storedEmail = typeof window !== "undefined" ? localStorage.getItem("dinedesk_user_email") : null;
        const storedAvatar = typeof window !== "undefined" ? localStorage.getItem("dinedesk_user_avatar") : null;

        if (stored) {
          const updated: AuthUser = enrichUserWithAvatar({
            ...stored,
            name: storedName || stored.name,
            email: storedEmail || stored.email,
            avatarUrl: storedAvatar || stored.avatarUrl,
          });
          setUser(updated);
        } else if (storedName) {
          setUser((prev) => (prev ? { ...prev, name: storedName } : null));
        }
      } catch (err) {
        console.error("Failed to sync auth state from event:", err);
      }
    };

    window.addEventListener("storage", handleAuthSync);
    window.addEventListener("profile-updated", handleAuthSync);
    window.addEventListener("external-profile-updated", handleAuthSync);

    return () => {
      window.removeEventListener("storage", handleAuthSync);
      window.removeEventListener("profile-updated", handleAuthSync);
      window.removeEventListener("external-profile-updated", handleAuthSync);
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
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
        await authClient.signOut().catch(() => { });
      } else {
        await logoutApi().catch(() => { });
      }
    } finally {
      clearStoredAuth();
      if (typeof window !== "undefined") {
        localStorage.removeItem("dinedesk_customer_profile");
        localStorage.removeItem("dinedesk_user_avatar");
        localStorage.removeItem("dinedesk_user_name");
        localStorage.removeItem("dinedesk_user_email");
        localStorage.removeItem("dinedesk_user_phone");
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
        updateAuthUser,
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