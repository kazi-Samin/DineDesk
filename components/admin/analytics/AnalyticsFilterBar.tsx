"use client";

import { useState } from "react";
import { AdminTimeRange } from "@/types/admin";

interface AnalyticsFilterBarProps {
  timeRange: AdminTimeRange;
  dateRangeLabel: string;
  onTimeRangeChange: (range: AdminTimeRange) => void;
  onCustomDateChange?: (start: string, end: string) => void;
  onExportCsv?: () => void;
  onGenerateReport?: () => void;
}

export default function AnalyticsFilterBar({
  timeRange,
  dateRangeLabel,
  onTimeRangeChange,
  onCustomDateChange,
  onExportCsv,
  onGenerateReport,
}: AnalyticsFilterBarProps) {
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customStart, setCustomStart] = useState("2025-10-01");
  const [customEnd, setCustomEnd] = useState("2025-10-31");

  const handleApplyCustom = () => {
    if (onCustomDateChange) {
      onCustomDateChange(customStart, customEnd);
    }
    onTimeRangeChange("custom");
    setCustomModalOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-outline-variant/50">
      {/* Title & Status */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-bold">
            Platform Telemetry
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
            Real-Time Analytics
          </span>
        </div>
        <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary tracking-tight">
          System-Wide Analytics
        </h1>
        <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5">
          Deep telemetry trends across customer demand, merchant operations, and dining reservations.
        </p>
      </div>

      {/* Controls: Date Range Filters & Exports */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Time Range Pills */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/70 text-xs">
          <button
            type="button"
            onClick={() => onTimeRangeChange("7d")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              timeRange === "7d"
                ? "bg-primary-container text-on-primary shadow-2xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            7 Days
          </button>

          <button
            type="button"
            onClick={() => onTimeRangeChange("30d")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              timeRange === "30d"
                ? "bg-primary-container text-on-primary shadow-2xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            30 Days
          </button>

          <button
            type="button"
            onClick={() => onTimeRangeChange("90d")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              timeRange === "90d"
                ? "bg-primary-container text-on-primary shadow-2xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            90 Days
          </button>

          <button
            type="button"
            onClick={() => setCustomModalOpen(true)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              timeRange === "custom"
                ? "bg-primary-container text-on-primary shadow-2xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Custom
          </button>
        </div>

        {/* Date Label Indicator */}
        <div className="hidden xl:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/60 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
          <span className="font-medium text-on-surface">{dateRangeLabel}</span>
        </div>

        {/* Export CSV Button */}
        {onExportCsv && (
          <button
            type="button"
            onClick={onExportCsv}
            className="flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface px-3 py-2 rounded-xl text-xs font-semibold border border-outline-variant/70 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">file_download</span>
            <span>Export CSV</span>
          </button>
        )}

        {/* Generate Report Button */}
        {onGenerateReport && (
          <button
            type="button"
            onClick={onGenerateReport}
            className="flex items-center gap-1.5 bg-primary-container text-on-primary hover:bg-primary px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">insights</span>
            <span>Generate Report</span>
          </button>
        )}
      </div>

      {/* Custom Date Range Modal */}
      {customModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setCustomModalOpen(false)}
        >
          <div
            className="bg-surface-container-lowest max-w-sm w-full rounded-2xl border border-outline-variant shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">date_range</span>
                <span className="font-bold text-sm text-primary">Custom Analytics Window</span>
              </div>
              <button
                type="button"
                onClick={() => setCustomModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-on-surface-variant mb-1 font-semibold">Start Date:</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full bg-surface-container-low p-2 rounded-lg border border-outline-variant focus:border-primary outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1 font-semibold">End Date:</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full bg-surface-container-low p-2 rounded-lg border border-outline-variant focus:border-primary outline-none text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCustomModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCustom}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary-container text-on-primary hover:bg-primary transition-colors cursor-pointer"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
