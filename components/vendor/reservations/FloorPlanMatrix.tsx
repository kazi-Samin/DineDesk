"use client";

import { useState } from "react";
import { TableEntity } from "@/types/reservation";

interface FloorPlanMatrixProps {
  tables: TableEntity[];
  onOpenFloorManager: () => void;
  onSelectTable?: (table: TableEntity) => void;
}

export default function FloorPlanMatrix({
  tables,
  onOpenFloorManager,
  onSelectTable,
}: FloorPlanMatrixProps) {
  const [selectedTable, setSelectedTable] = useState<TableEntity | null>(null);

  const courtyardTables = tables.filter((t) => t.zone === "Courtyard Terrace" && !t.id.startsWith("B-"));
  const mainTables = tables.filter((t) => t.zone === "Main Dining Hall" && !t.id.startsWith("B-"));
  const heritageTables = tables.filter((t) => t.zone === "Private Heritage Dining" && !t.id.startsWith("B-"));

  const courtyardFree = courtyardTables.filter((t) => t.status === "available").length;
  const mainFree = mainTables.filter((t) => t.status === "available").length;
  const heritageFree = heritageTables.filter((t) => t.status === "available").length;

  const handleTableClick = (table: TableEntity) => {
    setSelectedTable(selectedTable?.id === table.id ? null : table);
    if (onSelectTable) {
      onSelectTable(table);
    }
  };

  const getTableStyle = (table: TableEntity) => {
    if (table.status === "occupied") {
      return "bg-secondary text-on-secondary shadow-xs";
    }
    if (table.status === "reserved") {
      return "bg-primary-container text-on-primary shadow-xs";
    }
    if (table.status === "assigned") {
      return "bg-primary-container text-on-primary shadow-xs ring-2 ring-secondary ring-offset-1";
    }
    return "bg-surface-container-high text-on-surface hover:bg-surface-container";
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-2xs border border-outline-variant space-y-space-md relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">map</span>
          <h2 className="font-headline-sm text-headline-sm text-primary font-medium">
            Floor Plan Matrix
          </h2>
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          Live Layout (24 Tables)
        </span>
      </div>

      {/* Color Coding Legend */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-primary-container"></span>
          <span>Reserved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-secondary"></span>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-surface-container-high border border-outline-variant/40"></span>
          <span>Available</span>
        </div>
      </div>

      {/* Selected Table Popover Details */}
      {selectedTable && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl animate-in fade-in space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-label-md font-bold text-primary">
              {selectedTable.label}
            </span>
            <button
              onClick={() => setSelectedTable(null)}
              className="text-on-surface-variant hover:text-on-surface text-xs"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-on-surface-variant">
            Capacity: <strong>{selectedTable.capacity} guests</strong> • Status:{" "}
            <span className="capitalize font-semibold text-primary">
              {selectedTable.status}
            </span>
          </p>
          {selectedTable.currentGuest && (
            <p className="text-xs text-secondary font-medium">
              Occupant: {selectedTable.currentGuest}
            </p>
          )}
        </div>
      )}

      {/* Section 1: Courtyard Terrace (C1 - C6) */}
      <div className="space-y-space-xs">
        <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wide">
          <span>Courtyard Terrace (6 Tables)</span>
          <span className="text-primary font-semibold">{courtyardFree} Free</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {courtyardTables.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTableClick(t)}
              type="button"
              className={`p-2.5 rounded-lg flex flex-col items-center justify-center text-center transition-all cursor-pointer ${getTableStyle(
                t
              )} ${selectedTable?.id === t.id ? "scale-105 ring-2 ring-primary" : ""}`}
            >
              <span className="font-label-md text-label-md font-bold">{t.shortName}</span>
              <span className="font-label-sm text-[11px] opacity-90 truncate max-w-full">
                {t.capacity}-top ({t.status === "available" ? "Free" : t.status === "occupied" ? "Seated" : "Booked"})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Section 2: Main Dining Hall (T1 - T8) */}
      <div className="space-y-space-xs pt-space-xs border-t border-outline-variant/30">
        <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wide">
          <span>Main Dining Hall (8 Tables)</span>
          <span className="text-primary font-semibold">{mainFree} Free</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {mainTables.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTableClick(t)}
              type="button"
              className={`p-2 rounded-lg text-center transition-all cursor-pointer ${getTableStyle(
                t
              )} ${selectedTable?.id === t.id ? "scale-105 ring-2 ring-primary" : ""}`}
            >
              <span className="block font-label-md text-label-md font-bold">{t.shortName}</span>
              <span className="font-label-sm text-[10px] opacity-90 block truncate">
                {t.capacity}-top
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Section 3: Private Heritage Chambers (P1 - P4) */}
      <div className="space-y-space-xs pt-space-xs border-t border-outline-variant/30">
        <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wide">
          <span>Private Heritage Dining (4 Suites)</span>
          <span className="text-primary font-semibold">{heritageFree} Free</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {heritageTables.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTableClick(t)}
              type="button"
              className={`p-3 rounded-lg flex items-center justify-between text-left transition-all cursor-pointer ${getTableStyle(
                t
              )} ${selectedTable?.id === t.id ? "scale-105 ring-2 ring-primary" : ""}`}
            >
              <div>
                <span className="block font-label-md text-label-md font-bold">{t.shortName}</span>
                <span className="font-label-sm text-[11px] opacity-90 block">
                  Capacity: {t.capacity} pax
                </span>
              </div>
              <span
                className={`font-label-sm text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                  t.status === "available"
                    ? "bg-surface text-primary"
                    : t.status === "occupied"
                    ? "bg-secondary-fixed text-on-secondary-fixed"
                    : "bg-primary text-on-primary"
                }`}
              >
                {t.status === "available" ? "Vacant" : t.status === "occupied" ? "Dining" : "Booked"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Open Interactive Floor Manager Button */}
      <div className="pt-space-xs">
        <button
          onClick={onOpenFloorManager}
          className="w-full py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          type="button"
        >
          <span className="material-symbols-outlined text-base">zoom_out_map</span>
          <span>Open Interactive Floor Manager</span>
        </button>
      </div>
    </div>
  );
}
