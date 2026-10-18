"use client";

import { AdminGovernanceMetrics } from "@/types/admin";

interface AdminMetricsRibbonProps {
  metrics: AdminGovernanceMetrics;
}

export default function AdminMetricsRibbon({ metrics }: AdminMetricsRibbonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Active Administrators */}
      <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-on-surface-variant">
          <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider">
            Active Administrators
          </span>
          <span className="material-symbols-outlined text-xl text-primary">
            shield_person
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-headline-md text-2xl sm:text-3xl font-bold text-primary">
            {metrics.activeAdmins}
          </span>
          <span className="font-label-sm text-xs text-on-surface-variant font-medium">
            / {metrics.totalSeats} designated seats
          </span>
        </div>
        <div className="mt-2 text-xs font-body-sm text-on-surface-variant">
          {metrics.elevatedBypassCount} with elevated regional bypass rights
        </div>
      </div>

      {/* 2. 2FA Compliance */}
      <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-on-surface-variant">
          <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider">
            2FA Compliance
          </span>
          <span className="material-symbols-outlined text-xl text-primary">
            lock_person
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-headline-md text-2xl sm:text-3xl font-bold text-primary">
            {metrics.twoFactorCompliancePct}%
          </span>
          <span className="font-label-sm text-xs font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded-full">
            {metrics.twoFactorNote}
          </span>
        </div>
        <div className="mt-2 text-xs font-body-sm text-on-surface-variant">
          Zero fallback SMS authentications permitted
        </div>
      </div>

      {/* 3. Average Idle Timeout */}
      <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-on-surface-variant">
          <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider">
            Average Idle Timeout
          </span>
          <span className="material-symbols-outlined text-xl text-secondary">
            timer
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-headline-md text-2xl sm:text-3xl font-bold text-primary">
            {metrics.idleTimeoutMinutes}m
          </span>
          <span className="font-label-sm text-xs text-on-surface-variant font-medium">
            Strict session lock
          </span>
        </div>
        <div className="mt-2 text-xs font-body-sm text-on-surface-variant">
          {metrics.idleTimeoutNote}
        </div>
      </div>

      {/* 4. Dual-Signoff Overrides */}
      <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-on-surface-variant">
          <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider">
            Dual-Signoff Overrides
          </span>
          <span className="material-symbols-outlined text-xl text-primary">
            rule
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-headline-md text-2xl sm:text-3xl font-bold text-primary">
            ৳{(metrics.dualSignoffThresholdBdt / 1000).toFixed(0)}K+
          </span>
          <span className="font-label-sm text-xs text-on-surface-variant font-medium">
            Threshold
          </span>
        </div>
        <div className="mt-2 text-xs font-body-sm text-on-surface-variant">
          {metrics.dualSignoffNote}
        </div>
      </div>
    </div>
  );
}
