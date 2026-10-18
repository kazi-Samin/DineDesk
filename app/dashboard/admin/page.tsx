"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminStatCard from "@/components/admin/AdminStatCard";
import RevenueBarChart from "@/components/admin/RevenueBarChart";
import OperationalHealthPanel from "@/components/admin/OperationalHealthPanel";
import EditorialFeatureStrip from "@/components/admin/EditorialFeatureStrip";
import RecentActivityTable from "@/components/admin/RecentActivityTable";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import {
  getAdminOverviewStats,
  getOperationalHealthMetrics,
  getMonthlyVolumeData,
  getEditorialFeatures,
  getAdminAuditEvents,
  downloadAdminCsv,
} from "@/services/mockAdminService";

export default function AdminOverviewPage() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_admin_sidebar");

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
    const headers = ["Event ID", "Type", "Entity / Restaurant", "Context & Value", "Operator", "Timestamp", "Status"];
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
    <div className="bg-background min-h-screen text-on-surface font-body-md antialiased flex flex-col">
      {/* 1. Admin Shared Navigation Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
        pendingApprovalsCount={kpis.onboardingRestaurants}
      />

      {/* 2. Admin Top Header */}
      <AdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* 3. Main Operational Content Workspace */}
      <div className={`flex-1 flex flex-col pt-16 transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "pl-0"}`}>
        <main className="relative flex-1 bg-background">
          <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-7 max-w-7xl mx-auto w-full">
            {/* Header Section with Date Range & Export Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-outline-variant/40">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-bold">
                    Platform Telemetry
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
                    Real-Time Sync
                  </span>
                </div>
                <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                  Overview &amp; Analytics
                </h1>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5">
                  Real-time operational summaries and platform governance metrics for DineDesk.
                </p>
              </div>

              {/* Top Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/60 shadow-2xs text-xs">
                  <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
                    calendar_today
                  </span>
                  <span className="font-medium text-on-surface">
                    {dateRangeFilter}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface px-3 py-2 rounded-xl text-xs font-semibold border border-outline-variant/70 shadow-2xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">file_download</span>
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateReport}
                  className="flex items-center gap-1.5 bg-primary-container text-on-primary hover:bg-primary px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">insights</span>
                  <span>Generate Report</span>
                </button>
              </div>
            </div>

            {/* Top 4 Primary Metric Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <AdminStatCard
                title="Total Patrons & Users"
                value={kpis.totalUsers.toLocaleString()}
                changeText={`+${kpis.userGrowthPct}%`}
                changeNote={kpis.userGrowthNote}
                isPositive={true}
                progressPct={kpis.userProgressPct}
                icon="group"
                accent="primary"
              />

              <AdminStatCard
                title="Active Establishments"
                value={kpis.activeRestaurants.toString()}
                changeText={`+${kpis.onboardingRestaurants} onboarding`}
                changeNote={kpis.onboardingNote}
                isPositive={true}
                progressPct={kpis.restaurantProgressPct}
                icon="storefront"
                accent="secondary"
              />

              <AdminStatCard
                title="Completed Orders"
                value={kpis.completedOrders.toLocaleString()}
                changeText={`${kpis.fulfillmentRatePct}%`}
                changeNote={kpis.fulfillmentNote}
                isPositive={true}
                progressPct={kpis.orderProgressPct}
                icon="shopping_bag"
                accent="primary"
              />

              <AdminStatCard
                title="Platform Gross GMV"
                value={`৳${kpis.grossGmv.toLocaleString()}`}
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
