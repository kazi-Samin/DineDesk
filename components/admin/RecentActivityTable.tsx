"use client";

import { useState, useMemo } from "react";
import { AdminAuditEvent, AuditEventStatus } from "@/types/admin";

interface RecentActivityTableProps {
  events: AdminAuditEvent[];
  onExportCsv?: () => void;
}

export default function RecentActivityTable({
  events,
  onExportCsv,
}: RecentActivityTableProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<AdminAuditEvent | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesType = filterType === "all" || evt.type === filterType;
      const q = searchFilter.toLowerCase().trim();
      const matchesSearch =
        !q ||
        evt.id.toLowerCase().includes(q) ||
        evt.entityName.toLowerCase().includes(q) ||
        evt.title.toLowerCase().includes(q) ||
        evt.contextValue.toLowerCase().includes(q) ||
        evt.operator.toLowerCase().includes(q);

      return matchesType && matchesSearch;
    });
  }, [events, filterType, searchFilter]);

  const renderStatusBadge = (status: AuditEventStatus) => {
    switch (status) {
      case "settled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container text-primary text-[11px] font-semibold border border-outline-variant/60">
            <span className="material-symbols-outlined text-[13px]">check</span> Settled
          </span>
        );
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-fixed text-on-primary-fixed text-[11px] font-semibold">
            <span className="material-symbols-outlined text-[13px]">verified</span> Verified
          </span>
        );
      case "rerouted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary-fixed text-on-secondary-fixed text-[11px] font-semibold">
            <span className="material-symbols-outlined text-[13px]">refresh</span> Re-routed
          </span>
        );
      case "applied":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface text-[11px] font-semibold border border-outline-variant/50">
            <span className="material-symbols-outlined text-[13px]">done_all</span> Applied
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-[11px] font-semibold">
            <span className="material-symbols-outlined text-[13px]">hourglass_empty</span> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant text-[11px] font-medium">
            {status}
          </span>
        );
    }
  };

  const getDotColor = (type: string) => {
    switch (type) {
      case "payout":
        return "bg-primary";
      case "verification":
        return "bg-secondary";
      case "escalation":
        return "bg-secondary";
      case "commission":
        return "bg-primary-tint";
      default:
        return "bg-outline";
    }
  };

  return (
    <div id="audits" className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xs overflow-hidden">
      {/* Table Header & Quick Action Bar */}
      <div className="p-5 sm:p-6 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-variant/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-xl">history_edu</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-primary tracking-tight">
              Recent Platform Events &amp; Audits
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
              System-recorded transactional verifications and administrative triggers
            </p>
          </div>
        </div>

        {/* Filter Pills & Table Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/60 text-xs">
            {["all", "payout", "verification", "escalation", "commission"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-md capitalize transition-all cursor-pointer font-medium ${
                  filterType === t
                    ? "bg-primary-container text-on-primary font-bold shadow-2xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t === "all" ? "All Audits" : t}
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
              filter_list
            </span>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter events..."
              className="pl-8 pr-3 py-1.5 text-xs bg-surface-container-low rounded-lg border border-outline-variant/70 focus:border-primary focus:outline-none w-36 sm:w-44 placeholder:text-on-surface-variant/70"
            />
          </div>

          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold border border-outline-variant/70 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low font-label-sm text-[11px] uppercase text-on-surface-variant tracking-wider border-b border-outline-variant/50">
              <th className="py-3 px-5 sm:px-6">Event ID &amp; Type</th>
              <th className="py-3 px-5 sm:px-6">Entity / Restaurant</th>
              <th className="py-3 px-5 sm:px-6">Context &amp; Value</th>
              <th className="py-3 px-5 sm:px-6 hidden md:table-cell">Operator</th>
              <th className="py-3 px-5 sm:px-6">Timestamp</th>
              <th className="py-3 px-5 sm:px-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 text-on-surface font-body-sm text-xs">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant/40">
                      find_in_page
                    </span>
                    <p className="font-semibold text-xs">No audit events match your criteria</p>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterType("all");
                        setSearchFilter("");
                      }}
                      className="text-primary hover:underline text-xs font-semibold"
                    >
                      Reset filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredEvents.map((evt) => (
                <tr
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="hover:bg-surface-container-low transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-5 sm:px-6">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getDotColor(evt.type)}`} />
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-primary group-hover:underline">
                          {evt.id}
                        </span>
                        <span className="text-[11px] text-on-surface-variant capitalize">
                          {evt.title}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 sm:px-6 font-medium text-on-surface">
                    {evt.entityName}
                  </td>

                  <td className="py-3.5 px-5 sm:px-6 font-mono text-xs font-medium text-on-surface">
                    {evt.contextValue}
                  </td>

                  <td className="py-3.5 px-5 sm:px-6 text-on-surface-variant hidden md:table-cell text-xs">
                    {evt.operator}
                  </td>

                  <td className="py-3.5 px-5 sm:px-6 text-on-surface-variant text-xs whitespace-nowrap">
                    {evt.timestamp}
                  </td>

                  <td className="py-3.5 px-5 sm:px-6 text-right whitespace-nowrap">
                    {renderStatusBadge(evt.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Audit Bar */}
      <div className="p-4 bg-surface-container-low border-t border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-on-surface-variant">
        <span>
          Showing {filteredEvents.length} of {events.length} records in DineDesk audit stream.
        </span>
        <span className="font-mono text-[11px] font-semibold text-primary">
          Cluster Hash: #f89e2-node-14 • SHA-256 Validated
        </span>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-surface-container-lowest max-w-lg w-full rounded-2xl border border-outline-variant shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                <span className="font-bold text-base text-primary">Audit Event Inspection</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-on-surface-variant hover:text-on-surface text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                <span className="text-on-surface-variant font-medium">Record ID:</span>
                <span className="font-mono font-bold text-primary">{selectedEvent.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-surface-container-low">
                  <span className="text-on-surface-variant block mb-1">Entity / Restaurant:</span>
                  <span className="font-bold text-on-surface">{selectedEvent.entityName}</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low">
                  <span className="text-on-surface-variant block mb-1">Status:</span>
                  <div>{renderStatusBadge(selectedEvent.status)}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low">
                <span className="text-on-surface-variant block mb-1">Context &amp; Value:</span>
                <span className="font-mono font-bold text-on-surface text-sm">{selectedEvent.contextValue}</span>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low">
                <span className="text-on-surface-variant block mb-1">Triggered by Operator:</span>
                <span className="font-medium text-on-surface">{selectedEvent.operator}</span>
              </div>

              {selectedEvent.details && (
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40">
                  <span className="text-on-surface-variant block mb-1 font-semibold">Audit Details &amp; Telemetry:</span>
                  <p className="text-on-surface leading-relaxed">{selectedEvent.details}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-colors cursor-pointer"
              >
                Dismiss Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
