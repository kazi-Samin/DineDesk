// app/dashboard/admin/page.tsx
"use client";

import { useState } from "react";
import AdminStatCard from "@/components/admin/AdminStatCard";
import RevenueBarChart from "@/components/admin/RevenueBarChart";
import OperationalHealthPanel from "@/components/admin/OperationalHealthPanel";
import EditorialFeatureStrip from "@/components/admin/EditorialFeatureStrip";
import RecentActivityTable from "@/components/admin/RecentActivityTable";
import {
  getAdminOverviewStats,
  getOperationalHealthMetrics,
  getMonthlyVolumeData,
  getEditorialFeatures,
  getAdminAuditEvents,
  downloadAdminCsv,
} from "@/services/mockAdminService";

export default function AdminOverviewPage() {
  const [dateRangeFilter, setDateRangeFilter] = useState("Last 30 Days (Oct 1 – Oct 31, 2025)");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const kpis = getAdminOverviewStats();
  const health = getOperationalHealthMetrics();
  const monthlyVolume = getMonthlyVolumeData();
  const editorialFeatures = getEditorialFeatures();
  const auditEvents = getAdminAuditEvents();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleExportCsv = () => {
    const headers = [
      "Event ID",
      "Type",
      "Entity / Restaurant",
      "Context & Value",
      "Operator",
      "Timestamp",
      "Status",
    ];
    const rows = auditEvents.map((evt) => [
      evt.id,
      evt.type,
      evt.entityName,
      evt.contextValue,
      evt.operator,
      evt.timestamp,
      evt.status,
    ]);
    downloadAdminCsv("dinedesk-admin-audit-stream.csv", [headers, ...rows]);
    showToast("Audit stream successfully exported as CSV.");
  };

  const handleGenerateReport = () => {
    showToast("Generating comprehensive platform performance dossier for October 2025...");
    setTimeout(() => {
      window.print();
    }, 600);
  };

  return (
    <div className="w-full flex-1 bg-[#FBFBFA] text-[#1b3b2b] font-body-md antialiased">
      <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-7 max-w-7xl mx-auto w-full">

        {/* Header Section with Date Range & Export Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1b3b2b]/10">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-amber-800 font-bold">
                The Maple &amp; Vine • Executive Telemetry
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2B774]" />
              <span className="text-[11px] text-neutral-500 font-medium">
                Corktown, Detroit
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1b3b2b] tracking-tight">
              Overview &amp; Floor Analytics
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Executive governance, dining room pacing, and transactional ledgers for 2414 Michigan Ave.
            </p>
          </div>

          {/* Top Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#1b3b2b]/10 shadow-xs text-xs font-medium text-neutral-600">
              <span className="material-symbols-outlined text-[#1b3b2b] text-[16px]">
                calendar_today
              </span>
              <span>{dateRangeFilter}</span>
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 bg-white hover:bg-neutral-50 text-[#1b3b2b] px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#1b3b2b]/15 shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">file_download</span>
              <span>Export CSV</span>
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

        {/* Top 4 Primary Metric Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <AdminStatCard
            title="Registered Patrons"
            value={kpis.totalUsers.toLocaleString()}
            changeText={`+${kpis.userGrowthPct}%`}
            changeNote={kpis.userGrowthNote}
            isPositive={true}
            progressPct={kpis.userProgressPct}
            icon="group"
            accent="primary"
          />

          <AdminStatCard
            title="Dining Floor Stations"
            value="4 Active Zones"
            changeText="84 Seats / 22 Tables"
            changeNote="100% floor capacity"
            isPositive={true}
            progressPct={kpis.restaurantProgressPct}
            icon="table_restaurant"
            accent="secondary"
          />

          <AdminStatCard
            title="Completed Covers"
            value={kpis.completedOrders.toLocaleString()}
            changeText={`${kpis.fulfillmentRatePct}%`}
            changeNote={kpis.fulfillmentNote}
            isPositive={true}
            progressPct={kpis.orderProgressPct}
            icon="shopping_bag"
            accent="primary"
          />

          <AdminStatCard
            title="Monthly Venue Revenue"
            value={`$${kpis.grossGmv.toLocaleString()}`}
            changeText={`+${kpis.gmvGrowthPct}%`}
            changeNote={kpis.gmvGrowthNote}
            isPositive={true}
            progressPct={kpis.gmvProgressPct}
            icon="payments"
            accent="primary"
          />
        </div>

        {/* Main Visual Section: Monthly Bar Chart & Live Operational Health */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left (8 Cols): Monthly Bar Chart */}
          <div className="lg:col-span-8">
            <RevenueBarChart data={monthlyVolume} />
          </div>

          {/* Right (4 Cols): Operational Health Side Panel */}
          <div className="lg:col-span-4">
            <OperationalHealthPanel health={health} />
          </div>
        </div>

        {/* Editorial Visual Feature Strip */}
        <EditorialFeatureStrip features={editorialFeatures} />

        {/* Recent Platform Events & Audits Table */}
        <RecentActivityTable
          events={auditEvents}
          onExportCsv={handleExportCsv}
        />
      </div>

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1b3b2b] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#E2B774]/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[#E2B774] text-base">check_circle</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}