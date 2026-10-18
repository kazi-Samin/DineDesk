"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";

export default function AdminSettingsPage() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_admin_sidebar");
  const [commissionRate, setCommissionRate] = useState("6.5");
  const [dispatchSla, setDispatchSla] = useState("35");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = () => {
    setToastMessage("Platform settings saved and broadcasted to cluster nodes.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md antialiased flex flex-col">
      <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} onToggle={toggleSidebar} />
      <AdminHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

      <div className={`flex-1 flex flex-col pt-16 transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "pl-0"}`}>
        <main className="relative flex-1 bg-background">
          <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 max-w-4xl mx-auto w-full">
            <div className="pb-2 border-b border-outline-variant/40">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-bold">
                System Parameters
              </span>
              <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                Platform Settings &amp; Governance
              </h1>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                Global transaction commissions, delivery SLA thresholds, and operational policy controls.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/40">
                <div>
                  <span className="font-bold text-sm text-on-surface block">Base Merchant Commission Tier (%)</span>
                  <span className="text-xs text-on-surface-variant block mt-0.5">
                    Standard percentage applied across partner delivery receipts.
                  </span>
                </div>
                <input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-28 p-2 rounded-lg bg-surface-container-low border border-outline-variant font-mono font-bold text-primary text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/40">
                <div>
                  <span className="font-bold text-sm text-on-surface block">Courier Escalation Threshold (Minutes)</span>
                  <span className="text-xs text-on-surface-variant block mt-0.5">
                    Trigger automated backup courier reallocation when dispatch delay delta exceeds limit.
                  </span>
                </div>
                <input
                  type="number"
                  value={dispatchSla}
                  onChange={(e) => setDispatchSla(e.target.value)}
                  className="w-28 p-2 rounded-lg bg-surface-container-low border border-outline-variant font-mono font-bold text-primary text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Save Platform Configuration
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-lg border border-outline-variant/30 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
