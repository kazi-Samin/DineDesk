"use client";

import Image from "next/image";
import Link from "next/link";

interface SettingsSidebarProps {
  featuredCount: number;
  maxSlots: number;
}

export default function SettingsSidebarPanels({
  featuredCount,
  maxSlots = 8,
}: SettingsSidebarProps) {
  const percentage = Math.round((featuredCount / maxSlots) * 100);
  const remainingSlots = Math.max(0, maxSlots - featuredCount);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Visual Atmosphere Panel */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-2xs flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
            Visual Atmosphere
          </span>
          <span className="font-label-sm text-xs text-primary font-bold">Bespoke Curation</span>
        </div>

        <div className="relative rounded-xl overflow-hidden h-44 bg-surface-container border border-outline-variant/60">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkzt8YSL3wvfAeB2Tbck_QrHDBQI3WVDtsVBPdxz5Bq3U_4dKOv1B8GIYpLrchaLxJanNgAtcDJyBcNmac1GIWXdyaryXorRTZfLBCWwZjvY_z8TzXhk5yvn6iLZpxb41pLVMZ5mEc4EM8O73Zoq6r22ia0KHq4MMxrjMifonMbOcLlsfLyKIJUQKl9dFlSJSslcw4Zzv37jybRqGIgCkm_1j79a71Hx63j3UnwJpSnNqRmW_paRWAdA"
            alt="Fine dining table set with artisanal ceramic plates"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 350px"
          />
          <div className="absolute inset-0 bg-linear-to-t from-primary/90 via-primary/30 to-transparent flex flex-col justify-end p-4">
            <span className="font-label-sm text-[10px] text-on-primary/80 uppercase tracking-wider font-semibold">
              Featured Spotlights
            </span>
            <span className="font-headline-sm text-sm font-bold text-on-primary">
              Fine Hospitality Standards
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Active Featured Partners</span>
            <span className="font-bold text-on-surface">
              {featuredCount} of {maxSlots} filled
            </span>
          </div>
          <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between font-label-sm text-[11px] text-on-surface-variant">
            <span>Dhaka Metropolitan Hub</span>
            <span className="font-semibold text-secondary">
              {remainingSlots} {remainingSlots === 1 ? "Slot" : "Slots"} Available
            </span>
          </div>
        </div>
      </div>

      {/* 2. Governance Telemetry Panel */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-2xs flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
            Governance Telemetry
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
        </div>

        <div className="flex flex-col gap-4 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 border border-outline-variant/60">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-on-surface">Multi-Admin Consensus</span>
              <span className="text-on-surface-variant text-[11px]">
                Critical rate changes notify Super Admin circle via encrypted Slack dispatch.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 border border-outline-variant/60">
              <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-on-surface">Edge Invalidation</span>
              <span className="text-on-surface-variant text-[11px]">
                Settings sync to regional Redis nodes within 450ms of saving.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 border border-outline-variant/60">
              <span className="material-symbols-outlined text-[18px]">history_edu</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-on-surface">Immutable Audit Trail</span>
              <span className="text-on-surface-variant text-[11px]">
                All configuration deltas are cataloged under ISO-27001 compliant storage.
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-outline-variant/50">
          <Link
            href="/dashboard/admin/audit-logs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-secondary transition-colors"
          >
            <span>Inspect Configuration Changelog</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* 3. Emergency Hotline Card */}
      <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant flex flex-col gap-3">
        <div className="flex items-center gap-2 text-secondary">
          <span className="material-symbols-outlined text-[22px]">contact_support</span>
          <span className="font-headline-sm text-base font-bold text-on-surface">
            Emergency Hotline
          </span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          During maintenance windows or urgent triage, high-priority partner inquiries are routed
          directly to the Central Operations Desk in Gulshan.
        </p>
        <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant flex items-center justify-between text-xs shadow-2xs">
          <span className="text-on-surface-variant font-medium">Priority Ops Line:</span>
          <span className="font-mono font-bold text-primary text-sm">+880 (2) 988-4421</span>
        </div>
      </div>
    </div>
  );
}
