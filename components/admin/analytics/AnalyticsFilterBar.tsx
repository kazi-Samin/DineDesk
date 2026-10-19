"use client";

import { useState } from "react";
import { AdminTimeRange } from "@/types/admin";

interface AnalyticsFilterBarProps {
  timeRange: AdminTimeRange;
  dateRangeLabel: string;
  showBaseline: boolean;
  onTimeRangeChange: (range: AdminTimeRange) => void;
  onToggleBaseline: (val: boolean) => void;
  onCustomDateChange?: (start: string, end: string) => void;
  onExportCsv?: () => void;
  onGenerateReport?: () => void;
}

export default function AnalyticsFilterBar({
  timeRange,
  dateRangeLabel,
  showBaseline,
  onTimeRangeChange,
  onToggleBaseline,
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

  const timeRangeOptions: { id: AdminTimeRange; label: string }[] = [
    { id: "ytd", label: "Year to Date (2025)" },
    { id: "q3", label: "Q3 Cumulative" },
    { id: "12m", label: "Trailing 12M" },
    { id: "30d", label: "Last 30 Days" },
  ];

  return (
    <div className="flex flex-col gap-5 pb-2">
      {/* Top Header Row with Kicker and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        {/* Title & Hierarchy */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-secondary">
              The Maple &amp; Vine • Business Intelligence
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-surface-tint animate-pulse" />
            <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
              Corktown, Detroit
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Performance Analytics &amp; Revenue Trends
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl">
            Gross revenue trajectory, dining room station throughput, covers fulfilled, and operational economics for 2414 Michigan Ave.
          </p>
        </div>

        {/* Top Right Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Baseline Toggle Switch */}
          <label className="flex items-center gap-2.5 bg-surface-container-lowest px-3 py-2 rounded-xl border border-outline-variant shadow-2xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showBaseline}
              onChange={(e) => onToggleBaseline(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                showBaseline ? "bg-primary-container" : "bg-surface-container-high"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-surface-container-lowest shadow-xs transform transition-transform ${
                  showBaseline ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
            <span className="text-xs font-semibold text-on-surface">vs 2024 Baseline</span>
          </label>

          {/* Ledger Export CSV */}
          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="flex items-center gap-1.5 bg-surface-container-lowest hover:bg-surface-container text-on-surface px-3.5 py-2 rounded-xl text-xs font-semibold border border-outline-variant shadow-2xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-primary">file_download</span>
              <span>Ledger Export</span>
            </button>
          )}

          {/* Generate Executive Dossier */}
          {onGenerateReport && (
            <button
              type="button"
              onClick={onGenerateReport}
              className="flex items-center gap-1.5 bg-primary-container text-on-primary hover:opacity-95 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>Executive Brief</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Period Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-outline-variant/60">
        {/* Time Preset Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-surface-container-lowest p-1 rounded-xl border border-outline-variant text-xs">
          {timeRangeOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onTimeRangeChange(opt.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                timeRange === opt.id
                  ? "bg-primary-container text-on-primary shadow-2xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              {opt.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCustomModalOpen(true)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              timeRange === "custom"
                ? "bg-primary-container text-on-primary shadow-2xs"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            Custom
          </button>
        </div>

        {/* Active Range Indicator */}
        <div className="flex items-center gap-2 text-xs text-on-surface-variant px-1">
          <span className="material-symbols-outlined text-[16px] text-secondary">calendar_today</span>
          <span className="font-medium text-on-surface">{dateRangeLabel}</span>
        </div>
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
              <h3 className="text-sm font-bold text-primary font-headline-sm">Custom Date Window</h3>
              <button
                type="button"
                onClick={() => setCustomModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-on-surface mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant text-on-surface focus:outline-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant text-on-surface focus:outline-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/50">
              <button
                type="button"
                onClick={() => setCustomModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCustom}
                className="px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary text-xs font-semibold hover:opacity-95 cursor-pointer"
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
