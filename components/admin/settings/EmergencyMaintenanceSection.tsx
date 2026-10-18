"use client";

import { useState } from "react";

interface EmergencyMaintenanceSectionProps {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  onRequestToggleMaintenance: (desiredState: boolean) => void;
  onMaintenanceMessageChange: (msg: string) => void;
}

export default function EmergencyMaintenanceSection({
  maintenanceMode,
  maintenanceMessage,
  onRequestToggleMaintenance,
  onMaintenanceMessageChange,
}: EmergencyMaintenanceSectionProps) {
  const [showPreview, setShowPreview] = useState(false);
  const maxCharLimit = 300;

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant shadow-2xs flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary border border-outline-variant/60">
            <span className="material-symbols-outlined text-[22px]">emergency_home</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
              Section 03
            </span>
            <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-primary">
              Emergency Operational State &amp; Maintenance Mode
            </h2>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-lg font-label-sm text-[11px] font-bold uppercase tracking-wider">
          Kill Switch Control
        </span>
      </div>

      {/* Maintenance Mode Master Switch Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-surface-container-low rounded-xl border border-outline-variant/60">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-on-surface">
              Maintenance Mode Master Switch
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                maintenanceMode
                  ? "bg-rose-100 text-rose-800 border border-rose-300 animate-pulse"
                  : "bg-surface-container text-on-surface-variant border border-outline-variant"
              }`}
            >
              {maintenanceMode ? "Active (Suspended)" : "Standby"}
            </span>
          </div>
          <span className="text-xs text-on-surface-variant">
            {maintenanceMode
              ? "All new patron orders and table reservations are currently held in queue."
              : "Currently disabled. Diner traffic routing through edge cluster EU-1."}
          </span>
        </div>

        {/* Switch that triggers confirmation */}
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={maintenanceMode}
            onChange={(e) => onRequestToggleMaintenance(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-14 h-7 rounded-full transition-colors relative flex items-center p-0.5 ${
              maintenanceMode ? "bg-secondary" : "bg-surface-container-highest"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-surface-container-lowest shadow-xs transform transition-transform ${
                maintenanceMode ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </div>
        </label>
      </div>

      {/* Immediate Platform Ramifications Box */}
      <div className="p-4 rounded-xl bg-surface-container border border-outline-variant flex items-start gap-3.5">
        <span className="material-symbols-outlined text-[24px] shrink-0 mt-0.5 text-secondary">
          warning
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-on-surface">
            Immediate Platform Ramifications
          </span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Activating Maintenance Mode will temporarily suspend new orders and table reservations
            for all diner web and mobile clients. Active kitchen orders will continue to process
            without interruption.
          </p>
        </div>
      </div>

      {/* Public Maintenance Notice Broadcast */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="maintenance-message" className="font-bold text-on-surface">
            Public Maintenance Notice Broadcast
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-primary hover:underline text-[11px] font-semibold cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">
                {showPreview ? "visibility_off" : "visibility"}
              </span>
              <span>{showPreview ? "Hide Preview" : "Live Diner Preview"}</span>
            </button>
            <span
              className={`text-[11px] font-mono ${
                maintenanceMessage.length > maxCharLimit ? "text-rose-600 font-bold" : "text-on-surface-variant"
              }`}
            >
              {maintenanceMessage.length}/{maxCharLimit}
            </span>
          </div>
        </div>

        <textarea
          id="maintenance-message"
          rows={3}
          value={maintenanceMessage}
          maxLength={maxCharLimit}
          onChange={(e) => onMaintenanceMessageChange(e.target.value)}
          className="w-full bg-surface-container-low text-on-surface text-xs font-medium p-4 rounded-xl border border-outline-variant outline-none focus:bg-surface-container-lowest transition-all resize-y"
          placeholder="Enter message displayed to diners during downtime..."
        />
        <span className="text-[11px] text-on-surface-variant">
          Supports plain text or localization strings. Emergency phone concierge will remain open.
        </span>

        {/* Live Diner Preview Box */}
        {showPreview && (
          <div className="mt-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-2 animate-in fade-in">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Customer Modal Display Preview
            </span>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/60 shadow-xs flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-2xl shrink-0">
                construction
              </span>
              <div>
                <h4 className="text-xs font-bold text-primary">Scheduled Maintenance in Progress</h4>
                <p className="text-xs text-on-surface mt-1 leading-relaxed whitespace-pre-wrap">
                  {maintenanceMessage || "Platform upgrades in progress."}
                </p>
                <div className="mt-2 text-[10px] text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">call</span>
                  <span>Concierge Hotline: +880 (2) 988-4421</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
