// app/dashboard/admin/admins/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StaffProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: "Super Admin" | "Administrator" | "Floor Manager" | string;
  rawRole: string;
  avatar: string;
  assignedDomain: string;
  scope: string;
  twoFactor: string;
  lastSession: string;
  joinedDate: string;
  isRootOwner: boolean;
}

interface GovernanceMetrics {
  totalStaff: number;
  superAdminCount: number;
  adminCount: number;
  managerCount: number;
  hardware2faPct: number;
  idleTimeoutMins: number;
  dualSignoffThreshold: string;
}

export default function AdminAdminsPage() {
  const [superAdmins, setSuperAdmins] = useState<StaffProfile[]>([]);
  const [administrators, setAdministrators] = useState<StaffProfile[]>([]);
  const [floorManagers, setFloorManagers] = useState<StaffProfile[]>([]);
  const [metrics, setMetrics] = useState<GovernanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");

  // Detail Modal & Role Management
  const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [promoteModalUser, setPromoteModalUser] = useState<StaffProfile | null>(null);
  const [targetRole, setTargetRole] = useState("ADMIN");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [brokenAvatars, setBrokenAvatars] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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
    } catch { }
    return null;
  }, []);

  const fetchStaffDirectory = useCallback(async (isManual = false) => {
    if (isManual) {
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

      const res = await fetch(`${cleanBaseUrl}/api/v1/admin/staff`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || `Failed to fetch staff roster (HTTP ${res.status})`);
      }

      setSuperAdmins(json.superAdmins || []);
      setAdministrators(json.administrators || []);
      setFloorManagers(json.floorManagers || []);
      setMetrics(json.metrics || null);

      if (isManual) {
        showToast("Live executive staff roster synchronized with PostgreSQL.");
      }
    } catch (err: any) {
      console.error("Fetch Staff Directory Error:", err);
      setError(err?.message || "Failed to load staff roster from database.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchStaffDirectory();
  }, [fetchStaffDirectory]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsUpdatingRole(true);
    try {
      const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const cleanBaseUrl = rawBackendUrl.replace(/\/+$/, "").replace(/\/api\/v1$/, "");

      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${cleanBaseUrl}/api/v1/admin/staff/${userId}/role`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to update leadership credentials");
      }

      showToast(`Designation updated to ${newRole}.`);
      setPromoteModalUser(null);
      setSelectedStaff(null);
      fetchStaffDirectory(false);
    } catch (err: any) {
      showToast(err?.message || "Error updating role.");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleExportCsv = () => {
    const allStaff = [...superAdmins, ...administrators, ...floorManagers];
    if (allStaff.length === 0) {
      showToast("No staff data available to export.");
      return;
    }
    const headers = [
      "Staff UID",
      "Full Name",
      "Email",
      "Phone",
      "Role Designation",
      "Operational Domain",
      "Security Scope",
      "Date Commissioned",
    ];
    const rows = allStaff.map((s) => [
      s.uid,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
      `"${s.role}"`,
      `"${s.assignedDomain}"`,
      `"${s.scope}"`,
      `"${s.joinedDate}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `dinedesk-leadership-roster-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Leadership audit ledger exported as CSV.");
  };

  const filterList = (list: StaffProfile[]) => {
    return list.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        q === "" ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.uid.toLowerCase().includes(q)
      );
    });
  };

  const filteredSuperAdmins = useMemo(() => filterList(superAdmins), [superAdmins, searchQuery]);
  const filteredAdministrators = useMemo(() => filterList(administrators), [administrators, searchQuery]);
  const filteredFloorManagers = useMemo(() => filterList(floorManagers), [floorManagers, searchQuery]);

  const getInitials = (name: string): string => {
    if (!name) return "AD";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleDesign = (role: string) => {
    if (role === "Super Admin") {
      return {
        badgeBg: "bg-gradient-to-r from-amber-500/20 via-[#E2B774]/30 to-amber-500/20 text-amber-900 border-[#E2B774]",
        cardBorder: "border-[#E2B774]/50 shadow-amber-500/10",
        avatarBorderMotion: "ring-4 ring-[#E2B774]/80 shadow-[0_0_30px_rgba(226,183,116,0.6)]",
        badgeGlow: "bg-[#E2B774]",
      };
    }
    if (role === "Administrator") {
      return {
        badgeBg: "bg-emerald-50 text-emerald-900 border-emerald-300",
        cardBorder: "border-emerald-600/30 shadow-emerald-500/10",
        avatarBorderMotion: "ring-4 ring-emerald-500/70 shadow-[0_0_24px_rgba(16,185,129,0.4)]",
        badgeGlow: "bg-emerald-500",
      };
    }
    return {
      badgeBg: "bg-blue-50 text-blue-900 border-blue-200",
      cardBorder: "border-blue-500/20 shadow-blue-500/5",
      avatarBorderMotion: "ring-4 ring-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.3)]",
      badgeGlow: "bg-blue-500",
    };
  };

  const renderStaffCard = (staff: StaffProfile) => {
    const design = getRoleDesign(staff.role);
    const hasAvatar =
      Boolean(staff.avatar && staff.avatar.startsWith("http")) &&
      !brokenAvatars[staff.id];

    return (
      <motion.div
        key={staff.id}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        onClick={() => setSelectedStaff(staff)}
        className={`relative overflow-hidden rounded-3xl bg-white border ${design.cardBorder} shadow-xl p-6 sm:p-7 flex flex-col justify-between gap-6 transition-all cursor-pointer group`}
      >
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#1b3b2b]/5 blur-3xl pointer-events-none group-hover:bg-[#E2B774]/20 transition-colors duration-500" />

        <div className="flex flex-col items-center text-center gap-4 relative z-10">
          {/* Large Scale Avatar */}
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.03, 1],
              }}
              transition={{
                duration: staff.role === "Super Admin" ? 3 : 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`w-36 h-36 sm:w-40 sm:h-40 rounded-3xl p-1.5 bg-gradient-to-br from-[#1b3b2b] to-[#12281d] ${design.avatarBorderMotion} overflow-hidden shadow-2xl flex items-center justify-center`}
            >
              {hasAvatar ? (
                <img
                  src={staff.avatar}
                  alt={staff.name}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover rounded-2xl"
                  onError={() => {
                    setBrokenAvatars((prev) => ({ ...prev, [staff.id]: true }));
                  }}
                />
              ) : (
                <span className="text-4xl sm:text-5xl font-extrabold text-[#E2B774] select-none font-serif">
                  {getInitials(staff.name)}
                </span>
              )}
            </motion.div>

            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            </span>
          </div>

          {/* Typography */}
          <div className="flex flex-col items-center gap-1 mt-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
              {staff.uid}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#1b3b2b] tracking-tight group-hover:text-amber-900 transition-colors">
              {staff.name}
            </h3>
            <p className="text-xs font-mono text-neutral-500 truncate max-w-[260px]">
              {staff.email}
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-xs ${design.badgeBg}`}
          >
            <span className={`w-2 h-2 rounded-full ${design.badgeGlow} animate-pulse`} />
            {staff.role}
          </div>
        </div>

        {/* Detail Overview Modules */}
        <div className="space-y-2 text-xs pt-4 border-t border-[#1b3b2b]/10 relative z-10">
          <div className="bg-[#fbfdfc] p-3 rounded-xl border border-[#1b3b2b]/10 flex justify-between items-center">
            <span className="text-neutral-500 text-[11px]">Primary Domain</span>
            <span className="font-bold text-[#1b3b2b] truncate max-w-[180px]" title={staff.assignedDomain}>
              {staff.assignedDomain}
            </span>
          </div>

          <div className="bg-[#fbfdfc] p-3 rounded-xl border border-[#1b3b2b]/10 flex justify-between items-center">
            <span className="text-neutral-500 text-[11px]">Security Scope</span>
            <span className="font-medium text-[#1b3b2b] text-right truncate max-w-[180px]" title={staff.scope}>
              {staff.scope}
            </span>
          </div>

          <div className="bg-[#fbfdfc] p-3 rounded-xl border border-[#1b3b2b]/10 flex justify-between items-center">
            <span className="text-neutral-500 text-[11px]">Commissioned</span>
            <span className="font-mono text-neutral-600">{staff.joinedDate}</span>
          </div>
        </div>

        {/* Card Actions */}
        <div className="pt-2 flex items-center justify-between gap-2.5 relative z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedStaff(staff);
            }}
            className="flex-1 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#1b3b2b] text-xs font-bold transition-all cursor-pointer text-center"
          >
            View Dossier
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPromoteModalUser(staff);
              setTargetRole(staff.rawRole);
            }}
            className="py-2.5 px-3.5 rounded-xl bg-[#1b3b2b] hover:bg-[#152e22] text-[#E2B774] text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
            <span>Role</span>
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full flex-1 bg-[#FBFBFA] text-[#1b3b2b] font-body-md antialiased min-h-screen">
      <div className="px-3.5 sm:px-6 lg:px-8 py-6 md:py-8 flex flex-col gap-5 sm:gap-6 md:gap-8 max-w-7xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1b3b2b]/10">
          <div className="flex flex-col gap-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Governance &amp; Executive Directory
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2B774]" />
              <span className="text-[11px] text-neutral-500 font-medium">
                PostgreSQL RBAC Telemetry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1b3b2b] tracking-tight">
              Executive Staff &amp; Leadership
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500">
              Administrative credentials, managerial scope, and role-based access governance across The Maple &amp; Vine operations node.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={isRefreshing || isLoading}
              onClick={() => fetchStaffDirectory(true)}
              className="relative inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#1b3b2b] to-[#12281d] text-white hover:from-[#152e22] hover:to-[#0d1d15] text-xs font-semibold shadow-xs border border-[#E2B774]/30 hover:border-[#E2B774]/60 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 select-none group"
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

            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 bg-white hover:bg-neutral-50 text-[#1b3b2b] px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-[#1b3b2b]/15 shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-base">file_download</span>
              <span>Export Ledger</span>
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
              onClick={() => fetchStaffDirectory(true)}
              className="font-bold underline hover:no-underline cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* Dynamic Governance Metrics Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#1b3b2b]/10 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Active Leadership
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#1b3b2b] mt-1">
              {metrics?.totalStaff ?? (superAdmins.length + administrators.length + floorManagers.length)} Commissioned
            </span>
            <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold mt-1">
              Super Admins, Admins &amp; Leads
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#1b3b2b]/10 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Super Admin Core
            </span>
            <span className="text-xl sm:text-2xl font-bold text-amber-800 mt-1">
              {metrics?.superAdminCount ?? superAdmins.length} Designated
            </span>
            <span className="text-[10px] sm:text-[11px] text-neutral-500 mt-1">
              Full Platform Telemetry Scope
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#1b3b2b]/10 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Floor &amp; Ops Admins
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#1b3b2b] mt-1">
              {(metrics?.adminCount ?? administrators.length) + (metrics?.managerCount ?? floorManagers.length)} Staff
            </span>
            <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold mt-1">
              Floor Seating &amp; Kitchen Expedite
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#1b3b2b]/10 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Dual-Signoff Overrides
            </span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-800 mt-1">
              {metrics?.dualSignoffThreshold || "$25K+"}
            </span>
            <span className="text-[10px] sm:text-[11px] text-neutral-500 mt-1">
              Super Admin Co-Signature Reqd
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-xl border border-[#1b3b2b]/15 shadow-xs text-xs self-start">
            {[
              { key: "All", label: "All Sections" },
              { key: "Super Admin", label: "Super Admins" },
              { key: "Admin", label: "Administrators" },
              { key: "Manager", label: "Floor Managers" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setSelectedRole(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${selectedRole === t.key
                    ? "bg-[#1b3b2b] text-white font-bold shadow-xs"
                    : "text-neutral-600 hover:text-[#1b3b2b]"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:flex-initial min-w-[180px] sm:min-w-[260px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search executive, role, UID..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-[#1b3b2b]/15 focus:outline-none focus:border-[#1b3b2b] transition-all"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-10">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="space-y-4">
                <div className="h-6 w-48 bg-neutral-200 rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="h-96 rounded-3xl bg-neutral-100 animate-pulse border border-[#1b3b2b]/10"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* ROW 1: Super Admin / Platform Authority */}
            {(selectedRole === "All" || selectedRole === "Super Admin") && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-amber-500/20">
                  <span className="material-symbols-outlined text-amber-800 text-xl">shield</span>
                  <h2 className="text-lg font-bold text-[#1b3b2b] tracking-tight">
                    Super Administrators (Root Authority)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold ml-1">
                    {filteredSuperAdmins.length} Profiles
                  </span>
                </div>

                {filteredSuperAdmins.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSuperAdmins.map(renderStaffCard)}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-neutral-400 bg-white rounded-3xl border border-[#1b3b2b]/10">
                    No Super Administrators found matching your search.
                  </div>
                )}
              </div>
            )}

            {/* ROW 2: Administrators (Admins & 1st/2nd Vendors) */}
            {(selectedRole === "All" || selectedRole === "Admin") && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/20">
                  <span className="material-symbols-outlined text-emerald-800 text-xl">admin_panel_settings</span>
                  <h2 className="text-lg font-bold text-[#1b3b2b] tracking-tight">
                    Administrators (Floor, Venue &amp; Primary Vendors)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-extrabold ml-1">
                    {filteredAdministrators.length} Profiles
                  </span>
                </div>

                {filteredAdministrators.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAdministrators.map(renderStaffCard)}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-neutral-400 bg-white rounded-3xl border border-[#1b3b2b]/10">
                    No Administrators found matching your search.
                  </div>
                )}
              </div>
            )}

            {/* ROW 3: Floor Managers (All remaining vendors & managers) */}
            {(selectedRole === "All" || selectedRole === "Manager") && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-blue-500/20">
                  <span className="material-symbols-outlined text-blue-800 text-xl">badge</span>
                  <h2 className="text-lg font-bold text-[#1b3b2b] tracking-tight">
                    Floor Managers &amp; Operations Leads
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-extrabold ml-1">
                    {filteredFloorManagers.length} Profiles
                  </span>
                </div>

                {filteredFloorManagers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFloorManagers.map(renderStaffCard)}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-neutral-400 bg-white rounded-3xl border border-[#1b3b2b]/10">
                    No Floor Managers found matching your search.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dossier Modal */}
      <AnimatePresence>
        {selectedStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-lg w-full rounded-3xl border border-[#1b3b2b]/15 shadow-2xl p-6 sm:p-7 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between pb-3 border-b border-[#1b3b2b]/10">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1b3b2b] to-[#12281d] text-[#E2B774] border-2 border-[#E2B774]/50 flex items-center justify-center font-extrabold text-xl overflow-hidden shadow-inner">
                    {selectedStaff.avatar && !brokenAvatars[selectedStaff.id] ? (
                      <img
                        src={selectedStaff.avatar}
                        alt={selectedStaff.name}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(selectedStaff.name)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-[#1b3b2b]">{selectedStaff.name}</h3>
                    <span className="text-xs font-mono text-neutral-400 block">{selectedStaff.uid} • {selectedStaff.email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStaff(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10 flex justify-between">
                  <span className="text-neutral-500">Official Designation</span>
                  <span className="font-extrabold text-[#1b3b2b]">{selectedStaff.role}</span>
                </div>
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10 flex justify-between">
                  <span className="text-neutral-500">Contact Telephone</span>
                  <span className="font-bold text-[#1b3b2b] font-mono">{selectedStaff.phone}</span>
                </div>
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10 flex flex-col gap-0.5">
                  <span className="text-neutral-500">Assigned Domain</span>
                  <span className="font-bold text-[#1b3b2b]">{selectedStaff.assignedDomain}</span>
                </div>
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10 flex flex-col gap-0.5">
                  <span className="text-neutral-500">Security &amp; Operational Scope</span>
                  <span className="font-medium text-[#1b3b2b]">{selectedStaff.scope}</span>
                </div>
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10 flex justify-between">
                  <span className="text-neutral-500">Authentication Protocol</span>
                  <span className="font-bold text-emerald-800">{selectedStaff.twoFactor}</span>
                </div>
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10 flex justify-between">
                  <span className="text-neutral-500">Session Status</span>
                  <span className="font-bold text-emerald-700">{selectedStaff.lastSession}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1b3b2b]/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedStaff(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-[#1b3b2b] cursor-pointer"
                >
                  Close Dossier
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPromoteModalUser(selectedStaff);
                    setTargetRole(selectedStaff.rawRole);
                    setSelectedStaff(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#1b3b2b] hover:bg-[#152e22] text-[#E2B774] text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  Modify Role Permissions
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Role Modification Dialog */}
      <AnimatePresence>
        {promoteModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-sm w-full rounded-3xl border border-[#1b3b2b]/15 shadow-2xl p-6 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between pb-2 border-b border-[#1b3b2b]/10">
                <div>
                  <h3 className="font-extrabold text-base text-[#1b3b2b]">Modify Staff Designation</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{promoteModalUser.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPromoteModalUser(null)}
                  className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Select Role Tier</span>
                {[
                  { key: "SUPERADMIN", label: "Super Admin (Global Authority)" },
                  { key: "ADMIN", label: "Administrator (Floor & Seating)" },
                  { key: "VENDOR", label: "Floor Manager (Kitchen & Shifts)" },
                  { key: "USER", label: "Demote to Customer" },
                ].map((tier) => (
                  <button
                    key={tier.key}
                    type="button"
                    onClick={() => setTargetRole(tier.key)}
                    className={`p-2.5 rounded-xl text-left font-semibold border transition-all cursor-pointer ${targetRole === tier.key
                        ? "bg-[#1b3b2b] text-[#E2B774] border-[#1b3b2b] shadow-xs"
                        : "bg-[#fbfdfc] text-[#1b3b2b] border-[#1b3b2b]/15 hover:bg-neutral-100"
                      }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-[#1b3b2b]/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPromoteModalUser(null)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-100 text-xs font-semibold text-[#1b3b2b] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isUpdatingRole}
                  onClick={() => handleRoleChange(promoteModalUser.id, targetRole)}
                  className="px-4 py-2 rounded-xl bg-[#1b3b2b] text-[#E2B774] text-xs font-bold shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isUpdatingRole ? "Saving..." : "Confirm Tier"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Status Feedback Toast */}
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