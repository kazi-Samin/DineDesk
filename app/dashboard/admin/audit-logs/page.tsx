// app/dashboard/admin/audit-logs/page.tsx
"use client";

import RecentActivityTable from "@/components/admin/RecentActivityTable";
import { getAdminAuditEvents, downloadAdminCsv } from "@/services/mockAdminService";

export default function AdminAuditLogsPage() {
  const auditEvents = getAdminAuditEvents();

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
    downloadAdminCsv("dinedesk-admin-audit-log.csv", [headers, ...rows]);
  };

  return (
    <div className="w-full flex-1 bg-[#FBFBFA] text-[#1b3b2b] font-body-md antialiased">
      <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="flex flex-col gap-1 pb-4 border-b border-[#1b3b2b]/10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Immutable Telemetry
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2B774]" />
            <span className="text-[11px] text-neutral-500 font-medium">
              SHA-256 Ledger
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1b3b2b] tracking-tight">
            Platform Audit Logs &amp; Events
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Full chronological stream of administrative interventions, automated settlements, and compliance verifications.
          </p>
        </div>

        {/* Audit Log Table */}
        <RecentActivityTable events={auditEvents} onExportCsv={handleExportCsv} />
      </div>
    </div>
  );
}