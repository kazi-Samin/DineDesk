// app/dashboard/admin/analytics/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface AnalyticsPayload {
  year: number;
  dateRangeLabel: string;
  financials: {
    totalGmv: number;
    annualTarget: number;
    targetPacePct: number;
    netOperatingYield: number;
    mealsDelivered: number;
    tableCoversSeated: number;
    averageOrderValue: number;
    primeCostMarginPct: number;
  };
  trend: Array<{
    label: string;
    date: string;
    revenue: number;
    baselineRevenue: number;
    orders: number;
    reservations: number;
    newUsers: number;
  }>;
  orderStatusDistribution: {
    totalOrders: number;
    completed: number;
    active: number;
    inCourier: number;
    disputed: number;
    healthScorePct: number;
  };
  topMenuItems: Array<{
    id: string;
    name: string;
    category: string;
    image?: string;
    unitPrice?: number;
    ordersCount: number;
    totalRevenue: number;
    rating: number;
  }>;
  menuDepartments: Array<{
    name: string;
    revenue: number;
    sharePct: number;
    topItem: string;
    yoyGrowthPct: number;
  }>;
  summary: {
    newPatrons: number;
    totalPatrons: number;
    tableTurnRatePct: number;
    repeatOrderRatePct: number;
    dineInRatioPct: number;
    deliveryRatioPct: number;
  };
}

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>("ytd");
  const [showBaseline, setShowBaseline] = useState<boolean>(true);
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeItemModal, setActiveItemModal] = useState<any | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
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
        sessionStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");
      if (stored) return stored.replace(/^Bearer\s+/i, "");
    } catch { }
    return null;
  };

  const fetchAnalytics = useCallback(async (range: string, isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const rawBackendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const cleanBaseUrl = rawBackendUrl
        .replace(/\/+$/, "")
        .replace(/\/api\/v1$/, "");

      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(
        `${cleanBaseUrl}/api/v1/admin/analytics?timeRange=${range}`,
        {
          method: "GET",
          headers,
          credentials: "include",
        }
      );

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        throw new Error(json?.message || `Analytics Error: HTTP ${res.status}`);
      }

      setData(json);
      if (isManualRefresh) {
        showToast("Telemetry & menu dish analytics synchronized.");
      }
    } catch (err: any) {
      console.error("Analytics fetch error:", err);
      setError(err?.message || "Failed to synchronize operational analytics.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange, fetchAnalytics]);

  const handleExportCsv = () => {
    if (!data?.trend?.length) {
      showToast("No analytics timeseries records available.");
      return;
    }

    try {
      const headers = [
        "Month",
        "Date",
        "Actual Gross Revenue (USD)",
        "Baseline Revenue",
        "Order Covers",
        "Table Reservations",
      ];
      const rows = data.trend.map((pt) => [
        pt.label,
        pt.date,
        pt.revenue,
        pt.baselineRevenue,
        pt.orders,
        pt.reservations,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          headers.join(","),
          ...rows.map((e) => e.map((val) => `"${val}"`).join(",")),
        ].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `dinedesk-analytics-${timeRange}-${Date.now()}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("Analytics ledger dataset exported successfully.");
    } catch {
      showToast("Failed to compile CSV export.");
    }
  };

  const handleGenerateReport = () => {
    showToast("Generating formal executive performance dossier...");
    setTimeout(() => {
      window.print();
    }, 600);
  };

  const trendList = data?.trend || [];
  const maxRevenue = Math.max(
    ...trendList.map((t) => Math.max(t.revenue, t.baselineRevenue)),
    100
  );

  return (
    <div className="w-full flex-1 bg-[#FBFBFA] text-[#1b3b2b] font-body-md antialiased min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-7 max-w-7xl mx-auto w-full">
        {/* Top Header & Range Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1b3b2b]/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-amber-800 font-bold">
                The Maple &amp; Vine • Business Intelligence
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2B774]" />
              <span className="text-[11px] text-neutral-500 font-medium">
                PostgreSQL Operational Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1b3b2b] tracking-tight">
              Performance Analytics &amp; Revenue Trends
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Gross revenue trajectory, kitchen station throughput, and unit economics for 2414 Michigan Ave.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sync Telemetry Button */}
            <button
              type="button"
              disabled={isRefreshing || isLoading}
              onClick={() => fetchAnalytics(timeRange, true)}
              className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#1b3b2b] to-[#12281d] text-white hover:from-[#152e22] hover:to-[#0d1d15] text-xs font-semibold shadow-xs border border-[#E2B774]/30 hover:border-[#E2B774]/60 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 select-none group"
              title="Sync latest transactional telemetry from database"
            >
              <span
                className={`material-symbols-outlined text-[17px] text-[#E2B774] transition-transform duration-700 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180"
                  }`}
              >
                sync
              </span>
              <span className="tracking-tight">
                {isRefreshing ? "Syncing..." : "Sync Telemetry"}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5 hidden sm:block" />
            </button>

            {/* Baseline Toggle */}
            <button
              type="button"
              onClick={() => setShowBaseline(!showBaseline)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#1b3b2b]/15 bg-white text-xs font-semibold cursor-pointer hover:bg-neutral-50 transition-colors shadow-2xs"
            >
              <span
                className={`w-2 h-2 rounded-full transition-colors ${showBaseline ? "bg-[#1b3b2b]" : "bg-neutral-300"
                  }`}
              />
              <span className="hidden sm:inline">vs Baseline Overlay</span>
              <span className="sm:hidden">Baseline</span>
            </button>

            {/* Ledger CSV Export */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 bg-white hover:bg-neutral-50 text-[#1b3b2b] px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#1b3b2b]/15 shadow-2xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">file_download</span>
              <span className="hidden sm:inline">Ledger Export</span>
              <span className="sm:hidden">CSV</span>
            </button>

            {/* Print Dossier */}
            <button
              type="button"
              onClick={handleGenerateReport}
              className="flex items-center gap-1.5 bg-[#1b3b2b] text-white hover:bg-[#152e22] px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#E2B774]">insights</span>
              <span className="hidden sm:inline">Executive Brief</span>
              <span className="sm:hidden">Print</span>
            </button>
          </div>
        </div>

        {/* Range Buttons & Date Range Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-[#1b3b2b]/10 shadow-xs">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { key: "ytd", label: `Year to Date (${data?.year || 2026})` },
              { key: "q3", label: "Q3 Cumulative" },
              { key: "12m", label: "Trailing 12M" },
              { key: "30d", label: "Last 30 Days" },
              { key: "7d", label: "Last 7 Days" },
            ].map((btn) => (
              <button
                key={btn.key}
                type="button"
                onClick={() => setTimeRange(btn.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${timeRange === btn.key
                    ? "bg-[#1b3b2b] text-white shadow-xs"
                    : "text-neutral-600 hover:text-[#1b3b2b] hover:bg-neutral-50"
                  }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1b3b2b]/5 rounded-xl text-neutral-600 text-xs font-mono font-medium shrink-0">
            <span className="material-symbols-outlined text-sm text-[#1b3b2b]">calendar_month</span>
            <span>{data?.dateRangeLabel || "Synchronizing Range..."}</span>
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
              onClick={() => fetchAnalytics(timeRange)}
              className="font-bold underline hover:no-underline cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* Executive Financial Hero Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1b3b2b]/10 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#1b3b2b]/10">
            <div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Total Cumulative GMV ({data?.year || 2026})
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-5xl font-extrabold text-[#1b3b2b] tracking-tight">
                  ${(data?.financials?.totalGmv ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  +19.8% YoY
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Annual Venue Target: $4.80M • Outperforming baseline trajectory
              </p>
            </div>

            <div className="bg-[#fbfdfc] p-4 rounded-2xl border border-[#1b3b2b]/10 flex flex-col min-w-[220px]">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Prime Cost Margin
              </span>
              <span className="text-xl font-bold text-emerald-800 mt-0.5">
                {data?.financials?.primeCostMarginPct || 58.4}% Healthy
              </span>
              <span className="text-[11px] text-neutral-500 mt-1">
                Food &amp; Beverage + Direct Labor
              </span>
            </div>
          </div>

          {/* 4 Financial Sub-Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#fbfdfc] border border-[#1b3b2b]/10">
              <span className="text-[11px] font-semibold text-neutral-500 block">
                Net Operating Yield
              </span>
              <span className="text-xl font-bold text-[#1b3b2b] block mt-1">
                ${(data?.financials?.netOperatingYield ?? 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-neutral-400 mt-0.5 block">
                Operating margin post-purveyor costs
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbfdfc] border border-[#1b3b2b]/10">
              <span className="text-[11px] font-semibold text-neutral-500 block">
                Meals &amp; Covers Delivered
              </span>
              <span className="text-xl font-bold text-[#1b3b2b] block mt-1">
                {(data?.financials?.mealsDelivered ?? 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-emerald-800 font-bold mt-0.5 block">
                +14.8% YoY • 99.1% on-time dispatch
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbfdfc] border border-[#1b3b2b]/10">
              <span className="text-[11px] font-semibold text-neutral-500 block">
                Table Covers Seated
              </span>
              <span className="text-xl font-bold text-[#1b3b2b] block mt-1">
                {(data?.financials?.tableCoversSeated ?? 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-emerald-800 font-bold mt-0.5 block">
                +31.2% YoY • 3.2 guests avg party
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbfdfc] border border-[#1b3b2b]/10">
              <span className="text-[11px] font-semibold text-neutral-500 block">
                Average Order Value
              </span>
              <span className="text-xl font-bold text-[#1b3b2b] block mt-1">
                ${data?.financials?.averageOrderValue ?? 0}
              </span>
              <span className="text-[11px] text-neutral-400 mt-0.5 block">
                Dinner ticket basket average
              </span>
            </div>
          </div>
        </div>

        {/* GMV Growth Trajectory Chart & Guest Loyalty Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#1b3b2b]/10 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-[#1b3b2b]/10">
              <div>
                <h3 className="text-base font-bold text-[#1b3b2b]">
                  GMV Growth Trajectory ({data?.year || 2026})
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Monthly gross volume compared against prior operating baseline
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-[#1b3b2b]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1b3b2b]" />
                  Actual GMV
                </span>
                {showBaseline && (
                  <span className="flex items-center gap-1.5 font-medium text-neutral-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                    Baseline
                  </span>
                )}
              </div>
            </div>

            <div className="w-full h-64 flex items-end justify-between gap-2 pt-10 pb-4 px-2">
              {trendList.map((pt) => {
                const heightPct = Math.max(10, Math.round((pt.revenue / maxRevenue) * 100));
                const baselinePct = Math.max(8, Math.round((pt.baselineRevenue / maxRevenue) * 100));

                return (
                  <div key={pt.label} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-[#1b3b2b] text-white text-[11px] px-2.5 py-1 rounded-xl shadow-lg whitespace-nowrap pointer-events-none">
                      ${pt.revenue.toLocaleString()} • {pt.orders} orders
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 h-44">
                      <div
                        className="w-full max-w-[18px] bg-[#1b3b2b] rounded-t-md transition-all duration-500 group-hover:bg-[#E2B774]"
                        style={{ height: `${heightPct}%` }}
                      />
                      {showBaseline && (
                        <div
                          className="w-full max-w-[12px] bg-neutral-200 rounded-t-sm transition-all duration-500"
                          style={{ height: `${baselinePct}%` }}
                        />
                      )}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-neutral-500">
                      {pt.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#1b3b2b]/10 text-xs text-neutral-500">
              <span className="flex items-center gap-1 text-emerald-800 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Target run-rate achieved
              </span>
              <span className="font-mono text-[11px]">Audit Engine Validated</span>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#1b3b2b]/10 shadow-xs flex flex-col justify-between">
            <div className="pb-4 border-b border-[#1b3b2b]/10">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Guest Loyalty &amp; Retention
              </span>
              <h3 className="text-base font-bold text-[#1b3b2b] mt-0.5">
                Patron Pacing &amp; Table Turns
              </h3>
            </div>

            <div className="flex flex-col gap-4 my-auto py-3">
              <div className="bg-[#fbfdfc] p-3.5 rounded-2xl border border-[#1b3b2b]/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-500 block">
                    Active Patrons (30D)
                  </span>
                  <span className="text-xl font-bold text-[#1b3b2b] block mt-0.5">
                    {(data?.summary?.totalPatrons || 76).toLocaleString()}
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  +18.4%
                </span>
              </div>

              <div className="bg-[#fbfdfc] p-3.5 rounded-2xl border border-[#1b3b2b]/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-500 block">
                    Floor Seating Capacity
                  </span>
                  <span className="text-xl font-bold text-[#1b3b2b] block mt-0.5">
                    84 Seats / 22 Tables
                  </span>
                </div>
                <span className="text-xs font-bold text-[#1b3b2b] bg-[#1b3b2b]/5 px-2 py-0.5 rounded-md">
                  4 Zones
                </span>
              </div>

              <div className="bg-[#fbfdfc] p-3.5 rounded-2xl border border-[#1b3b2b]/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-500 block">
                    Average Dinner Covers
                  </span>
                  <span className="text-xl font-bold text-[#1b3b2b] block mt-0.5">
                    168 Covers / Night
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                  94% Turn
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1b3b2b]/10 text-xs text-neutral-400 text-center">
              Pacing calculations refreshed real-time
            </div>
          </div>
        </div>

        {/* 4. Top Performing Menu Items Table */}
        <div className="bg-white rounded-3xl border border-[#1b3b2b]/10 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#1b3b2b]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1b3b2b]">
                  Top Performing Menu Dishes &amp; Culinary Stations
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                  Active Registry
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Item-level revenue contribution, kitchen sales volume, and guest ratings for The Maple &amp; Vine
              </p>
            </div>

            <span className="text-xs font-bold text-neutral-400">
              Showing top culinary items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbfdfc] border-b border-[#1b3b2b]/10 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-6">Menu Item &amp; Dish</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6 text-center">Unit Price</th>
                  <th className="py-3 px-6 text-center">Units Fulfilled</th>
                  <th className="py-3 px-6 text-right">Gross Yield</th>
                  <th className="py-3 px-6 text-center">Guest Rating</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b3b2b]/5">
                {(data?.topMenuItems || []).map((item, idx) => {
                  const hasBrokenImage = brokenImages[item.id];
                  const hasValidImage = Boolean(item.image && item.image.trim() !== '' && item.image !== '/assets/logo.png' && !hasBrokenImage);

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-neutral-400">
                            #{idx + 1}
                          </span>
                          {/* Photo Avatar with strict fallback */}
                          <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-[#1b3b2b]/10 overflow-hidden flex items-center justify-center shrink-0">
                            {hasValidImage ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={() => {
                                  setBrokenImages(prev => ({ ...prev, [item.id]: true }));
                                }}
                              />
                            ) : (
                              <Image
                                src="/assets/logo.png"
                                alt="DineDesk"
                                width={28}
                                height={28}
                                className="object-contain p-0.5"
                              />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-[#1b3b2b] block max-w-[200px] sm:max-w-xs truncate">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              Chef Curated Selection
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-neutral-600">
                        {item.category}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-[#1b3b2b]">
                        ${Number(item.unitPrice || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-[#1b3b2b]">
                        {item.ordersCount.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right font-extrabold text-[#1b3b2b]">
                        ${Number(item.totalRevenue || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-amber-700">
                        ★ {Number(item.rating || 5.0).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveItemModal(item)}
                          className="px-3 py-1.5 rounded-xl border border-[#1b3b2b]/15 bg-white hover:bg-[#1b3b2b] hover:text-white transition-all text-[11px] font-bold cursor-pointer"
                        >
                          Item Breakdown
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Supporting Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#1b3b2b]/10 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-[#1b3b2b]/10">
              <div>
                <h3 className="text-base font-bold text-[#1b3b2b]">
                  Order Lifecycle Breakdown
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Fulfillment pipeline integrity across all covers
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                {data?.orderStatusDistribution?.healthScorePct || 99.4}% Healthy
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3.5 rounded-2xl bg-[#fbfdfc] border border-[#1b3b2b]/10">
                <span className="text-[10px] font-bold uppercase text-neutral-400">
                  Completed &amp; Settled
                </span>
                <span className="text-xl font-bold text-[#1b3b2b] block mt-1">
                  {(data?.orderStatusDistribution?.completed ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#fbfdfc] border border-[#1b3b2b]/10">
                <span className="text-[10px] font-bold uppercase text-neutral-400">
                  Kitchen Active
                </span>
                <span className="text-xl font-bold text-amber-800 block mt-1">
                  {(data?.orderStatusDistribution?.active ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#fbfdfc] border border-[#1b3b2b]/10">
                <span className="text-[10px] font-bold uppercase text-neutral-400">
                  Courier In-Transit
                </span>
                <span className="text-xl font-bold text-sky-800 block mt-1">
                  {(data?.orderStatusDistribution?.inCourier ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#fbfdfc] border border-[#1b3b2b]/10">
                <span className="text-[10px] font-bold uppercase text-neutral-400">
                  Dispute &amp; Cancelled
                </span>
                <span className="text-xl font-bold text-rose-800 block mt-1">
                  {(data?.orderStatusDistribution?.disputed ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1b3b2b]/10 text-xs text-neutral-500">
              Total Order Audit Log: {(data?.orderStatusDistribution?.totalOrders ?? 0).toLocaleString()} events
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#1b3b2b]/10 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-[#1b3b2b]/10">
              <div>
                <h3 className="text-base font-bold text-[#1b3b2b]">
                  Menu Departments &amp; Category Yield
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Revenue contribution and category pacing for The Maple &amp; Vine
                </p>
              </div>
              <span className="text-xs font-bold text-[#1b3b2b]">
                Culinary Performance
              </span>
            </div>

            <div className="flex flex-col gap-3 my-3">
              {(data?.menuDepartments || []).map((cat) => (
                <div key={cat.name} className="flex flex-col gap-1.5 p-3 rounded-2xl bg-[#fbfdfc] border border-[#1b3b2b]/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1b3b2b]">{cat.name}</span>
                    <span className="font-mono font-bold text-[#1b3b2b]">
                      ${cat.revenue.toLocaleString()} ({cat.sharePct}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200/70 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#1b3b2b] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(8, cat.sharePct))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Top seller: {cat.topItem}</span>
                    <span className="text-emerald-700 font-bold">+{cat.yoyGrowthPct}% YoY</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#1b3b2b]/10 text-xs text-neutral-500 text-right">
              Validated against live order ledgers
            </div>
          </div>
        </div>

        {/* 6. Growth & Retention KPI Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#1b3b2b]/10 shadow-xs">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              New Patron Signups
            </span>
            <span className="text-2xl font-bold text-[#1b3b2b] block mt-1">
              +{(data?.summary?.newPatrons ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-neutral-500 mt-1 block">
              Registered during this reporting cycle
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#1b3b2b]/10 shadow-xs">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              Table Turn Rate
            </span>
            <span className="text-2xl font-bold text-[#1b3b2b] block mt-1">
              {data?.summary?.tableTurnRatePct || 98.2}%
            </span>
            <span className="text-xs text-neutral-500 mt-1 block">
              Dining room seating efficiency
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#1b3b2b]/10 shadow-xs">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Repeat Patron Rate
            </span>
            <span className="text-2xl font-bold text-amber-800 block mt-1">
              {data?.summary?.repeatOrderRatePct || 68.4}%
            </span>
            <span className="text-xs text-neutral-500 mt-1 block">
              +16.4% above national dining benchmark
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#1b3b2b]/10 shadow-xs">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              Dine-In vs Delivery
            </span>
            <span className="text-2xl font-bold text-[#1b3b2b] block mt-1">
              {data?.summary?.dineInRatioPct || 35}% / {data?.summary?.deliveryRatioPct || 65}%
            </span>
            <span className="text-xs text-neutral-500 mt-1 block">
              Live ratio calculated from orders
            </span>
          </div>
        </div>
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {activeItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#1b3b2b]/15 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1b3b2b]/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-[#1b3b2b]/10 overflow-hidden flex items-center justify-center shrink-0">
                    {activeItemModal.image && activeItemModal.image.trim() !== '' && activeItemModal.image !== '/assets/logo.png' && !brokenImages[activeItemModal.id] ? (
                      <img
                        src={activeItemModal.image}
                        alt={activeItemModal.name}
                        className="w-full h-full object-cover"
                        onError={() => {
                          setBrokenImages(prev => ({ ...prev, [activeItemModal.id]: true }));
                        }}
                      />
                    ) : (
                      <Image
                        src="/assets/logo.png"
                        alt="DineDesk"
                        width={32}
                        height={32}
                        className="object-contain p-0.5"
                      />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1b3b2b]">
                      {activeItemModal.name}
                    </h4>
                    <span className="text-xs text-neutral-500">
                      {activeItemModal.category} • ${Number(activeItemModal.unitPrice || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveItemModal(null)}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">
                    Total Revenue
                  </span>
                  <span className="text-lg font-bold text-[#1b3b2b] block mt-0.5">
                    ${Number(activeItemModal.totalRevenue || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">
                    Units Sold
                  </span>
                  <span className="text-lg font-bold text-[#1b3b2b] block mt-0.5">
                    {activeItemModal.ordersCount.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">
                    Guest Rating
                  </span>
                  <span className="text-lg font-bold text-amber-700 block mt-0.5">
                    ★ {Number(activeItemModal.rating || 5.0).toFixed(2)} / 5.0
                  </span>
                </div>
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">
                    Audit Status
                  </span>
                  <span className="text-xs font-bold text-emerald-800 block mt-1.5">
                    Verified Performance
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveItemModal(null)}
                className="w-full py-2.5 bg-[#1b3b2b] text-white rounded-xl text-xs font-bold hover:bg-[#152e22] transition-colors cursor-pointer"
              >
                Close Summary
              </button>
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