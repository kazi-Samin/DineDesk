"use client";

import { OperationalHealth } from "@/types/admin";

interface OperationalHealthPanelProps {
  health: OperationalHealth;
}

export default function OperationalHealthPanel({
  health,
}: OperationalHealthPanelProps) {
  return (
    <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-xl border border-outline-variant shadow-2xs flex flex-col justify-between min-h-[440px]">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
          <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-primary tracking-tight">
            Operational Health
          </h2>
        </div>
        <span className="font-label-sm text-[11px] px-2 py-0.5 rounded bg-surface-container font-semibold text-primary border border-outline-variant/60">
          Live Fleet
        </span>
      </div>

      {/* 4 Metric Cards */}
      <div className="flex flex-col gap-3.5 my-auto py-2">
        {/* Metric 1: Fleet */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">
              Active Delivery Fleet
            </span>
            <span className="material-symbols-outlined text-[18px] text-primary">
              two_wheeler
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline-sm text-base sm:text-lg font-bold text-primary">
              {health.activeCouriers} Couriers
            </span>
            <span className="text-xs font-bold text-primary">
              {health.courierCapacityPct}% capacity
            </span>
          </div>
          <div className="w-full bg-surface-dim h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${health.courierCapacityPct}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Dispute Rate */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">
              Order Dispute Rate
            </span>
            <span className="material-symbols-outlined text-[18px] text-secondary">
              shield
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline-sm text-base sm:text-lg font-bold text-primary">
              {health.disputeRatePct}%
            </span>
            <span className="text-[11px] text-on-surface-variant">
              Benchmark: {health.disputeBenchmarkPct}%
            </span>
          </div>
          <div className="w-full bg-surface-dim h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-secondary h-full rounded-full transition-all duration-500"
              style={{ width: `${(health.disputeRatePct / health.disputeBenchmarkPct) * 50}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Reservations Seated */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">
              Table Reservations Seated
            </span>
            <span className="material-symbols-outlined text-[18px] text-primary">
              event_seat
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline-sm text-base sm:text-lg font-bold text-primary">
              {health.seatedReservations.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-primary">
              +{health.seatedGrowthPct}% this month
            </span>
          </div>
          <div className="w-full bg-surface-dim h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `88%` }}
            />
          </div>
        </div>

        {/* Metric 4: Kitchen Prep Time */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">
              Avg Kitchen Prep Time
            </span>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              timelapse
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline-sm text-base sm:text-lg font-bold text-primary">
              {health.avgKitchenPrepMinutes} mins
            </span>
            <span className="text-xs font-bold text-primary">
              {health.prepTimeDeltaMinutes} min delta
            </span>
          </div>
          <div className="w-full bg-surface-dim h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-surface-tint h-full rounded-full transition-all duration-500"
              style={{ width: `72%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
