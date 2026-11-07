// app/dashboard/admin/transactions/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TransactionRecord {
  id: string;
  orderDbId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAvatar: string;
  channel: string;
  station: string;
  type: "Dine-in Floor" | "VIP Tasting" | "Chef Counter" | "Curbside Takeaway";
  method: string;
  grossAmount: number;
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  status: "Settled" | "Processing" | "Refunded" | "Cancelled";
  rawStatus: string;
  itemsSummary: string;
  timestamp: string;
  dateIso: string;
}

interface FinancialStats {
  totalGross: number;
  settledGross: number;
  totalTips: number;
  avgCheck: number;
  totalTransactions: number;
  settledCount: number;
  processingCount: number;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");

  // Detail Modal & Feedback
  const [selectedTxn, setSelectedTxn] = useState<TransactionRecord | null>(null);
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

  const fetchTransactions = useCallback(async (isManual = false) => {
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

      const res = await fetch(`${cleanBaseUrl}/api/v1/admin/transactions`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || `Failed to fetch transactions (HTTP ${res.status})`);
      }

      setTransactions(json.transactions || []);
      setStats(json.stats || null);

      if (isManual) {
        showToast("Live transaction records synchronized with PostgreSQL.");
      }
    } catch (err: any) {
      console.error("Fetch Transactions Error:", err);
      setError(err?.message || "Failed to load financial records from database.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleExportCsv = () => {
    if (transactions.length === 0) {
      showToast("No transactions available to export.");
      return;
    }

    const headers = [
      "Check ID",
      "Guest Patron",
      "Email",
      "Phone",
      "Channel / Table",
      "Station",
      "Items",
      "Subtotal ($)",
      "Tax ($)",
      "Tip ($)",
      "Total Gross ($)",
      "Payment Method",
      "Timestamp",
      "Status",
    ];

    const rows = filteredTransactions.map((t) => [
      t.id,
      `"${t.guestName.replace(/"/g, '""')}"`,
      `"${t.guestEmail}"`,
      `"${t.guestPhone}"`,
      `"${t.channel}"`,
      `"${t.station}"`,
      `"${t.itemsSummary.replace(/"/g, '""')}"`,
      t.subtotal.toFixed(2),
      t.taxAmount.toFixed(2),
      t.tipAmount.toFixed(2),
      t.grossAmount.toFixed(2),
      `"${t.method}"`,
      `"${t.timestamp}"`,
      t.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `dinedesk-financial-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Financial ledger successfully exported to CSV.");
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (filter !== "all" && t.status.toLowerCase() !== filter.toLowerCase()) {
          return false;
        }
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          t.id.toLowerCase().includes(q) ||
          t.guestName.toLowerCase().includes(q) ||
          t.guestEmail.toLowerCase().includes(q) ||
          t.method.toLowerCase().includes(q) ||
          t.channel.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "highest") return b.grossAmount - a.grossAmount;
        if (sortBy === "lowest") return a.grossAmount - b.grossAmount;
        return new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime();
      });
  }, [transactions, filter, searchQuery, sortBy]);

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "Settled":
        return "bg-emerald-50 text-emerald-800 border-emerald-200/80";
      case "Processing":
        return "bg-amber-50 text-amber-900 border-amber-200/80";
      case "Refunded":
        return "bg-purple-50 text-purple-900 border-purple-200/80";
      case "Cancelled":
        return "bg-rose-50 text-rose-800 border-rose-200/80";
      default:
        return "bg-neutral-50 text-neutral-600 border-neutral-200/80";
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

  const renderGuestAvatar = (t: TransactionRecord, sizeClass = "w-9 h-9 md:w-10 md:h-10 text-xs") => {
    const hasImage = Boolean(
      t.guestAvatar &&
      t.guestAvatar.trim().startsWith("http") &&
      !brokenAvatars[t.id]
    );

    return (
      <div
        className={`${sizeClass} rounded-xl bg-gradient-to-br from-[#1b3b2b] to-[#12281d] border border-[#E2B774]/40 flex items-center justify-center text-[#E2B774] font-bold shrink-0 shadow-inner overflow-hidden select-none`}
      >
        {hasImage ? (
          <img
            src={t.guestAvatar}
            alt={t.guestName}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
            onError={() => {
              setBrokenAvatars((prev) => ({ ...prev, [t.id]: true }));
            }}
          />
        ) : (
          <span>{getInitials(t.guestName)}</span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex-1 bg-[#FBFBFA] text-[#1b3b2b] font-body-md antialiased min-h-screen">
      <div className="px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex flex-col gap-5 sm:gap-6 md:gap-7 max-w-7xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1b3b2b]/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-amber-800 font-bold">
                Financial Ledger &amp; Cashier Reconciliation
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2B774]" />
              <span className="text-[11px] text-neutral-500 font-medium">
                Live PostgreSQL Telemetry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1b3b2b] tracking-tight">
              Guest Checks &amp; Settlements
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Real-time payment settlements, table check values, service fees, and merchant transaction records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sync Refresh Button */}
            <button
              type="button"
              disabled={isRefreshing || isLoading}
              onClick={() => fetchTransactions(true)}
              className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#1b3b2b] to-[#12281d] text-white hover:from-[#152e22] hover:to-[#0d1d15] text-xs font-semibold shadow-xs border border-[#E2B774]/30 hover:border-[#E2B774]/60 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 select-none group"
            >
              <span
                className={`material-symbols-outlined text-[17px] text-[#E2B774] transition-transform duration-700 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180"
                  }`}
              >
                sync
              </span>
              <span className="tracking-tight">{isRefreshing ? "Syncing..." : "Sync Ledger"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 bg-white hover:bg-neutral-50 text-[#1b3b2b] px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#1b3b2b]/15 shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-base">file_download</span>
              <span>Export CSV</span>
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
              onClick={() => fetchTransactions(true)}
              className="font-bold underline hover:no-underline cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* Financial Stat Cards (Dynamic from Database) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#1b3b2b]/10 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Total Gross Volume
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#1b3b2b] mt-1 truncate">
              ${stats ? stats.totalGross.toFixed(2) : "0.00"}
            </span>
            <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold mt-1 truncate">
              {stats?.totalTransactions ?? 0} Recorded Checks
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#1b3b2b]/10 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Average Check
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#1b3b2b] mt-1 truncate">
              ${stats ? stats.avgCheck.toFixed(2) : "0.00"}
            </span>
            <span className="text-[10px] sm:text-[11px] text-amber-800 font-semibold mt-1 truncate">
              Per DineDesk Order
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#1b3b2b]/10 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Estimated Gratuity
            </span>
            <span className="text-xl sm:text-2xl font-bold text-amber-800 mt-1 truncate">
              ${stats ? stats.totalTips.toFixed(2) : "0.00"}
            </span>
            <span className="text-[10px] sm:text-[11px] text-neutral-500 mt-1 truncate">
              Staff &amp; Service Allocations
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#1b3b2b]/10 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Settled Transactions
            </span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-800 mt-1 truncate">
              {stats?.settledCount ?? 0}
            </span>
            <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold mt-1 truncate">
              {stats?.processingCount ?? 0} Processing
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-xl border border-[#1b3b2b]/15 shadow-xs text-xs self-start">
            {[
              { key: "all", label: "All Checks" },
              { key: "settled", label: "Settled" },
              { key: "processing", label: "Processing" },
              { key: "refunded", label: "Refunded" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setFilter(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filter === t.key
                    ? "bg-[#1b3b2b] text-white font-bold shadow-xs"
                    : "text-neutral-600 hover:text-[#1b3b2b]"
                  }`}
              >
                {t.label}
              </button>
            ))}
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
                placeholder="Search check ID, diner, card..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white border border-[#1b3b2b]/15 focus:outline-none focus:border-[#1b3b2b] transition-all"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-xl bg-white border border-[#1b3b2b]/15 text-[#1b3b2b] font-medium focus:outline-none cursor-pointer"
            >
              <option value="newest">Sort: Date</option>
              <option value="highest">Sort: Amount (High)</option>
              <option value="lowest">Sort: Amount (Low)</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-[#1b3b2b]/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fbfdfc] text-[11px] uppercase text-neutral-400 font-bold tracking-wider border-b border-[#1b3b2b]/10">
                  <th className="py-3 px-4 md:px-5">Guest Patron</th>
                  <th className="hidden md:table-cell py-3 px-5">Check &amp; Station</th>
                  <th className="hidden md:table-cell py-3 px-5">Payment Method</th>
                  <th className="py-3 px-4 md:px-5 text-right md:text-left">Gross &amp; Status</th>
                  <th className="hidden md:table-cell py-3 px-5">Gratuity</th>
                  <th className="hidden md:table-cell py-3 px-5">Timestamp</th>
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
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => {
                        if (typeof window !== "undefined" && window.innerWidth < 768) {
                          setSelectedTxn(t);
                        }
                      }}
                      className="hover:bg-neutral-50/70 transition-colors cursor-pointer md:cursor-default"
                    >
                      {/* Column 1: Guest Patron (Always visible) */}
                      <td className="py-3.5 px-4 md:px-5">
                        <div className="flex items-center gap-3">
                          {renderGuestAvatar(t)}
                          <div className="min-w-0">
                            <span className="font-bold text-[#1b3b2b] block text-xs md:text-sm truncate">
                              {t.guestName}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400 block truncate">
                              {t.id} • {t.channel}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Check & Station (Desktop only) */}
                      <td className="hidden md:table-cell py-3.5 px-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#1b3b2b]">{t.channel}</span>
                          <span className="text-[11px] text-neutral-500">{t.station}</span>
                        </div>
                      </td>

                      {/* Column 3: Payment Method (Desktop only) */}
                      <td className="hidden md:table-cell py-3.5 px-5">
                        <span className="text-neutral-700 font-medium font-mono">{t.method}</span>
                      </td>

                      {/* Column 4: Gross Amount & Status (Visible on Mobile & Desktop) */}
                      <td className="py-3.5 px-4 md:px-5 text-right md:text-left">
                        <div className="flex flex-col items-end md:items-start">
                          <span className="font-mono font-bold text-[#1b3b2b] text-xs md:text-sm">
                            ${t.grossAmount.toFixed(2)}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider mt-0.5 border ${getStatusBadge(
                              t.status
                            )}`}
                          >
                            {t.status}
                          </span>
                        </div>
                      </td>

                      {/* Column 5: Gratuity (Desktop only) */}
                      <td className="hidden md:table-cell py-3.5 px-5">
                        <span className="font-mono text-amber-800 font-semibold">
                          ${t.tipAmount.toFixed(2)}
                        </span>
                      </td>

                      {/* Column 6: Timestamp (Desktop only) */}
                      <td className="hidden md:table-cell py-3.5 px-5 text-neutral-500 font-mono text-[11px]">
                        {t.timestamp}
                      </td>

                      {/* Column 7: Actions (Desktop only) */}
                      <td className="hidden md:table-cell py-3.5 px-5 text-right sticky right-0 bg-white/95 group-hover:bg-neutral-50/95 backdrop-blur-xs">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTxn(t);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#1b3b2b] text-white hover:bg-[#152e22] text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-neutral-400">
                      No financial records matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal (Mobile Bottom-Sheet & Desktop Dialog) */}
      <AnimatePresence>
        {selectedTxn && (
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
                  {renderGuestAvatar(selectedTxn, "w-11 h-11 text-sm")}
                  <div>
                    <h3 className="font-bold text-base text-[#1b3b2b]">{selectedTxn.guestName}</h3>
                    <span className="text-[11px] font-mono text-neutral-400 block">{selectedTxn.id}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTxn(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Check</span>
                  <span className="font-bold text-[#1b3b2b] text-base mt-0.5 block font-mono">
                    ${selectedTxn.grossAmount.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Settlement Status</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase mt-1 border ${getStatusBadge(
                      selectedTxn.status
                    )}`}
                  >
                    {selectedTxn.status}
                  </span>
                </div>

                <div className="col-span-2 p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Station &amp; Table</span>
                  <span className="font-bold text-[#1b3b2b] mt-0.5 block">
                    {selectedTxn.channel} • {selectedTxn.station}
                  </span>
                </div>

                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Payment Instrument</span>
                  <span className="font-mono text-neutral-800 mt-0.5 block">{selectedTxn.method}</span>
                </div>
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Gratuity / Tips</span>
                  <span className="font-mono text-amber-800 font-bold mt-0.5 block">
                    ${selectedTxn.tipAmount.toFixed(2)}
                  </span>
                </div>

                <div className="col-span-2 p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Check Breakdown</span>
                  <div className="mt-1 flex justify-between text-neutral-600 font-mono text-[11px]">
                    <span>Food &amp; Beverage:</span>
                    <span>${selectedTxn.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="mt-0.5 flex justify-between text-neutral-600 font-mono text-[11px]">
                    <span>Sales Tax (8%):</span>
                    <span>${selectedTxn.taxAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="col-span-2 p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Purchased Menu Items</span>
                  <span className="text-neutral-700 italic mt-0.5 block">{selectedTxn.itemsSummary}</span>
                </div>

                <div className="col-span-2 p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Settlement Time</span>
                  <span className="font-mono text-neutral-700 mt-0.5 block">{selectedTxn.timestamp}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1b3b2b]/10 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTxn(null)}
                  className="w-full py-2.5 rounded-xl bg-[#1b3b2b] text-white text-xs font-bold hover:bg-[#152e22] cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  Close Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Status Toast */}
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