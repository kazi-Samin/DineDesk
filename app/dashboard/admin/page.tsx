// app/dashboard/admin/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import AdminStatCard from "@/components/admin/AdminStatCard";
import RevenueBarChart from "@/components/admin/RevenueBarChart";
import OperationalHealthPanel from "@/components/admin/OperationalHealthPanel";
import EditorialFeatureStrip from "@/components/admin/EditorialFeatureStrip";
import RecentActivityTable from "@/components/admin/RecentActivityTable";
import { motion, AnimatePresence } from "framer-motion";

interface OverviewState {
  year?: number;
  kpis: {
    totalUsers: number;
    userGrowthPct: number;
    userGrowthNote: string;
    activeZones: number;
    completedOrders: number;
    fulfillmentRatePct: number;
    fulfillmentNote: string;
    grossGmv: number;
    gmvGrowthPct: number;
    gmvGrowthNote: string;
  };
  health: {
    activeCouriers: number;
    fleetCapacityPct: number;
    courierCapacityPct?: number;
    orderDisputeRate: number;
    disputeRatePct?: number;
    benchmarkDisputeRate: number;
    disputeBenchmarkPct?: number;
    tableReservationsSeated: number;
    seatedReservations?: number;
    reservationsGrowthPct: number;
    seatedGrowthPct?: number;
    avgKitchenPrepMinutes: number;
    prepTimeDeltaMinutes?: number;
    onTimeDispatchPct: number;
  };
  monthlyVolume: Array<{ month: string; volume: number; orders: number }>;
  editorialFeatures: Array<{
    id: string;
    title: string;
    chef: string;
    coverImage: string;
    tag: string;
    status: string;
  }>;
  auditEvents: Array<{
    id: string;
    type: string;
    entityName: string;
    contextValue: string;
    operator: string;
    timestamp: string;
    status: string;
  }>;
}

const RANGES = [
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "90d", label: "Last Quarter" },
  { key: "1y", label: "Trailing 12 Months" },
];

const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function AdminOverviewPage() {
  const [selectedRange, setSelectedRange] = useState("30d");
  const [data, setData] = useState<OverviewState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Safe helper to extract auth tokens across cross-origin deployments
  const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;

    // 1. Check document.cookie
    const cookieMatches = document.cookie.match(
      /(?:^|;\s*)(?:token|accessToken|auth_token|session)=([^;]+)/
    );
    if (cookieMatches && cookieMatches[1]) {
      return decodeURIComponent(cookieMatches[1]);
    }

    // 2. Check storage fallbacks
    try {
      const stored =
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");
      if (stored) return stored.replace(/^Bearer\s+/i, "");
    } catch {
      // Storage access blocked or restricted
    }

    return null;
  };

  // Fetch live PostgreSQL aggregated data from Express Backend
  const fetchOverviewData = useCallback(async (rangeKey: string) => {
    setIsLoading(true);
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
        `${cleanBaseUrl}/api/v1/admin/overview?range=${rangeKey}`,
        {
          method: "GET",
          headers,
          credentials: "include", // Dispatches cross-origin HttpOnly cookies
        }
      );

      const contentType = res.headers.get("content-type");
      let json: any = null;

      if (contentType && contentType.includes("application/json")) {
        json = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text.slice(0, 100) || `Server Error: HTTP ${res.status}`);
      }

      if (!res.ok || !json?.success) {
        throw new Error(
          json?.message || `Failed to fetch telemetry (HTTP ${res.status})`
        );
      }

      setData(json);
    } catch (err: any) {
      console.error("Overview Fetch Error:", err);
      setError(err?.message || "Failed to synchronize operational metrics.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewData(selectedRange);
  }, [selectedRange, fetchOverviewData]);

  // Export live Postgres audits as CSV
  const handleExportCsv = () => {
    if (!data?.auditEvents?.length) {
      showToast("No telemetry log records available for export.");
      return;
    }

    setIsExporting(true);
    try {
      const headers = [
        "Event ID",
        "Action Type",
        "Entity",
        "Context",
        "Operator",
        "Timestamp",
        "Audit Status",
      ];
      const rows = data.auditEvents.map((evt: any) => [
        evt.id || "N/A",
        evt.type || "N/A",
        evt.entityName || "N/A",
        evt.contextValue || "N/A",
        evt.operator || "N/A",
        evt.timestamp || "N/A",
        evt.status || "N/A",
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          headers.join(","),
          ...rows.map((e: any[]) =>
            e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
          ),
        ].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `dinedesk-telemetry-${selectedRange}-${Date.now()}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("Live telemetry ledger exported successfully.");
    } catch {
      showToast("Error compiling telemetry CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateReport = () => {
    showToast("Compiling executive performance ledger dossier...");
    setTimeout(() => {
      window.print();
    }, 600);
  };

  // Safe timeseries data preparation for RevenueBarChart
  const rawVolumeList = data?.monthlyVolume || [];
  const maxVolume = Math.max(...rawVolumeList.map((m) => m.volume || 0), 0.01);
  const currentMonthIndex = new Date().getMonth();

  const formattedChartData = rawVolumeList.map((item, idx) => ({
    month: item.month,
    fullMonth: FULL_MONTHS[idx] || item.month,
    revenue: item.volume,
    orders: item.orders,
    isPeak: item.volume > 0 && item.volume === maxVolume,
    isCurrent: idx === currentMonthIndex,
  }));

  // Ensure editorial features have safe fallback images
  const safeEditorialFeatures = (data?.editorialFeatures || []).map((feature) => ({
    ...feature,
    coverImage:
      feature.coverImage && feature.coverImage.startsWith("http")
        ? feature.coverImage
        : "/assets/logo.png",
  }));

  return (
    <div className="w-full flex-1 bg-[#FBFBFA] text-[#1b3b2b] font-body-md antialiased min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-7 max-w-7xl mx-auto w-full">
        {/* Top Header Section with Date Filtering & Action Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1b3b2b]/10">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-amber-800 font-bold">
                The Maple &amp; Vine • Executive Telemetry
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2B774]" />
              <span className="text-[11px] text-neutral-500 font-medium">
                Live PostgreSQL Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1b3b2b] tracking-tight">
              Overview &amp; Floor Analytics
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Executive governance, dining room pacing, and transactional ledgers for 2414 Michigan Ave.
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Dynamic Period Selector */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-[#1b3b2b]/15 shadow-xs">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setSelectedRange(r.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${selectedRange === r.key
                      ? "bg-[#1b3b2b] text-white shadow-2xs"
                      : "text-neutral-600 hover:text-[#1b3b2b]"
                    }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={isExporting || isLoading}
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 bg-white hover:bg-neutral-50 text-[#1b3b2b] px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#1b3b2b]/15 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">file_download</span>
              <span>{isExporting ? "Compiling..." : "Export CSV"}</span>
            </button>

            <button
              type="button"
              onClick={handleGenerateReport}
              className="flex items-center gap-1.5 bg-[#1b3b2b] text-white hover:bg-[#152e22] px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#E2B774]">insights</span>
              <span>Generate Report</span>
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
              onClick={() => fetchOverviewData(selectedRange)}
              className="font-bold underline hover:no-underline cursor-pointer"
            >
              Retry Handshake
            </button>
          </div>
        )}

        {/* Top 4 Primary Metric Stat Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-white border border-[#1b3b2b]/10 animate-pulse p-5 flex flex-col justify-between"
              >
                <div className="h-3 w-24 bg-neutral-200 rounded" />
                <div className="h-7 w-36 bg-neutral-200 rounded" />
                <div className="h-2.5 w-44 bg-neutral-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <AdminStatCard
              title="Registered Patrons"
              value={(data?.kpis?.totalUsers ?? 0).toLocaleString()}
              changeText={`+${data?.kpis?.userGrowthPct ?? 0}%`}
              changeNote={data?.kpis?.userGrowthNote || "vs prior operating cycle"}
              isPositive={(data?.kpis?.userGrowthPct ?? 0) >= 0}
              progressPct={Math.min(100, Math.max(10, (data?.kpis?.userGrowthPct ?? 0) * 4))}
              icon="group"
              accent="primary"
            />

            <AdminStatCard
              title="Dining Floor Stations"
              value={`${data?.kpis?.activeZones ?? 1} Active Zones`}
              changeText="84 Seats / 22 Tables"
              changeNote="100% floor capacity configured"
              isPositive={true}
              progressPct={100}
              icon="table_restaurant"
              accent="secondary"
            />

            <AdminStatCard
              title="Completed Covers"
              value={(data?.kpis?.completedOrders ?? 0).toLocaleString()}
              changeText={`${data?.kpis?.fulfillmentRatePct ?? 99.4}%`}
              changeNote={data?.kpis?.fulfillmentNote || "Order service fulfillment rate"}
              isPositive={true}
              progressPct={data?.kpis?.fulfillmentRatePct ?? 99}
              icon="shopping_bag"
              accent="primary"
            />

            <AdminStatCard
              title="Period Gross Revenue"
              value={`$${(data?.kpis?.grossGmv ?? 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              changeText={`+${data?.kpis?.gmvGrowthPct ?? 0}%`}
              changeNote={data?.kpis?.gmvGrowthNote || "YoY pacing run rate"}
              isPositive={(data?.kpis?.gmvGrowthPct ?? 0) >= 0}
              progressPct={Math.min(100, Math.max(10, (data?.kpis?.gmvGrowthPct ?? 0) * 3.5))}
              icon="payments"
              accent="primary"
            />
          </div>
        )}

        {/* Macro Analytical Section: Revenue Trajectory Chart & Live Operational Health */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left (8 Cols): Revenue Bar Chart */}
          <div className="lg:col-span-8 flex flex-col">
            <RevenueBarChart
              data={formattedChartData as any}
              year={data?.year || 2026}
            />
          </div>

          {/* Right (4 Cols): Operational Health Side Panel */}
          <div className="lg:col-span-4 flex flex-col">
            <OperationalHealthPanel health={(data?.health ?? {}) as any} />
          </div>
        </div>

        {/* Featured Editorial Listings */}
        {safeEditorialFeatures.length > 0 && (
          <EditorialFeatureStrip features={safeEditorialFeatures as any} />
        )}

        {/* Live Immutable Telemetry Stream & Audits Table */}
        <RecentActivityTable
          events={(data?.auditEvents ?? []) as any}
          onExportCsv={handleExportCsv}
        />
      </div>

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