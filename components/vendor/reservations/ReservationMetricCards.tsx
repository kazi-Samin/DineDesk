"use client";

import { ReservationStats } from "@/types/reservation";

interface ReservationMetricCardsProps {
  stats: ReservationStats;
}

export default function ReservationMetricCards({ stats }: ReservationMetricCardsProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
      {/* Metric 1: Confirmed Covers */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Confirmed Covers
          </span>
          <span className="p-1.5 rounded-lg bg-surface-container text-primary">
            <span className="material-symbols-outlined text-lg">group</span>
          </span>
        </div>
        <div className="mt-space-md">
          <div className="flex items-baseline gap-space-xs">
            <span className="font-display text-display text-primary leading-none">
              {stats.confirmedCovers}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">guests</span>
          </div>
          <div className="mt-space-xs flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              {stats.allocatedTablesCount} tables allocated
            </span>
            <span className="inline-flex items-center gap-0.5 font-label-sm text-label-sm text-primary font-semibold">
              <span className="material-symbols-outlined text-xs">arrow_upward</span> +14% vs avg
            </span>
          </div>
        </div>
        <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-sm overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.round((stats.confirmedCovers / 80) * 100))}%` }}
          ></div>
        </div>
      </div>

      {/* Metric 2: Pending Requests */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Pending Action
          </span>
          <span className="p-1.5 rounded-lg bg-secondary/15 text-secondary">
            <span className="material-symbols-outlined text-lg">pending_actions</span>
          </span>
        </div>
        <div className="mt-space-md">
          <div className="flex items-baseline gap-space-xs">
            <span className="font-display text-display text-secondary leading-none">
              {stats.pendingCount}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">awaiting decision</span>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-space-xs">
            Oldest submitted {stats.oldestPendingAge}
          </p>
        </div>
        <div className="mt-space-sm flex items-center gap-1.5">
          {stats.urgentSlots ? (
            <>
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
              <span className="font-label-sm text-label-sm text-secondary font-semibold">
                Urgent dinner slots
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span className="font-label-sm text-label-sm text-primary font-semibold">
                Queue all clear
              </span>
            </>
          )}
        </div>
      </div>

      {/* Metric 3: Occupancy Rate */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Peak Occupancy
          </span>
          <span className="p-1.5 rounded-lg bg-surface-container text-primary">
            <span className="material-symbols-outlined text-lg">pie_chart</span>
          </span>
        </div>
        <div className="mt-space-md">
          <div className="flex items-baseline gap-space-xs">
            <span className="font-display text-display text-primary leading-none">
              {stats.occupancyRate}%
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">service capacity</span>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-space-xs">
            Peak window: {stats.peakWindow}
          </p>
        </div>
        <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-sm overflow-hidden">
          <div
            className="bg-primary-container h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.occupancyRate}%` }}
          ></div>
        </div>
      </div>

      {/* Metric 4: Capacity & Zones */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Floor Status
          </span>
          <span className="p-1.5 rounded-lg bg-surface-container text-primary">
            <span className="material-symbols-outlined text-lg">meeting_room</span>
          </span>
        </div>
        <div className="mt-space-md">
          <div className="flex items-baseline gap-space-xs">
            <span className="font-display text-display text-primary leading-none">
              {stats.totalTables}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">total tables</span>
          </div>
          <div className="mt-space-xs flex items-center gap-space-sm text-on-surface-variant font-label-sm text-label-sm">
            <span>Main ({stats.mainHallCount})</span>
            <span>•</span>
            <span>Courtyard ({stats.courtyardCount})</span>
            <span>•</span>
            <span>Heritage ({stats.heritageCount})</span>
          </div>
        </div>
        <div className="mt-space-sm flex items-center justify-between font-label-sm text-label-sm">
          <span className="text-primary font-semibold">
            {stats.availableWalkInCount} Free for Walk-ins
          </span>
          <span className="text-on-surface-variant">Live POS Synced</span>
        </div>
      </div>
    </section>
  );
}
