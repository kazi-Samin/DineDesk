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
  socialLoginApi,
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
  const enrichUserWithAvatar = (userData: AuthUser, fallbackImage?: string | null): AuthUser => {
    const existingAvatar = userData.avatarUrl || fallbackImage;
    if (!existingAvatar || existingAvatar.trim() === "") {
      const nameSeed = userData.name || userData.email || "User";
      userData.avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameSeed)}`;
    } else {
      userData.avatarUrl = existingAvatar;
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

  /**
   * After Google OAuth, attempt to exchange the OAuth user info for a backend JWT.
   * This fixes "Invalid or expired token" errors on favorites/reservations/profile.
   */
  const syncBackendJwtForOAuthUser = async (
    bUser: { id: string; email: string; name?: string | null; image?: string | null },
    fallbackUser: AuthUser
  ): Promise<{ finalToken: string; finalUser: AuthUser }> => {
    try {
      const preferredAvatar = bUser.image || fallbackUser.avatarUrl || undefined;

      const socialResult = await socialLoginApi({
        email: bUser.email,
        name: bUser.name || bUser.email.split("@")[0] || "Diner",
        googleId: bUser.id,
        avatarUrl: preferredAvatar,
      });

      if (socialResult.success && socialResult.token) {
        const backendUser: AuthUser = enrichUserWithAvatar(
          socialResult.data
            ? {
              ...socialResult.data,
              avatarUrl: socialResult.data.avatarUrl || preferredAvatar || "",
            }
            : fallbackUser,
          preferredAvatar
        );

        if (typeof window !== "undefined" && backendUser.avatarUrl) {
          localStorage.setItem("dinedesk_user_avatar", backendUser.avatarUrl);
        }

        return { finalToken: socialResult.token, finalUser: backendUser };
      }
    } catch (err) {
      console.warn("socialLoginApi failed, using better_auth_ token as fallback:", err);
    }

    // Backend sync failed - keep the better_auth_ token as fallback
    return { finalToken: `better_auth_${bUser.id}`, finalUser: fallbackUser };
  };

  // Initialize auth state on client mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const storedToken = getStoredToken();
        const storedUser = getStoredUser();

        // 1. Check if there is an active Google OAuth session via Better-Auth
        let bUser: any = null;
        try {
          const sessionRes = await authClient.getSession();
          if (sessionRes?.data?.user) {
            bUser = sessionRes.data.user;
          }
        } catch (sessionErr) {
          console.warn("Better-Auth session check:", sessionErr);
        }

        const cachedAvatar =
          typeof window !== "undefined" ? localStorage.getItem("dinedesk_user_avatar") : null;
        const googlePhoto = bUser?.image || cachedAvatar || storedUser?.avatarUrl || null;

        // 2. If Google OAuth session is active AND token is missing or starts with "better_auth_"
        if (bUser && (!storedToken || storedToken.startsWith("better_auth_"))) {
          const customStoredName =
            typeof window !== "undefined" ? localStorage.getItem("dinedesk_user_name") : null;

          const tempUser: AuthUser = enrichUserWithAvatar({
            id: bUser.id,
            name: customStoredName || bUser.name || bUser.email?.split("@")[0] || "Diner",
            email: bUser.email,
            role: ((bUser as unknown as { role?: UserRole }).role) || "USER",
            avatarUrl: bUser.image || storedUser?.avatarUrl || cachedAvatar || "",
            createdAt: storedUser?.createdAt || new Date().toISOString(),
          }, googlePhoto);

          const { finalToken, finalUser } = await syncBackendJwtForOAuthUser(bUser, tempUser);
          if (isMounted) {
            setStoredToken(finalToken);
            setStoredUser(finalUser);
            setToken(finalToken);
            setUser(finalUser);

            if (typeof window !== "undefined") {
              if (finalUser.avatarUrl) {
                localStorage.setItem("dinedesk_user_avatar", finalUser.avatarUrl);
              }
              window.dispatchEvent(new CustomEvent("profile-updated"));
              window.dispatchEvent(new CustomEvent("booking-updated"));
              window.dispatchEvent(new CustomEvent("order-updated"));
            }
          }
          return;
        }

        // 3. Normal existing token handling
        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(enrichUserWithAvatar(storedUser, googlePhoto));
          }

          if (storedToken.startsWith("better_auth_")) {
            if (bUser) {
              const tempUser: AuthUser = enrichUserWithAvatar({
                id: bUser.id,
                name: bUser.name || bUser.email?.split("@")[0] || "Diner",
                email: bUser.email,
                role: ((bUser as unknown as { role?: UserRole }).role) || "USER",
                avatarUrl: bUser.image || storedUser?.avatarUrl || cachedAvatar || "",
                createdAt: storedUser?.createdAt || new Date().toISOString(),
              }, googlePhoto);
              const { finalToken, finalUser } = await syncBackendJwtForOAuthUser(bUser, tempUser);
              if (isMounted) {
                setStoredToken(finalToken);
                setStoredUser(finalUser);
                setToken(finalToken);
                setUser(finalUser);
                if (typeof window !== "undefined") {
                  if (finalUser.avatarUrl) {
                    localStorage.setItem("dinedesk_user_avatar", finalUser.avatarUrl);
                  }
                  window.dispatchEvent(new CustomEvent("profile-updated"));
                }
              }
            } else if (!storedUser) {
              clearStoredAuth();
              setToken(null);
              setUser(null);
            }
          } else {
            // Normal backend JWT — verify with live backend /api/v1/auth/me
            const meResult = await getMeApi();
            if (isMounted) {
              if (meResult.success && meResult.data) {
                // Ensure Google session avatar is preserved if backend has no avatarUrl
                const finalAvatar = meResult.data.avatarUrl || googlePhoto || "";
                const meUser = enrichUserWithAvatar({
                  ...meResult.data,
                  avatarUrl: finalAvatar,
                }, finalAvatar);

                setUser(meUser);
                setStoredUser(meUser);
                if (typeof window !== "undefined" && finalAvatar) {
                  localStorage.setItem("dinedesk_user_avatar", finalAvatar);
                }
              } else if (bUser) {
                // Token invalid or expired, but Google session is active - re-issue JWT
                const tempUser: AuthUser = enrichUserWithAvatar({
                  id: bUser.id,
                  name: bUser.name || bUser.email?.split("@")[0] || "Diner",
                  email: bUser.email,
                  role: ((bUser as unknown as { role?: UserRole }).role) || "USER",
                  avatarUrl: bUser.image || storedUser?.avatarUrl || cachedAvatar || "",
                  createdAt: storedUser?.createdAt || new Date().toISOString(),
                }, googlePhoto);
                const { finalToken, finalUser } = await syncBackendJwtForOAuthUser(bUser, tempUser);
                setStoredToken(finalToken);
                setStoredUser(finalUser);
                setToken(finalToken);
                setUser(finalUser);
                if (typeof window !== "undefined") {
                  if (finalUser.avatarUrl) {
                    localStorage.setItem("dinedesk_user_avatar", finalUser.avatarUrl);
                  }
                  window.dispatchEvent(new CustomEvent("profile-updated"));
                }
              } else if (!storedUser) {
                clearStoredAuth();
                localStorage.removeItem("dinedesk_customer_profile");
                setToken(null);
                setUser(null);
              }
            }
          }
        } else if (bUser) {
          // Arriving fresh via Google OAuth redirect
          const tempUser: AuthUser = enrichUserWithAvatar({
            id: bUser.id,
            name: bUser.name || bUser.email?.split("@")[0] || "Diner",
            email: bUser.email,
            role: ((bUser as unknown as { role?: UserRole }).role) || "USER",
            avatarUrl: bUser.image || cachedAvatar || "",
            createdAt: new Date().toISOString(),
          }, googlePhoto);
          setUser(tempUser);

          const { finalToken, finalUser } = await syncBackendJwtForOAuthUser(bUser, tempUser);
          if (isMounted) {
            setStoredToken(finalToken);
            setStoredUser(finalUser);
            setToken(finalToken);
            setUser(finalUser);
            if (typeof window !== "undefined") {
              if (finalUser.avatarUrl) {
                localStorage.setItem("dinedesk_user_avatar", finalUser.avatarUrl);
              }
              window.dispatchEvent(new CustomEvent("profile-updated"));
              window.dispatchEvent(new CustomEvent("booking-updated"));
              window.dispatchEvent(new CustomEvent("order-updated"));
            }
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
      // 1. Always execute Better-Auth sign-out to invalidate session cookies
      await authClient.signOut().catch((err) => {
        console.warn("authClient.signOut failed:", err);
      });

      // 2. Also call the backend logout endpoint
      await logoutApi().catch((err) => {
        console.warn("logoutApi failed:", err);
      });
    } catch (err) {
      console.error("Logout execution error:", err);
    } finally {
      // 3. Clear local storage records
      clearStoredAuth();
      if (typeof window !== "undefined") {
        localStorage.removeItem("dinedesk_customer_profile");
        localStorage.removeItem("dinedesk_user_avatar");
        localStorage.removeItem("dinedesk_user_name");
        localStorage.removeItem("dinedesk_user_email");
        localStorage.removeItem("dinedesk_user_phone");
        localStorage.removeItem("token");
        localStorage.removeItem("dinedesk_auth_token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        // Clear cart records so the drawer empties on sign out
        localStorage.removeItem("dine_desk_cart");

        sessionStorage.clear();

        // Broadcast storage event so CartContext resets state to []
        window.dispatchEvent(new Event("storage"));

        // 4. Clear all accessible cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
        });

        // 5. Disable Google Identity Services auto-select prompt
        if ((window as any).google?.accounts?.id?.disableAutoSelect) {
          (window as any).google.accounts.id.disableAutoSelect();
        }
      }

      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;

    if (token.startsWith("better_auth_")) {
      try {
        const sessionRes = await authClient.getSession();
        if (sessionRes?.data?.user) {
          const bUser = sessionRes.data.user;
          const tempUser: AuthUser = enrichUserWithAvatar({
            id: bUser.id,
            name: bUser.name || bUser.email?.split("@")[0] || "Diner",
            email: bUser.email,
            role: ((bUser as unknown as { role?: UserRole }).role) || "USER",
            avatarUrl: bUser.image || user?.avatarUrl || "",
            createdAt: user?.createdAt || new Date().toISOString(),
          }, bUser.image);

          const { finalToken, finalUser } = await syncBackendJwtForOAuthUser(bUser, tempUser);
          setStoredToken(finalToken);
          setStoredUser(finalUser);
          setToken(finalToken);
          setUser(finalUser);
        }
      } catch (err) {
        console.error("Failed to refresh Better-Auth session:", err);
      }
      return;
    }

    const result = await getMeApi();
    if (result.success && result.data) {
      const enrichedUser = enrichUserWithAvatar(result.data, user?.avatarUrl);
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