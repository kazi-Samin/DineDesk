"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import RecentActivityTable from "@/components/admin/RecentActivityTable";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { getAdminAuditEvents, downloadAdminCsv } from "@/services/mockAdminService";

export default function AdminAuditLogsPage() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_admin_sidebar");
  const auditEvents = getAdminAuditEvents();

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
    downloadAdminCsv("dinedesk-admin-audit-log.csv", [headers, ...rows]);
  };

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md antialiased flex flex-col">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
      />
      <AdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <div className={`flex-1 flex flex-col pt-16 transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "pl-0"}`}>
        <main className="relative flex-1 bg-background">
          <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col gap-1 pb-2 border-b border-outline-variant/40">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-bold">
                Immutable Telemetry
              </span>
              <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                Platform Audit Logs &amp; Events
              </h1>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                Full chronological stream of administrative interventions, automated settlements, and compliance verifications.
              </p>
            </div>

            <RecentActivityTable events={auditEvents} onExportCsv={handleExportCsv} />
          </div>
        </main>
      </div>
    </div>
  );
}
