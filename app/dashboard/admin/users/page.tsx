// app/dashboard/admin/users/page.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  ordersCount: number;
  status: string;
  joinedDate: string;
  lastActive: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Track image load failures per user id
  const [brokenAvatars, setBrokenAvatars] = useState<Record<string, boolean>>({});

  // Section 1: Customer Controls
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSort, setCustomerSort] = useState<"newest" | "orders" | "name">("newest");

  // Section 2: Manager Controls
  const [managerSearch, setManagerSearch] = useState("");
  const [managerSort, setManagerSort] = useState<"newest" | "name">("newest");

  // Section 3: Admin Controls
  const [adminSearch, setAdminSearch] = useState("");
  const [adminSort, setAdminSort] = useState<"newest" | "role" | "name">("newest");

  // Mobile Detail Sheet Modal State
  const [mobileDetailUser, setMobileDetailUser] = useState<DatabaseUser | null>(null);

  // Role Change Modal Flow States
  const [roleChangeTarget, setRoleChangeTarget] = useState<DatabaseUser | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<string>("");
  const [roleStep, setRoleStep] = useState<number>(1);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Delete Modal Flow States
  const [deleteTarget, setDeleteTarget] = useState<DatabaseUser | null>(null);
  const [deleteStep, setDeleteStep] = useState<number>(1);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const getAuthToken = (): string | null => {
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
    } catch { }
    return null;
  };

  const fetchUsers = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
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
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || `Failed to fetch users (HTTP ${res.status})`);
      }

      setUsers(json.users || []);
      if (isManualRefresh) {
        showToast("Live user directory synchronized from PostgreSQL.");
      }
    } catch (err: any) {
      console.error("Directory fetch error:", err);
      setError(err?.message || "Failed to synchronize directory from database.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleConfirmRoleChange = async () => {
    if (!roleChangeTarget || !selectedNewRole) return;
    setIsUpdatingRole(true);
    try {
      const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const cleanBaseUrl = rawBackendUrl.replace(/\/+$/, "").replace(/\/api\/v1$/, "");

      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${cleanBaseUrl}/api/v1/admin/users/${roleChangeTarget.id}/role`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ role: selectedNewRole }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to update role");
      }

      showToast(`Role updated to ${selectedNewRole} for ${roleChangeTarget.name}.`);
      setRoleChangeTarget(null);
      setRoleStep(1);
      setMobileDetailUser(null);
      fetchUsers(false);
    } catch (err: any) {
      showToast(err?.message || "Error updating role.");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const cleanBaseUrl = rawBackendUrl.replace(/\/+$/, "").replace(/\/api\/v1$/, "");

      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${cleanBaseUrl}/api/v1/admin/users/${deleteTarget.id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to delete user");
      }

      showToast(`User ${deleteTarget.name} processed.`);
      setDeleteTarget(null);
      setDeleteStep(1);
      setMobileDetailUser(null);
      fetchUsers(false);
    } catch (err: any) {
      showToast(err?.message || "Error deleting user.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isPatron = (role: string) => {
    const r = role.toUpperCase();
    return r === "USER" || r === "CUSTOMER" || r === "DINER";
  };

  const isVenueManager = (role: string) => {
    const r = role.toUpperCase();
    return r === "VENDOR" || r === "RESTAURANT_OWNER" || r === "MANAGER";
  };

  const isAdminOrSuper = (role: string) => {
    const r = role.toUpperCase();
    return r === "ADMIN" || r === "SUPERADMIN" || r === "SUPER_ADMIN";
  };

  const customerList = useMemo(() => {
    return users
      .filter((u) => isPatron(u.role))
      .filter((u) => {
        if (!customerSearch.trim()) return true;
        const q = customerSearch.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
      })
      .sort((a, b) => {
        if (customerSort === "orders") return b.ordersCount - a.ordersCount;
        if (customerSort === "name") return a.name.localeCompare(b.name);
        return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
      });
  }, [users, customerSearch, customerSort]);

  const managerList = useMemo(() => {
    return users
      .filter((u) => isVenueManager(u.role))
      .filter((u) => {
        if (!managerSearch.trim()) return true;
        const q = managerSearch.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
      })
      .sort((a, b) => {
        if (managerSort === "name") return a.name.localeCompare(b.name);
        return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
      });
  }, [users, managerSearch, managerSort]);

  const adminList = useMemo(() => {
    return users
      .filter((u) => isAdminOrSuper(u.role))
      .filter((u) => {
        if (!adminSearch.trim()) return true;
        const q = adminSearch.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
      })
      .sort((a, b) => {
        if (adminSort === "role") return a.role.localeCompare(b.role);
        if (adminSort === "name") return a.name.localeCompare(b.name);
        return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
      });
  }, [users, adminSearch, adminSort]);

  const openRoleModal = (user: DatabaseUser) => {
    setRoleChangeTarget(user);
    setSelectedNewRole(user.role.toUpperCase());
    setRoleStep(1);
  };

  const openDeleteModal = (user: DatabaseUser) => {
    setDeleteTarget(user);
    setDeleteStep(1);
  };

  const getRoleBadgeClasses = (role: string) => {
    if (isAdminOrSuper(role)) {
      return "bg-[#1b3b2b] text-[#E2B774] border border-[#E2B774]/30";
    }
    if (isVenueManager(role)) {
      return "bg-amber-100 text-amber-900 border border-amber-300";
    }
    return "bg-emerald-50 text-emerald-800 border border-emerald-200";
  };

  const getInitials = (name: string): string => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Safe avatar renderer with referrerPolicy and fallback
  const renderUserAvatar = (u: DatabaseUser, sizeClasses = "w-9 h-9 md:w-10 md:h-10 text-xs") => {
    const hasValidImage = Boolean(
      u.avatar &&
      u.avatar.trim().length > 7 &&
      (u.avatar.startsWith("http://") || u.avatar.startsWith("https://")) &&
      !brokenAvatars[u.id]
    );

    return (
      <div
        className={`${sizeClasses} rounded-xl bg-gradient-to-br from-[#1b3b2b] to-[#12281d] border border-[#E2B774]/40 flex items-center justify-center text-white font-bold shrink-0 shadow-inner overflow-hidden select-none`}
      >
        {hasValidImage ? (
          <img
            src={u.avatar}
            alt={u.name}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
            onError={() => {
              setBrokenAvatars((prev) => ({ ...prev, [u.id]: true }));
            }}
          />
        ) : (
          <span className="tracking-tight text-[#E2B774] font-semibold">{getInitials(u.name)}</span>
        )}
      </div>
    );
  };

  const renderUserRow = (u: DatabaseUser) => (
    <tr
      key={u.id}
      onClick={() => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          setMobileDetailUser(u);
        }
      }}
      className="hover:bg-neutral-50/80 transition-colors cursor-pointer md:cursor-default"
    >
      {/* Column 1: Name & ID (Always Visible) */}
      <td className="py-3.5 md:py-4 px-4 md:px-6 max-w-[200px] md:max-w-none">
        <div className="flex items-center gap-3">
          {renderUserAvatar(u)}
          <div className="min-w-0">
            <span className="font-bold text-[#1b3b2b] block truncate text-xs md:text-sm">{u.name}</span>
            <span className="text-[10px] md:text-[11px] font-mono text-neutral-400 truncate block">{u.id}</span>
          </div>
        </div>
      </td>

      {/* Column 2: Contact Channels (Desktop Only) */}
      <td className="hidden md:table-cell py-4 px-6 max-w-[220px]">
        <div className="flex flex-col text-xs">
          <span className="text-neutral-700 font-medium truncate" title={u.email}>{u.email}</span>
          <span className="text-neutral-400 font-mono text-[11px]">{u.phone}</span>
        </div>
      </td>

      {/* Column 3: Role Badge (Always Visible - Column 2 on Mobile) */}
      <td className="py-3.5 md:py-4 px-4 md:px-6 text-right md:text-center whitespace-nowrap">
        <span className={`inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${getRoleBadgeClasses(u.role)}`}>
          {u.role}
        </span>
      </td>

      {/* Column 4: Orders Count (Desktop Only) */}
      <td className="hidden md:table-cell py-4 px-6 text-center font-bold text-[#1b3b2b] whitespace-nowrap">
        {u.ordersCount}
      </td>

      {/* Column 5: Joined Date (Desktop Only) */}
      <td className="hidden md:table-cell py-4 px-6 text-center text-neutral-500 font-mono text-[11px] whitespace-nowrap">
        {u.joinedDate}
      </td>

      {/* Column 6: Actions (Desktop Only, Sticky Right) */}
      <td className="hidden md:table-cell py-4 px-6 text-right whitespace-nowrap sticky right-0 bg-white/95 group-hover:bg-neutral-50/95 backdrop-blur-xs">
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => openRoleModal(u)}
            className="group/btn relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#1b3b2b] bg-white hover:bg-[#1b3b2b] hover:text-[#E2B774] border border-[#1b3b2b]/20 hover:border-[#1b3b2b] shadow-2xs transition-all duration-200 cursor-pointer active:scale-95"
            title="Modify Access Role"
          >
            <span className="material-symbols-outlined text-[15px] text-[#E2B774] group-hover/btn:rotate-45 transition-transform duration-300">
              manage_accounts
            </span>
            <span>Role</span>
          </button>

          <button
            type="button"
            onClick={() => openDeleteModal(u)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="Purge User Account"
          >
            <span className="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="w-full flex-1 bg-[#FBFBFA] text-[#1b3b2b] font-body-md antialiased min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1b3b2b]/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-amber-800 font-bold">
                The Maple &amp; Vine • Platform Governance
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2B774]" />
              <span className="text-[11px] text-neutral-500 font-medium">PostgreSQL Identity Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1b3b2b] tracking-tight">
              User &amp; Access Governance
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Partitioned management across registered diners, venue floor managers, and administrative personnel.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isRefreshing || isLoading}
              onClick={() => fetchUsers(true)}
              className="relative inline-flex items-center gap-2 px-3.5 md:px-4 py-2 rounded-xl bg-gradient-to-r from-[#1b3b2b] to-[#12281d] text-white hover:from-[#152e22] hover:to-[#0d1d15] text-xs font-semibold shadow-xs border border-[#E2B774]/30 hover:border-[#E2B774]/60 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 select-none group"
            >
              <span
                className={`material-symbols-outlined text-[17px] text-[#E2B774] transition-transform duration-700 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180"
                  }`}
              >
                sync
              </span>
              <span className="tracking-tight">{isRefreshing ? "Syncing..." : "Sync Directory"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-rose-600">error</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchUsers(true)}
              className="font-bold underline hover:no-underline cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* Top 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1b3b2b]/10 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Patrons / Customers</span>
              <span className="text-xl sm:text-2xl font-bold text-[#1b3b2b] block mt-0.5 sm:mt-1">{customerList.length}</span>
              <span className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 block">Dining room guest accounts</span>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg sm:text-xl">group</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1b3b2b]/10 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Venue &amp; Floor Managers</span>
              <span className="text-xl sm:text-2xl font-bold text-amber-800 block mt-0.5 sm:mt-1">{managerList.length}</span>
              <span className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 block">Floor operations supervisors</span>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg sm:text-xl">storefront</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1b3b2b]/10 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Admins &amp; Leadership</span>
              <span className="text-xl sm:text-2xl font-bold text-[#1b3b2b] block mt-0.5 sm:mt-1">{adminList.length}</span>
              <span className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 block">Full platform governance</span>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1b3b2b]/10 text-[#1b3b2b] border border-[#1b3b2b]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg sm:text-xl">shield_person</span>
            </div>
          </div>
        </div>

        {/* SECTION 1: CUSTOMERS / PATRONS */}
        <section className="bg-white rounded-3xl border border-[#1b3b2b]/10 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-[#1b3b2b]/10 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-800">local_dining</span>
                <h2 className="text-sm md:text-base font-bold text-[#1b3b2b]">Dining Patrons &amp; Customers</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  {customerList.length} Accounts
                </span>
              </div>
              <p className="text-[11px] md:text-xs text-neutral-500 mt-0.5">
                Guests with table reservations, online checkout access, and loyalty profiles.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:flex-initial min-w-[140px] sm:min-w-[240px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search diners..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-neutral-50 border border-[#1b3b2b]/15 focus:outline-none focus:border-[#1b3b2b] transition-all"
                />
              </div>

              <select
                value={customerSort}
                onChange={(e) => setCustomerSort(e.target.value as any)}
                className="px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-white border border-[#1b3b2b]/15 text-[#1b3b2b] font-medium focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="orders">Highest Orders</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbfdfc] border-b border-[#1b3b2b]/10 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 md:px-6">Name</th>
                  <th className="hidden md:table-cell py-3 px-6">Contact Channels</th>
                  <th className="py-3 px-4 md:px-6 text-right md:text-center">Role</th>
                  <th className="hidden md:table-cell py-3 px-6 text-center">Completed Covers</th>
                  <th className="hidden md:table-cell py-3 px-6 text-center">Joined Date</th>
                  <th className="hidden md:table-cell py-3 px-6 text-right sticky right-0 bg-[#fbfdfc]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b3b2b]/5">
                {customerList.length > 0 ? (
                  customerList.map((u) => renderUserRow(u))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-neutral-400">
                      No customer records match your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 2: RESTAURANT & FLOOR MANAGERS */}
        <section className="bg-white rounded-3xl border border-[#1b3b2b]/10 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-[#1b3b2b]/10 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-800">storefront</span>
                <h2 className="text-sm md:text-base font-bold text-[#1b3b2b]">Restaurant &amp; Floor Managers</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                  {managerList.length} Managers
                </span>
              </div>
              <p className="text-[11px] md:text-xs text-neutral-500 mt-0.5">
                Authorized staff managing dining room pacing, order dispatches, and floor consoles.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:flex-initial min-w-[140px] sm:min-w-[240px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  value={managerSearch}
                  onChange={(e) => setManagerSearch(e.target.value)}
                  placeholder="Search managers..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-neutral-50 border border-[#1b3b2b]/15 focus:outline-none focus:border-[#1b3b2b] transition-all"
                />
              </div>

              <select
                value={managerSort}
                onChange={(e) => setManagerSort(e.target.value as any)}
                className="px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-white border border-[#1b3b2b]/15 text-[#1b3b2b] font-medium focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbfdfc] border-b border-[#1b3b2b]/10 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 md:px-6">Name</th>
                  <th className="hidden md:table-cell py-3 px-6">Contact Channels</th>
                  <th className="py-3 px-4 md:px-6 text-right md:text-center">Role</th>
                  <th className="hidden md:table-cell py-3 px-6 text-center">Managed Orders</th>
                  <th className="hidden md:table-cell py-3 px-6 text-center">Joined Date</th>
                  <th className="hidden md:table-cell py-3 px-6 text-right sticky right-0 bg-[#fbfdfc]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b3b2b]/5">
                {managerList.length > 0 ? (
                  managerList.map((u) => renderUserRow(u))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-neutral-400">
                      No manager profiles match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 3: ADMINS & SUPER ADMINS */}
        <section className="bg-white rounded-3xl border border-[#1b3b2b]/10 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-[#1b3b2b]/10 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1b3b2b]">admin_panel_settings</span>
                <h2 className="text-sm md:text-base font-bold text-[#1b3b2b]">Platform Administrators &amp; Super Admins</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#1b3b2b] text-[#E2B774] text-[10px] font-extrabold border border-[#E2B774]/30">
                  {adminList.length} Administrators
                </span>
              </div>
              <p className="text-[11px] md:text-xs text-neutral-500 mt-0.5">
                Elevated accounts with full authority over database tables, revenue analytics, and security settings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:flex-initial min-w-[140px] sm:min-w-[240px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Search administrators..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-neutral-50 border border-[#1b3b2b]/15 focus:outline-none focus:border-[#1b3b2b] transition-all"
                />
              </div>

              <select
                value={adminSort}
                onChange={(e) => setAdminSort(e.target.value as any)}
                className="px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-white border border-[#1b3b2b]/15 text-[#1b3b2b] font-medium focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="role">By Role Level</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbfdfc] border-b border-[#1b3b2b]/10 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 md:px-6">Name</th>
                  <th className="hidden md:table-cell py-3 px-6">Contact Channels</th>
                  <th className="py-3 px-4 md:px-6 text-right md:text-center">Role</th>
                  <th className="hidden md:table-cell py-3 px-6 text-center">Activity Logs</th>
                  <th className="hidden md:table-cell py-3 px-6 text-center">Provisioned Date</th>
                  <th className="hidden md:table-cell py-3 px-6 text-right sticky right-0 bg-[#fbfdfc]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b3b2b]/5">
                {adminList.length > 0 ? (
                  adminList.map((u) => renderUserRow(u))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-neutral-400">
                      No administrative personnel match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* MOBILE USER DETAIL MODAL */}
      <AnimatePresence>
        {mobileDetailUser && (
          <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs md:hidden">
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl p-5 max-w-md w-full border border-[#1b3b2b]/15 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1b3b2b]/10">
                <div className="flex items-center gap-3">
                  {renderUserAvatar(mobileDetailUser, "w-11 h-11 text-sm")}
                  <div>
                    <h3 className="text-sm font-bold text-[#1b3b2b]">{mobileDetailUser.name}</h3>
                    <span className="text-[10px] font-mono text-neutral-400">{mobileDetailUser.id}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDetailUser(null)}
                  className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Role</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase mt-1 ${getRoleBadgeClasses(mobileDetailUser.role)}`}>
                    {mobileDetailUser.role}
                  </span>
                </div>
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Orders / Managed</span>
                  <span className="text-sm font-bold text-[#1b3b2b] mt-1 block">{mobileDetailUser.ordersCount}</span>
                </div>
                <div className="col-span-2 p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Email Address</span>
                  <span className="font-medium text-[#1b3b2b] break-all">{mobileDetailUser.email}</span>
                </div>
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Contact Phone</span>
                  <span className="font-mono text-neutral-700">{mobileDetailUser.phone}</span>
                </div>
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Joining Date</span>
                  <span className="font-mono text-neutral-700">{mobileDetailUser.joinedDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#1b3b2b]/10">
                <button
                  type="button"
                  onClick={() => {
                    const u = mobileDetailUser;
                    setMobileDetailUser(null);
                    openRoleModal(u);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#1b3b2b] bg-white border border-[#1b3b2b]/20 hover:bg-[#1b3b2b] hover:text-[#E2B774] transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#E2B774]">manage_accounts</span>
                  <span>Change Role</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const u = mobileDetailUser;
                    setMobileDetailUser(null);
                    openDeleteModal(u);
                  }}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ROLE CHANGE MULTI-STEP VERIFICATION MODAL */}
      <AnimatePresence>
        {roleChangeTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#1b3b2b]/15 shadow-2xl flex flex-col gap-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1b3b2b]/10">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#E2B774]">security</span>
                  <h3 className="text-sm font-bold text-[#1b3b2b]">
                    Role Governance ({roleStep}/
                    {isAdminOrSuper(roleChangeTarget.role) ? 3 : 2})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRoleChangeTarget(null);
                    setRoleStep(1);
                  }}
                  className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {roleStep === 1 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-xs text-neutral-500 block">Modifying Access For:</span>
                    <span className="text-sm font-bold text-[#1b3b2b] block">{roleChangeTarget.name}</span>
                    <span className="text-xs text-neutral-400 font-mono break-all">{roleChangeTarget.email}</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-neutral-600">Select New Privilege Role:</label>
                    <select
                      value={selectedNewRole}
                      onChange={(e) => setSelectedNewRole(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl bg-[#fbfdfc] border border-[#1b3b2b]/20 font-bold text-[#1b3b2b] focus:outline-none cursor-pointer"
                    >
                      <option value="USER">USER / CUSTOMER (Dining Guest)</option>
                      <option value="VENDOR">VENDOR / MANAGER (Floor Console)</option>
                      <option value="ADMIN">ADMIN (Administrative Hub)</option>
                      <option value="SUPERADMIN">SUPERADMIN (Unrestricted Authority)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRoleStep(2)}
                    className="w-full py-2.5 rounded-xl bg-[#1b3b2b] hover:bg-[#152e22] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Proceed to Step 2 →
                  </button>
                </div>
              )}

              {roleStep === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      <span>Privilege Modification Warning</span>
                    </div>
                    <span>
                      You are about to transfer <strong>{roleChangeTarget.name}</strong> from{" "}
                      <strong>{roleChangeTarget.role}</strong> to <strong>{selectedNewRole}</strong>. This immediately
                      updates session token scopes across all active login devices.
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setRoleStep(1)}
                      className="flex-1 py-2 rounded-xl border border-neutral-300 text-xs font-bold hover:bg-neutral-50 cursor-pointer"
                    >
                      ← Back
                    </button>

                    {isAdminOrSuper(roleChangeTarget.role) ? (
                      <button
                        type="button"
                        onClick={() => setRoleStep(3)}
                        className="flex-1 py-2 rounded-xl bg-amber-800 text-white text-xs font-bold hover:bg-amber-900 cursor-pointer shadow-xs"
                      >
                        Step 3: Executive Auth →
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isUpdatingRole}
                        onClick={handleConfirmRoleChange}
                        className="flex-1 py-2 rounded-xl bg-[#1b3b2b] text-white text-xs font-bold hover:bg-[#152e22] cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isUpdatingRole ? "Updating..." : "Confirm & Save Role"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {roleStep === 3 && (
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <span className="material-symbols-outlined text-sm">shield</span>
                      <span>CRITICAL ADMINISTRATIVE ACTION (Level 3)</span>
                    </div>
                    <span>
                      Modifying root administrative permissions requires strict verification. Demoting or elevating an
                      administrator changes PostgreSQL ledger access and system telemetry privileges.
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setRoleStep(2)}
                      className="flex-1 py-2 rounded-xl border border-neutral-300 text-xs font-bold hover:bg-neutral-50 cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={isUpdatingRole}
                      onClick={handleConfirmRoleChange}
                      className="flex-1 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isUpdatingRole ? "Executing..." : "Authorize Role Override"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE MULTI-STEP VERIFICATION MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-rose-200 shadow-2xl flex flex-col gap-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-rose-600">delete_forever</span>
                  <h3 className="text-sm font-bold text-rose-900">
                    Purge Account ({deleteStep}/
                    {isAdminOrSuper(deleteTarget.role) ? 2 : 1})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget(null);
                    setDeleteStep(1);
                  }}
                  className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {deleteStep === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="text-xs text-neutral-600">
                    Are you certain you want to permanently delete user account:
                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 my-2">
                      <span className="font-bold text-[#1b3b2b] block">{deleteTarget.name}</span>
                      <span className="font-mono text-neutral-500 break-all">{deleteTarget.email}</span>
                      <span className="block mt-1 font-extrabold text-[10px] text-amber-800">
                        ROLE: {deleteTarget.role}
                      </span>
                    </div>
                    This action completely removes login credentials and profile metadata from PostgreSQL.
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(null)}
                      className="flex-1 py-2 rounded-xl border border-neutral-300 text-xs font-bold hover:bg-neutral-50 cursor-pointer"
                    >
                      Cancel
                    </button>

                    {isAdminOrSuper(deleteTarget.role) ? (
                      <button
                        type="button"
                        onClick={() => setDeleteStep(2)}
                        className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                      >
                        Admin Step 2: Confirm Purge →
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={handleConfirmDelete}
                        className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isDeleting ? "Purging..." : "Confirm Deletion"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {deleteStep === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <span className="material-symbols-outlined text-sm">gavel</span>
                      <span>FINAL ADMINISTRATIVE WARNING</span>
                    </div>
                    <span>
                      You are purging an <strong>ADMINISTRATOR</strong> ({deleteTarget.name}). Doing so will sever their
                      governance over The Maple &amp; Vine. This action is immutable.
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setDeleteStep(1)}
                      className="flex-1 py-2 rounded-xl border border-neutral-300 text-xs font-bold hover:bg-neutral-50 cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={handleConfirmDelete}
                      className="flex-1 py-2 rounded-xl bg-rose-800 hover:bg-rose-900 text-white text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isDeleting ? "Purging Admin..." : "Permanently Purge Admin"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Status Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 right-6 z-50 bg-[#1b3b2b] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#E2B774]/30 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[#E2B774] text-base">check_circle</span>
            <span className="text-xs font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}