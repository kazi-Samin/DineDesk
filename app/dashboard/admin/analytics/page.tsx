"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AnalyticsFilterBar from "@/components/admin/analytics/AnalyticsFilterBar";
import ExecutiveGmvHeroCard from "@/components/admin/analytics/ExecutiveGmvHeroCard";
import GmvGrowthTrajectoryChart from "@/components/admin/analytics/GmvGrowthTrajectoryChart";
import NetworkDensityRetentionChart from "@/components/admin/analytics/NetworkDensityRetentionChart";
import TopPerformingRestaurantsTable from "@/components/admin/analytics/TopPerformingRestaurantsTable";
import OrderStatusDistribution from "@/components/admin/analytics/OrderStatusDistribution";
import TopCuisinesRanking from "@/components/admin/analytics/TopCuisinesRanking";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { AdminTimeRange } from "@/types/admin";
import {
  getAdminAnalytics,
  downloadAdminCsv,
} from "@/services/mockAdminService";

export default function AdminAnalyticsPage() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_admin_sidebar");

  const [timeRange, setTimeRange] = useState<AdminTimeRange>("ytd");
  const [showBaseline, setShowBaseline] = useState<boolean>(true);
  const [customDates, setCustomDates] = useState<{ start: string; end: string }>({
    start: "2025-01-01",
    end: "2025-10-31",
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const analytics = getAdminAnalytics(timeRange, customDates);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setCustomDates({ start, end });
    setTimeRange("custom");
    showToast(`Updated analytics date range: ${start} to ${end}`);
  };

  const handleExportCsv = () => {
    const headers = [
      "Time Interval",
      "Date",
      "Gross Revenue (USD)",
      "Orders",
      "Reservations",
      "New Registered Users",
    ];
    const rows = analytics.trend.map((pt) => [
      pt.label,
      pt.date,
      pt.revenue.toString(),
      pt.orders.toString(),
      pt.reservations.toString(),
      pt.newUsers.toString(),
    ]);

    downloadAdminCsv(`dinedesk-analytics-${timeRange}.csv`, [headers, ...rows]);
    showToast("Analytics timeseries dataset exported as CSV.");
  };

  const handleGenerateReport = () => {
    showToast("Generating formal executive performance analytics dossier...");
    setTimeout(() => {
      window.print();
    }, 600);
  };

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md antialiased flex flex-col">
      {/* 1. Admin Shared Navigation Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
      />

      {/* 2. Admin Top Header */}
      <AdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* 3. Main Analytics Workspace */}
      <div
        className={`flex-1 flex flex-col pt-16 transition-all duration-300 ${
          isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"
        }`}
      >
        <main className="relative flex-1 bg-background">
          <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
            {/* 1. Top Header, Baseline Toggle & Filter Bar */}
            <AnalyticsFilterBar
              timeRange={timeRange}
              dateRangeLabel={analytics.dateRangeLabel}
              showBaseline={showBaseline}
              onTimeRangeChange={(r) => {
                setTimeRange(r);
                showToast(`Switched analytics view to ${r.toUpperCase()}`);
              }}
              onToggleBaseline={(val) => {
                setShowBaseline(val);
                showToast(val ? "2024 Baseline trajectory overlay enabled." : "2024 Baseline overlay hidden.");
              }}
              onCustomDateChange={handleCustomDateChange}
              onExportCsv={handleExportCsv}
              onGenerateReport={handleGenerateReport}
            />

            {/* 2. Executive GMV Hero Card with 4-Metric Grid */}
            <ExecutiveGmvHeroCard analytics={analytics} />

            {/* 3. Dual Macro Charts: GMV Growth Trajectory (60%) & Network Density (40%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 flex flex-col">
                <GmvGrowthTrajectoryChart
                  trend={analytics.trend}
                  showBaseline={showBaseline}
                />
              </div>
              <div className="lg:col-span-5 flex flex-col">
                <NetworkDensityRetentionChart />
              </div>
            </div>

            {/* 4. Top Performing Culinary Hubs (Tier-1 Merchants) */}
            <TopPerformingRestaurantsTable vendors={analytics.topVendors} />

            {/* 5. Supporting Operations: Order Status & Cuisine Rankings */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-5 flex flex-col">
                <OrderStatusDistribution distribution={analytics.orderStatusDistribution} />
              </div>
              <div className="lg:col-span-7 flex flex-col">
                <TopCuisinesRanking
                  cuisines={analytics.topCuisines}
                  vendors={analytics.topVendors}
                />
              </div>
            </div>

            {/* 6. Platform Growth & Unit Economics Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-outline-variant shadow-2xs">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  New Patron Signups
                </span>
                <span className="font-headline-sm text-xl font-bold text-primary block mt-1">
                  +{analytics.summary.newPatrons.toLocaleString()}
                </span>
                <span className="text-xs text-on-surface-variant mt-1.5 block">
                  34% converted to first reservation or delivery in 48h
                </span>
              </div>

              <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-outline-variant shadow-2xs">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Merchant Retention Rate
                </span>
                <span className="font-headline-sm text-xl font-bold text-primary block mt-1">
                  98.2%
                </span>
                <span className="text-xs text-on-surface-variant mt-1.5 block">
                  Only 2 churned outlets in past 180 operating days
                </span>
              </div>

              <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-outline-variant shadow-2xs">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Repeat Order Rate
                </span>
                <span className="font-headline-sm text-xl font-bold text-secondary block mt-1">
                  68.4%
                </span>
                <span className="text-xs text-on-surface-variant mt-1.5 block">
                  16.4% above national dining benchmark (52.0%)
                </span>
              </div>

              <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-outline-variant shadow-2xs">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Dine-In vs Delivery Ratio
                </span>
                <span className="font-headline-sm text-xl font-bold text-primary block mt-1">
                  31% / 69%
                </span>
                <span className="text-xs text-on-surface-variant mt-1.5 block">
                  Table bookings surging across weekend dinner service
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-lg border border-outline-variant/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
