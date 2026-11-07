// app/dashboard/admin/restaurants/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface ReservationItem {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAvatar?: string;
  partySize: number;
  tableNumber: string;
  reservationDate: string;
  reservationTime: string;
  seatingArea: string;
  status: "PENDING" | "CONFIRMED" | "SEATED" | "COMPLETED" | "CANCELLED";
  specialRequests: string;
  createdAt: string;
}

interface VenueDetails {
  id: string;
  name: string;
  address: string;
  managerName: string;
  managerPhone: string;
  floorLeadName: string;
  floorLeadPhone: string;
  serviceHours: string;
  status: string;
  isOpen: boolean;
  totalTables: number;
  maxCapacity: number;
}

interface VenueStats {
  totalReservations: number;
  confirmedCount: number;
  seatedCount: number;
  pendingCount: number;
  cancelledCount: number;
  seatedCovers: number;
  maxCapacity: number;
  totalTables: number;
  utilizationPct: number;
}

export default function AdminRestaurantsPage() {
  const [venue, setVenue] = useState<VenueDetails | null>(null);
  const [stats, setStats] = useState<VenueStats | null>(null);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "partySize" | "guestName">("newest");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Track failed avatar image loads
  const [brokenAvatars, setBrokenAvatars] = useState<Record<string, boolean>>({});

  // Reservation Detail & Action Modal
  const [selectedReservation, setSelectedReservation] = useState<ReservationItem | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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

  const fetchVenueData = useCallback(async (isManualRefresh = false) => {
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

      const res = await fetch(`${cleanBaseUrl}/api/v1/admin/reservations`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || `Failed to fetch reservations (HTTP ${res.status})`);
      }

      setVenue(json.restaurant || null);
      setStats(json.stats || null);
      setReservations(json.reservations || []);

      if (isManualRefresh) {
        showToast("Live floor reservations synchronized from PostgreSQL.");
      }
    } catch (err: any) {
      console.error("Fetch Reservations Error:", err);
      setError(err?.message || "Failed to synchronize floor reservations.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchVenueData();
  }, [fetchVenueData]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const cleanBaseUrl = rawBackendUrl.replace(/\/+$/, "").replace(/\/api\/v1$/, "");

      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${cleanBaseUrl}/api/v1/admin/reservations/${id}/status`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to update reservation status");
      }

      showToast(`Reservation marked as ${newStatus}.`);
      setSelectedReservation(null);
      fetchVenueData(false);
    } catch (err: any) {
      showToast(err?.message || "Error updating reservation.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePrintRunSheet = () => {
    showToast("Generating Floor Seating Run Sheet for Service...");
    setTimeout(() => {
      window.print();
    }, 600);
  };

  const filteredReservations = useMemo(() => {
    return reservations
      .filter((r) => {
        if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          r.guestName.toLowerCase().includes(q) ||
          r.guestEmail.toLowerCase().includes(q) ||
          r.guestPhone.includes(q) ||
          r.tableNumber.toLowerCase().includes(q) ||
          r.seatingArea.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "partySize") return b.partySize - a.partySize;
        if (sortBy === "guestName") return a.guestName.localeCompare(b.guestName);
        return new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime();
      });
  }, [reservations, statusFilter, searchQuery, sortBy]);

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "CONFIRMED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "SEATED":
        return "bg-[#1b3b2b] text-[#E2B774] border-[#E2B774]/30";
      case "PENDING":
        return "bg-amber-50 text-amber-900 border-amber-200";
      case "COMPLETED":
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-neutral-50 text-neutral-600 border-neutral-200";
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return "GP";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const renderGuestAvatar = (r: ReservationItem, sizeClass = "w-9 h-9 md:w-10 md:h-10 text-xs") => {
    const hasImage = Boolean(
      r.guestAvatar &&
      r.guestAvatar.trim().startsWith("http") &&
      !brokenAvatars[r.id]
    );

    return (
      <div
        className={`${sizeClass} rounded-xl bg-gradient-to-br from-[#1b3b2b] to-[#12281d] border border-[#E2B774]/40 flex items-center justify-center text-[#E2B774] font-bold shrink-0 shadow-inner overflow-hidden select-none`}
      >
        {hasImage ? (
          <img
            src={r.guestAvatar}
            alt={r.guestName}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
            onError={() => {
              setBrokenAvatars((prev) => ({ ...prev, [r.id]: true }));
            }}
          />
        ) : (
          <span>{getInitials(r.guestName)}</span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex-1 bg-[#FBFBFA] text-[#1b3b2b] font-body-md antialiased min-h-screen">
      <div className="px-3.5 sm:px-6 lg:px-8 py-6 md:py-8 flex flex-col gap-5 sm:gap-6 md:gap-7 max-w-7xl mx-auto w-full">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1b3b2b]/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-amber-800 font-bold">
                Venue Floor Governance &amp; Pacing
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2B774]" />
              <span className="text-[11px] text-neutral-500 font-medium">
                Live PostgreSQL Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1b3b2b] tracking-tight">
              Table Reservations &amp; Floor Plan
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Live guest arrivals, table allocations, floor pacing, and reservation ledgers for {venue?.name || "DineDesk Flagship Premium Kitchen"}.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={isRefreshing || isLoading}
              onClick={() => fetchVenueData(true)}
              className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#1b3b2b] to-[#12281d] text-white hover:from-[#152e22] hover:to-[#0d1d15] text-xs font-semibold shadow-xs border border-[#E2B774]/30 hover:border-[#E2B774]/60 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 select-none group"
            >
              <span
                className={`material-symbols-outlined text-[17px] text-[#E2B774] transition-transform duration-700 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180"
                  }`}
              >
                sync
              </span>
              <span className="tracking-tight">{isRefreshing ? "Syncing..." : "Sync Floor"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </button>

            <button
              type="button"
              onClick={handlePrintRunSheet}
              className="flex items-center gap-1.5 bg-white hover:bg-neutral-50 text-[#1b3b2b] px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#1b3b2b]/15 shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>Seating Run Sheet</span>
            </button>

            <Link
              href="/dashboard/vendor"
              className="flex items-center gap-1.5 bg-[#1b3b2b] text-white hover:bg-[#152e22] px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#E2B774]">room_service</span>
              <span>Open GM Floor Console</span>
            </Link>
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
              onClick={() => fetchVenueData(true)}
              className="font-bold underline hover:no-underline cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* Master Venue Details Card */}
        <div className="bg-white rounded-2xl border border-[#1b3b2b]/10 shadow-xs p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left 7 cols: Venue Identity */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1b3b2b] text-[#E2B774] text-[11px] font-bold">
                  <span className="material-symbols-outlined text-xs text-[#E2B774]">verified</span>
                  Flagship Venue
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Floor Open &amp; Active
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1b3b2b] tracking-tight">
                  {venue?.name || "DineDesk Flagship Premium Kitchen"}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 flex items-center gap-1.5 mt-0.5">
                  <span className="material-symbols-outlined text-sm text-[#E2B774]">location_on</span>
                  {venue?.address || "Gulshan Avenue, Gulshan / Banani, Dhaka"}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[#1b3b2b]/10 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                    General Manager (Admin 1)
                  </span>
                  <span className="font-semibold text-[#1b3b2b] block mt-0.5">
                    {venue?.managerName || "Akash Khan"}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {venue?.managerPhone || "+880 423652448"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                    Floor Seating Lead (Admin 2)
                  </span>
                  <span className="font-semibold text-[#1b3b2b] block mt-0.5">
                    {venue?.floorLeadName || "Sarah Jenkins"}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {venue?.floorLeadPhone || "+880 1845511413"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                    Service Hours
                  </span>
                  <span className="font-semibold text-[#1b3b2b] block mt-0.5">
                    {venue?.serviceHours || "8:00 AM – 12:00 PM"}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">Morning &amp; Midday Service</span>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Live Occupancy Telemetry */}
            <div className="lg:col-span-5 bg-[#f4f7f5] rounded-xl p-4 sm:p-5 border border-[#1b3b2b]/10 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1b3b2b]/10">
                <span className="text-xs font-bold text-[#1b3b2b] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#E2B774]">analytics</span>
                  Live Dining Room Utilization
                </span>
                <span className="font-mono text-xs font-bold text-[#1b3b2b]">
                  {stats?.seatedCovers ?? 0} / {stats?.maxCapacity ?? 200} Seats
                </span>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-2xl font-bold text-[#1b3b2b]">
                    {stats?.utilizationPct ?? 0}%
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    Pacing Balanced
                  </span>
                </div>
                <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#1b3b2b] h-full rounded-full transition-all duration-700"
                    style={{ width: `${stats?.utilizationPct ?? 0}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                <div className="bg-white p-2 rounded-lg border border-[#1b3b2b]/10 shadow-2xs">
                  <span className="font-bold text-[#1b3b2b] block text-sm">
                    {stats?.totalTables ?? 50}
                  </span>
                  <span className="text-[10px] text-neutral-500">Tables</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#1b3b2b]/10 shadow-2xs">
                  <span className="font-bold text-[#1b3b2b] block text-sm">
                    {stats?.totalReservations ?? 0}
                  </span>
                  <span className="text-[10px] text-neutral-500">Bookings</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#1b3b2b]/10 shadow-2xs">
                  <span className="font-bold text-emerald-700 block text-sm">
                    {stats?.confirmedCount ?? 0}
                  </span>
                  <span className="text-[10px] text-neutral-500">Confirmed</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#1b3b2b]/10 shadow-2xs">
                  <span className="font-bold text-amber-700 block text-sm">
                    {stats?.pendingCount ?? 0}
                  </span>
                  <span className="text-[10px] text-neutral-500">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#1b3b2b] tracking-tight">
              Table Reservations &amp; Floor Roster
            </h3>
            <p className="text-xs text-neutral-500">
              Active guest table assignments, dining halls, party headcounts, and live seatings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-initial min-w-[150px] sm:min-w-[220px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guest, table, hall..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white border border-[#1b3b2b]/15 focus:outline-none focus:border-[#1b3b2b] transition-all"
              />
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#1b3b2b]/15 shadow-xs text-xs">
              {[
                { key: "ALL", label: "All" },
                { key: "CONFIRMED", label: "Confirmed" },
                { key: "SEATED", label: "Seated" },
                { key: "PENDING", label: "Pending" },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setStatusFilter(t.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${statusFilter === t.key
                      ? "bg-[#1b3b2b] text-white shadow-2xs font-bold"
                      : "text-neutral-600 hover:text-[#1b3b2b]"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-xl bg-white border border-[#1b3b2b]/15 text-[#1b3b2b] font-medium focus:outline-none cursor-pointer"
            >
              <option value="newest">Sort: Date</option>
              <option value="partySize">Sort: Party Size</option>
              <option value="guestName">Sort: Name</option>
            </select>
          </div>
        </div>

        {/* Rich Reservations Table */}
        <div className="bg-white rounded-2xl border border-[#1b3b2b]/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fbfdfc] text-[11px] uppercase text-neutral-400 font-bold tracking-wider border-b border-[#1b3b2b]/10">
                  <th className="py-3 px-4 md:px-5">Guest Patron</th>
                  <th className="hidden md:table-cell py-3 px-5">Contact Details</th>
                  <th className="hidden md:table-cell py-3 px-5">Table &amp; Hall</th>
                  <th className="hidden md:table-cell py-3 px-5">Date &amp; Time</th>
                  <th className="hidden md:table-cell py-3 px-5">Party &amp; Special Note</th>
                  <th className="py-3 px-4 md:px-5 text-right md:text-left">Status</th>
                  <th className="hidden md:table-cell py-3 px-5 text-right sticky right-0 bg-[#fbfdfc]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b3b2b]/5 text-xs">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="py-4 px-5">
                        <div className="h-4 bg-neutral-200 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredReservations.length > 0 ? (
                  filteredReservations.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => {
                        if (typeof window !== "undefined" && window.innerWidth < 768) {
                          setSelectedReservation(r);
                        }
                      }}
                      className="hover:bg-neutral-50/70 transition-colors cursor-pointer md:cursor-default"
                    >
                      {/* Column 1: Guest Patron (Always Visible on Mobile & Desktop) */}
                      <td className="py-3.5 px-4 md:px-5">
                        <div className="flex items-center gap-3">
                          {renderGuestAvatar(r)}
                          <div className="min-w-0">
                            <span className="font-bold text-[#1b3b2b] block text-xs md:text-sm truncate">
                              {r.guestName}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400 block truncate">
                              {r.tableNumber} • {r.partySize} Guests
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Contact Details (Desktop Only) */}
                      <td className="hidden md:table-cell py-3.5 px-5">
                        <div className="flex flex-col">
                          <span className="font-medium text-neutral-800 truncate max-w-[170px]" title={r.guestEmail}>
                            {r.guestEmail}
                          </span>
                          <span className="text-[11px] text-neutral-500 font-mono">{r.guestPhone}</span>
                        </div>
                      </td>

                      {/* Column 3: Table & Hall (Desktop Only) */}
                      <td className="hidden md:table-cell py-3.5 px-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#1b3b2b]">{r.tableNumber}</span>
                          <span className="text-[11px] text-neutral-500">{r.seatingArea}</span>
                        </div>
                      </td>

                      {/* Column 4: Date & Time (Desktop Only) */}
                      <td className="hidden md:table-cell py-3.5 px-5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#1b3b2b]">{r.reservationDate}</span>
                          <span className="text-[11px] text-neutral-500 font-mono">{r.reservationTime}</span>
                        </div>
                      </td>

                      {/* Column 5: Party Size & Special Note (Desktop Only) */}
                      <td className="hidden md:table-cell py-3.5 px-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#1b3b2b]">{r.partySize} Guests</span>
                          <span className="text-[11px] text-neutral-400 italic truncate max-w-[180px]" title={r.specialRequests}>
                            {r.specialRequests}
                          </span>
                        </div>
                      </td>

                      {/* Column 6: Status Badge (Always Visible - Column 2 on Mobile) */}
                      <td className="py-3.5 px-4 md:px-5 text-right md:text-left">
                        <span className={`inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getStatusBadge(r.status)}`}>
                          {r.status}
                        </span>
                      </td>

                      {/* Column 7: Actions (Desktop Only, Sticky Right) */}
                      <td className="hidden md:table-cell py-3.5 px-5 text-right sticky right-0 bg-white/95 group-hover:bg-neutral-50/95 backdrop-blur-xs">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReservation(r);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#1b3b2b] text-white hover:bg-[#152e22] text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-neutral-400">
                      No table reservations found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reservation Details & Management Modal (Mobile Bottom-Sheet & Desktop Dialog) */}
      <AnimatePresence>
        {selectedReservation && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full border border-[#1b3b2b]/15 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between pb-3 border-b border-[#1b3b2b]/10">
                <div className="flex items-center gap-3">
                  {renderGuestAvatar(selectedReservation, "w-11 h-11 text-sm")}
                  <div>
                    <h3 className="font-bold text-base text-[#1b3b2b]">{selectedReservation.guestName}</h3>
                    <span className="text-[11px] font-mono text-neutral-400 block break-all">{selectedReservation.guestEmail}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReservation(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Party Size</span>
                  <span className="font-bold text-[#1b3b2b] text-sm mt-0.5 block">{selectedReservation.partySize} Guests</span>
                </div>
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Current Status</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase mt-1 border ${getStatusBadge(selectedReservation.status)}`}>
                    {selectedReservation.status}
                  </span>
                </div>
                <div className="col-span-2 p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Table &amp; Dining Hall</span>
                  <span className="font-bold text-[#1b3b2b] mt-0.5 block">{selectedReservation.tableNumber} • {selectedReservation.seatingArea}</span>
                </div>
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Date</span>
                  <span className="font-semibold text-[#1b3b2b] mt-0.5 block">{selectedReservation.reservationDate}</span>
                </div>
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Time</span>
                  <span className="font-mono text-[#1b3b2b] mt-0.5 block">{selectedReservation.reservationTime}</span>
                </div>
                <div className="col-span-2 p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Guest Phone</span>
                  <span className="font-mono font-medium text-neutral-700 mt-0.5 block">{selectedReservation.guestPhone}</span>
                </div>
                <div className="col-span-2 p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Special Requests</span>
                  <span className="font-medium text-[#1b3b2b] italic mt-0.5 block">{selectedReservation.specialRequests}</span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-[#1b3b2b]/10 flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Update Seating Status
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange(selectedReservation.id, "SEATED")}
                    className="py-2.5 rounded-xl bg-[#1b3b2b] text-[#E2B774] text-xs font-bold hover:bg-[#152e22] cursor-pointer shadow-xs disabled:opacity-50 transition-all active:scale-95"
                  >
                    Seat Guest
                  </button>
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange(selectedReservation.id, "COMPLETED")}
                    className="py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer shadow-xs disabled:opacity-50 transition-all active:scale-95"
                  >
                    Complete
                  </button>
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange(selectedReservation.id, "CANCELLED")}
                    className="py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer shadow-xs disabled:opacity-50 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </div>
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