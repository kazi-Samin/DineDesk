"use client";

import { useState } from "react";
import { TableEntity, SeatingZone } from "@/types/reservation";

interface InteractiveFloorManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableEntity[];
  onUpdateTableStatus?: (tableId: string, newStatus: TableEntity["status"]) => void;
}

export default function InteractiveFloorManagerModal({
  isOpen,
  onClose,
  tables,
}: InteractiveFloorManagerModalProps) {
  const [filterZone, setFilterZone] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  if (!isOpen) return null;

  const filteredTables = tables.filter((t) => {
    if (filterZone !== "all" && t.zone !== filterZone) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status: TableEntity["status"]) => {
    switch (status) {
      case "occupied":
        return <span className="px-2 py-0.5 rounded bg-secondary text-on-secondary text-xs font-semibold">Occupied</span>;
      case "reserved":
        return <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary text-xs font-semibold">Reserved</span>;
      case "assigned":
        return <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary text-xs font-semibold ring-1 ring-secondary">Assigned</span>;
      case "available":
      default:
        return <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface text-xs font-semibold">Available</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-primary-container text-on-primary">
              <span className="material-symbols-outlined text-xl">zoom_out_map</span>
            </span>
            <div>
              <h3 className="font-headline-sm text-xl font-bold text-primary">
                Interactive Floor Manager
              </h3>
              <p className="text-xs text-on-surface-variant">
                Live seat inventory, zone capacities, and floor allocation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="px-6 py-3 bg-surface-container-lowest border-b border-outline-variant/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-on-surface-variant uppercase">Zone:</span>
            {["all", "Courtyard Terrace", "Main Dining Hall", "Private Heritage Dining"].map((zone) => (
              <button
                key={zone}
                type="button"
                onClick={() => setFilterZone(zone)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  filterZone === zone
                    ? "bg-primary-container text-on-primary"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {zone === "all" ? "All Zones" : zone}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-on-surface-variant uppercase">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-surface-container-low px-2 py-1 rounded-lg border border-outline-variant text-xs text-on-surface focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="occupied">Occupied</option>
            </select>
          </div>
        </div>

        {/* Grid Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTables.map((table) => (
              <div
                key={table.id}
                className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/50 hover:bg-surface-container-low transition-colors space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-base font-bold text-primary">
                      {table.shortName}
                    </span>
                    {getStatusBadge(table.status)}
                  </div>
                  <span className="text-[11px] font-medium text-on-surface-variant block mt-1">
                    {table.zone}
                  </span>
                </div>

                <div className="pt-2 border-t border-outline-variant/30 space-y-1">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span>Capacity:</span>
                    <span className="font-semibold text-on-surface">{table.capacity} Guests</span>
                  </div>
                  {table.currentGuest && (
                    <div className="text-[11px] text-secondary font-medium truncate">
                      {table.currentGuest}
                    </div>
                  )}
                  {table.reservationId && (
                    <div className="text-[10px] text-on-surface-variant font-mono">
                      Ref: {table.reservationId}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-surface-container-low border-t border-outline-variant/40 flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">
            Showing {filteredTables.length} of {tables.length} tables in inventory
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
