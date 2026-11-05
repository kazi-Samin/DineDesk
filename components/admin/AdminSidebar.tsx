// components/admin/AdminSidebar.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  pendingApprovalsCount?: number;
  adminProfile?: {
    name: string;
    avatar: string;
  };
}

export default function AdminSidebar({
  isOpen = true,
  onClose,
  onToggle,
  pendingApprovalsCount = 8,
  adminProfile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [liveUserCount, setLiveUserCount] = useState<number | null>(null);

  // Synchronized profile state
  const [liveProfile, setLiveProfile] = useState<{ name: string; avatar: string }>({
    name: adminProfile?.name || (user as any)?.name || (user as any)?.fullName || "Fourkan Bin Ilias",
    avatar:
      adminProfile?.avatar ||
      (user as any)?.avatarUrl ||
      (user as any)?.image ||
      (user as any)?.avatar ||
      "",
  });

  // Safe helper to extract auth tokens across cross-origin deployments
  const getAuthToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;

    const cookieMatches = document.cookie.match(
      /(?:^|;\s*)(?:token|accessToken|auth_token|session)=([^;]+)/
    );
    if (cookieMatches && cookieMatches[1]) {
      return decodeURIComponent(cookieMatches[1]);
    }

    try {
      const stored =
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("accessToken");
      if (stored) return stored.replace(/^Bearer\s+/i, "");
    } catch {
      // Storage access blocked or restricted
    }

    return null;
  }, []);

  // Fetch live count of active users from PostgreSQL
  const fetchActiveUserCount = useCallback(async () => {
    try {
      const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const cleanBaseUrl = rawBackendUrl.replace(/\/+$/, "").replace(/\/api\/v1$/, "");

      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${cleanBaseUrl}/api/v1/admin/users`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && typeof json.totalUsers === "number") {
        setLiveUserCount(json.totalUsers);
      }
    } catch (err) {
      console.error("Failed to fetch live user directory count:", err);
    }
  }, [getAuthToken]);

  // Initial fetch on mount & listen to directory changes
  useEffect(() => {
    fetchActiveUserCount();

    const handleDirectoryUpdated = () => {
      fetchActiveUserCount();
    };

    window.addEventListener("dinedesk_directory_updated", handleDirectoryUpdated);
    return () => {
      window.removeEventListener("dinedesk_directory_updated", handleDirectoryUpdated);
    };
  }, [fetchActiveUserCount]);

  // Format count into compact clean badges (e.g. 72, 1.2k, 48.2k)
  const formatCount = (count: number | null): string => {
    if (count === null) return "...";
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toLocaleString();
  };

  // Listen for custom profile update events dispatched from AdminHeader
  useEffect(() => {
    const handleProfileUpdate = (e: any) => {
      if (e?.detail) {
        setLiveProfile({
          name: e.detail.name,
          avatar: e.detail.avatar,
        });
        setImgError(false);
      }
    };

    window.addEventListener("dinedesk_admin_profile_updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("dinedesk_admin_profile_updated", handleProfileUpdate);
    };
  }, []);

  // Update whenever props change
  useEffect(() => {
    if (adminProfile?.name || adminProfile?.avatar) {
      setLiveProfile({
        name: adminProfile.name || liveProfile.name,
        avatar: adminProfile.avatar || liveProfile.avatar,
      });
      setImgError(false);
    }
  }, [adminProfile]);

  const isOverview = pathname === "/dashboard/admin";
  const isAnalytics = pathname === "/dashboard/admin/analytics";
  const isUsers = pathname?.startsWith("/dashboard/admin/users");
  const isRestaurants = pathname?.startsWith("/dashboard/admin/restaurants");
  const isTransactions = pathname?.startsWith("/dashboard/admin/transactions");
  const isAdmins = pathname?.startsWith("/dashboard/admin/admins");
  const isSettings = pathname?.startsWith("/dashboard/admin/settings");
  const isAuditLogs = pathname?.startsWith("/dashboard/admin/audit-logs");

  const displayName = liveProfile.name || (user as any)?.name || (user as any)?.fullName || "Fourkan Bin Ilias";
  const avatarUrl =
    liveProfile.avatar ||
    (user as any)?.avatarUrl ||
    (user as any)?.image ||
    (user as any)?.avatar ||
    "";

  const userInitials =
    displayName
      .split(" ")
      .filter(Boolean)
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AD";

  const userEmail = (user as any)?.email ? (user as any).email.split("@")[0] : "admin";
  const userRole = ((user as any)?.role || "Super Admin").replace(/_/g, " ");

  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  const handleToggleClick = () => {
    if (onToggle) {
      onToggle();
    } else if (isOpen && onClose) {
      onClose();
    }
  };

  const linkClass = (active: boolean) =>
    `relative flex items-center transition-all duration-200 cursor-pointer group select-none ${isOpen
      ? "justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold"
      : "justify-center w-11 h-11 mx-auto rounded-xl text-sm"
    } ${active
      ? "bg-[#1b3b2b] text-white shadow-md shadow-[#1b3b2b]/25 font-bold"
      : "text-[#1b3b2b]/70 hover:bg-[#1b3b2b]/8 hover:text-[#1b3b2b]"
    }`;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#1b3b2b]/40 backdrop-blur-xs z-40 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed left-0 top-20 bottom-0 bg-[#fbfdfc] z-50 flex flex-col justify-between border-r border-[#1b3b2b]/10 shadow-[4px_0_24px_rgba(27,59,43,0.04)] transition-all duration-300 ease-in-out ${isOpen
            ? "translate-x-0 w-72 sm:w-72"
            : "-translate-x-full lg:translate-x-0 lg:w-20"
          }`}
      >
        {/* Responsive Toggle Button */}
        <button
          type="button"
          onClick={handleToggleClick}
          className="hidden lg:flex absolute -right-3.5 top-5 z-50 w-7 h-7 rounded-full bg-white border border-[#1b3b2b]/20 shadow-md shadow-[#1b3b2b]/15 items-center justify-center text-[#1b3b2b] hover:bg-[#1b3b2b] hover:text-[#E2B774] hover:border-[#1b3b2b] active:scale-95 transition-all cursor-pointer group"
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <motion.span
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="material-symbols-outlined text-[17px] leading-none select-none"
          >
            chevron_left
          </motion.span>
        </button>

        <div
          className={`flex flex-col flex-1 overflow-y-auto no-scrollbar overflow-x-hidden ${isOpen ? "px-4 py-4 space-y-4" : "px-2 py-4 space-y-3"
            }`}
        >
          {/* Governance Hub Card */}
          {isOpen ? (
            <div className="bg-white p-3 rounded-2xl border border-[#1b3b2b]/10 shadow-xs flex items-center justify-between min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#1b3b2b]/5 text-[#1b3b2b] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">shield_person</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#1b3b2b] leading-tight truncate">
                    Governance Hub
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium truncate">
                    Platform Telemetry
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10px] font-bold shrink-0 ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live
              </span>
            </div>
          ) : (
            <div
              className="w-11 h-11 mx-auto bg-white rounded-xl border border-[#1b3b2b]/10 shadow-xs flex items-center justify-center relative group shrink-0"
              title="Governance Hub • Operational"
            >
              <span className="material-symbols-outlined text-[#1b3b2b] text-xl">shield_person</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            </div>
          )}

          {/* Profile Card */}
          {isOpen ? (
            <div className="relative overflow-hidden rounded-2xl p-3.5 bg-gradient-to-br from-[#1b3b2b] to-[#12281d] text-white shadow-md shadow-[#1b3b2b]/20 border border-[#E2B774]/20 group min-h-[72px]">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#E2B774]/15 rounded-full blur-2xl pointer-events-none group-hover:bg-[#E2B774]/25 transition-colors duration-500" />

              <div className="relative z-10 flex items-center gap-3 w-full">
                <div className="relative w-10 h-10 rounded-xl p-0.5 bg-[#1b3b2b] border border-[#E2B774]/50 shadow-inner flex items-center justify-center shrink-0 overflow-hidden">
                  {avatarUrl && !imgError ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-lg"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <span className="text-xs font-bold text-[#E2B774] select-none">
                      {userInitials}
                    </span>
                  )}
                  <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#1b3b2b]" />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-1 w-full">
                    <span
                      className="text-xs font-bold text-white truncate block flex-1"
                      title={displayName}
                    >
                      {displayName}
                    </span>
                    <span
                      className="material-symbols-outlined text-[13px] text-[#E2B774] shrink-0"
                      title="Verified Platform Administrator"
                    >
                      verified
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-[#E2B774] text-[#1b3b2b] shrink-0 leading-none">
                      {userRole}
                    </span>
                    <span
                      className="text-[10px] text-neutral-300 font-mono truncate max-w-[90px]"
                      title={(user as any)?.email || `${userEmail}@dinedesk.com`}
                    >
                      {userEmail}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="w-11 h-11 mx-auto rounded-xl p-0.5 bg-[#1b3b2b] border border-[#E2B774]/40 shadow-sm flex items-center justify-center relative cursor-pointer group shrink-0"
              title={`${displayName} • ${userRole}`}
            >
              {avatarUrl && !imgError ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-lg"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-xs font-bold text-[#E2B774] select-none">
                  {userInitials}
                </span>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
          )}

          {/* 1. ADMINISTRATION SECTION */}
          <div className="space-y-1">
            {isOpen ? (
              <span className="px-3 text-[10px] font-bold tracking-wider uppercase text-neutral-400 block mb-1.5">
                Administration
              </span>
            ) : (
              <div className="h-px bg-[#1b3b2b]/10 mx-2 my-2" />
            )}

            <Link
              href="/dashboard/admin"
              onClick={handleNavClick}
              className={linkClass(isOverview)}
              title="Overview & Floor Analytics"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`material-symbols-outlined text-lg shrink-0 ${isOverview ? "text-[#E2B774]" : ""}`}>
                  dashboard
                </span>
                {isOpen && <span className="truncate">Overview</span>}
              </div>
              {!isOpen && isOverview && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#E2B774] rounded-r-full" />
              )}
            </Link>

            <Link
              href="/dashboard/admin/analytics"
              onClick={handleNavClick}
              className={linkClass(isAnalytics)}
              title="System Analytics"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`material-symbols-outlined text-lg shrink-0 ${isAnalytics ? "text-[#E2B774]" : ""}`}>
                  monitoring
                </span>
                {isOpen && <span className="truncate">System Analytics</span>}
              </div>
              {isOpen && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-colors shrink-0 ${isAnalytics
                      ? "bg-[#E2B774] text-[#1b3b2b] shadow-xs"
                      : "bg-[#E2B774]/20 text-[#1b3b2b] border border-[#E2B774]/40"
                    }`}
                >
                  Trends
                </span>
              )}
              {!isOpen && isAnalytics && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#E2B774] rounded-r-full" />
              )}
            </Link>

            {/* Dynamically Populated Manage Users Counter */}
            <Link
              href="/dashboard/admin/users"
              onClick={handleNavClick}
              className={linkClass(isUsers)}
              title="Manage Users"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`material-symbols-outlined text-lg shrink-0 ${isUsers ? "text-[#E2B774]" : ""}`}>
                  group
                </span>
                {isOpen && <span className="truncate">Manage Users</span>}
              </div>
              {isOpen && (
                <span
                  className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 transition-colors ${isUsers
                      ? "bg-white/20 text-[#E2B774]"
                      : "bg-[#1b3b2b]/5 text-[#1b3b2b] border border-[#1b3b2b]/10"
                    }`}
                >
                  {formatCount(liveUserCount)}
                </span>
              )}
              {!isOpen && isUsers && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#E2B774] rounded-r-full" />
              )}
            </Link>

            <Link
              href="/dashboard/admin/restaurants"
              onClick={handleNavClick}
              className={linkClass(isRestaurants)}
              title="Venue & Floor Stations"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`material-symbols-outlined text-lg shrink-0 ${isRestaurants ? "text-[#E2B774]" : ""}`}>
                  storefront
                </span>
                {isOpen && <span className="truncate">Venue &amp; Stations</span>}
              </div>
              {isOpen && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${isRestaurants
                      ? "bg-[#E2B774] text-[#1b3b2b]"
                      : "bg-[#1b3b2b]/10 text-[#1b3b2b]"
                    }`}
                >
                  {pendingApprovalsCount ? `${pendingApprovalsCount} Pending` : "4 Zones"}
                </span>
              )}
              {!isOpen && isRestaurants && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#E2B774] rounded-r-full" />
              )}
            </Link>

            <Link
              href="/dashboard/admin/transactions"
              onClick={handleNavClick}
              className={linkClass(isTransactions)}
              title="Financial Ledger"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`material-symbols-outlined text-lg shrink-0 ${isTransactions ? "text-[#E2B774]" : ""}`}>
                  receipt_long
                </span>
                {isOpen && <span className="truncate">Financial Ledger</span>}
              </div>
              {!isOpen && isTransactions && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#E2B774] rounded-r-full" />
              )}
            </Link>
          </div>

          {/* 2. EXECUTIVE GOVERNANCE SECTION */}
          <div className="space-y-1 pt-2 border-t border-[#1b3b2b]/10">
            {isOpen ? (
              <span className="px-3 text-[10px] font-bold tracking-wider uppercase text-neutral-400 block mb-1.5">
                Executive Governance
              </span>
            ) : (
              <div className="h-px bg-[#1b3b2b]/10 mx-2 my-2" />
            )}

            <Link
              href="/dashboard/admin/admins"
              onClick={handleNavClick}
              className={linkClass(isAdmins)}
              title="Staff & Leadership"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`material-symbols-outlined text-lg shrink-0 ${isAdmins ? "text-[#E2B774]" : ""}`}>
                  admin_panel_settings
                </span>
                {isOpen && <span className="truncate">Staff &amp; Leadership</span>}
              </div>
              {isOpen && (
                <span className={`text-[11px] font-mono font-medium shrink-0 ${isAdmins ? "text-white/80" : "text-neutral-400"}`}>
                  8 Staff
                </span>
              )}
              {!isOpen && isAdmins && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#E2B774] rounded-r-full" />
              )}
            </Link>

            <Link
              href="/dashboard/admin/settings"
              onClick={handleNavClick}
              className={linkClass(isSettings)}
              title="Venue Settings"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`material-symbols-outlined text-lg shrink-0 ${isSettings ? "text-[#E2B774]" : ""}`}>
                  tune
                </span>
                {isOpen && <span className="truncate">Venue Settings</span>}
              </div>
              {!isOpen && isSettings && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#E2B774] rounded-r-full" />
              )}
            </Link>
          </div>

          {/* 3. OPERATIONS & FLOOR SECTION */}
          <div className="space-y-1 pt-2 border-t border-[#1b3b2b]/10">
            {isOpen ? (
              <span className="px-3 text-[10px] font-bold tracking-wider uppercase text-neutral-400 block mb-1.5">
                Operations &amp; Floor
              </span>
            ) : (
              <div className="h-px bg-[#1b3b2b]/10 mx-2 my-2" />
            )}

            <Link
              href="/dashboard/vendor"
              onClick={handleNavClick}
              className={`relative flex items-center transition-all ${isOpen
                  ? "justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-amber-900 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/70"
                  : "justify-center w-11 h-11 mx-auto rounded-xl text-amber-900 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/70"
                }`}
              title="GM Live Floor Console"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-lg text-amber-800 shrink-0">
                  room_service
                </span>
                {isOpen && <span className="truncate">GM Floor Console</span>}
              </div>
              {isOpen && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-600 text-white text-[9px] font-bold uppercase tracking-wider shrink-0">
                  Live
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/admin/audit-logs"
              onClick={handleNavClick}
              className={linkClass(isAuditLogs)}
              title="Audit & Telemetry"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`material-symbols-outlined text-lg shrink-0 ${isAuditLogs ? "text-[#E2B774]" : ""}`}>
                  history
                </span>
                {isOpen && <span className="truncate">Audit &amp; Telemetry</span>}
              </div>
              {!isOpen && isAuditLogs && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#E2B774] rounded-r-full" />
              )}
            </Link>

            <Link
              href="/"
              onClick={handleNavClick}
              className={`relative flex items-center transition-all ${isOpen
                  ? "justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-neutral-500 hover:bg-[#1b3b2b]/5 hover:text-[#1b3b2b]"
                  : "justify-center w-11 h-11 mx-auto rounded-xl text-neutral-500 hover:bg-[#1b3b2b]/5 hover:text-[#1b3b2b]"
                }`}
              title="Live Guest View"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-lg shrink-0">open_in_new</span>
                {isOpen && <span className="truncate">Guest View</span>}
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="p-3 border-t border-[#1b3b2b]/10 bg-white/60">
          {isOpen ? (
            <div className="bg-[#f4f7f5] p-2.5 rounded-xl border border-[#1b3b2b]/10 flex items-center justify-between min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                <span className="text-[11px] text-[#1b3b2b] font-bold truncate">
                  Cluster DET-1
                </span>
              </div>
              <span className="font-mono text-[10px] text-neutral-500 font-medium shrink-0 ml-2">
                v2.14.0
              </span>
            </div>
          ) : (
            <div
              className="w-11 h-11 mx-auto bg-[#f4f7f5] rounded-xl border border-[#1b3b2b]/10 flex items-center justify-center shrink-0"
              title="Cluster DET-1 • v2.14.0"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}