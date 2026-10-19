"use client";

import { VendorOrderStats } from "@/services/mockOrderService";

interface VendorSummaryCardsProps {
  stats: VendorOrderStats;
}

export default function VendorSummaryCards({ stats }: VendorSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
      {/* Stat 1: Today's Revenue */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-2xs border border-outline-variant flex flex-col justify-between">
        <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
          <span className="font-label-md text-label-md uppercase tracking-wider">Today&apos;s Revenue</span>
          <span className="material-symbols-outlined text-primary text-xl">payments</span>
        </div>
        <div className="flex items-baseline gap-space-xs">
          <span className="font-headline-lg text-2xl lg:text-3xl text-primary tracking-tight font-display font-medium">
            $ {stats.todayRevenue.toLocaleString()}
          </span>
          <span className="inline-flex items-center font-label-sm text-[11px] text-emerald-800 bg-surface-container px-1.5 py-0.5 rounded-lg font-semibold">
            <span className="material-symbols-outlined text-xs mr-0.5">trending_up</span>+14%
          </span>
        </div>
        <span className="font-body-sm text-[12px] text-on-surface-variant mt-space-xs">
          From {stats.totalOrders} total bookings &amp; dispatches
        </span>
      </div>

      {/* Stat 2: Active Orders / In Queue */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-2xs border border-outline-variant flex flex-col justify-between">
        <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
          <span className="font-label-md text-label-md uppercase tracking-wider">Active Queue</span>
          <span className="material-symbols-outlined text-secondary text-xl">local_fire_department</span>
        </div>
        <div className="flex items-baseline gap-space-xs">
          <span className="font-headline-lg text-2xl lg:text-3xl text-primary tracking-tight font-display font-medium">
            {stats.newOrders + stats.preparing + stats.outForDelivery}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">in kitchen stream</span>
        </div>
        <div className="flex items-center gap-space-xs font-label-sm text-[11px] mt-space-xs text-on-surface-variant">
          <span className="text-secondary font-semibold">{stats.newOrders} pending</span>
          <span>•</span>
          <span>{stats.preparing} prep</span>
          <span>•</span>
          <span>{stats.outForDelivery} transit</span>
        </div>
      </div>

      {/* Stat 3: Avg Prep Speed */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-2xs border border-outline-variant flex flex-col justify-between">
        <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
          <span className="font-label-md text-label-md uppercase tracking-wider">Avg. Prep Speed</span>
          <span className="material-symbols-outlined text-primary text-xl">avg_pace</span>
        </div>
        <div className="flex items-baseline gap-space-xs">
          <span className="font-headline-lg text-2xl lg:text-3xl text-primary tracking-tight font-display font-medium">
            22
          </span>
          <span className="font-label-lg text-label-lg text-on-surface-variant">mins</span>
          <span className="inline-flex items-center font-label-sm text-[11px] text-emerald-800 bg-surface-container px-1.5 py-0.5 rounded-lg font-semibold ml-2">
            Target 25m
          </span>
        </div>
        <div className="w-full bg-surface-container h-1.5 rounded-full mt-space-xs overflow-hidden">
          <div className="bg-primary-container h-full rounded-full" style={{ width: "72%" }}></div>
        </div>
      </div>

      {/* Stat 4: Completed Orders Today */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-2xs border border-outline-variant flex flex-col justify-between">
        <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
          <span className="font-label-md text-label-md uppercase tracking-wider">Completed Today</span>
          <span className="material-symbols-outlined text-primary text-xl">verified</span>
        </div>
        <div className="flex items-baseline gap-space-xs">
          <span className="font-headline-lg text-2xl lg:text-3xl text-primary tracking-tight font-display font-medium">
            {stats.completedToday}
          </span>
          <span className="font-body-sm text-body-sm text-emerald-800 font-semibold">
            {stats.completedToday > 0 ? "100% on-time" : "Awaiting finishes"}
          </span>
        </div>
        <span className="font-body-sm text-[12px] text-on-surface-variant mt-space-xs">
          98.4% Gold Tier fulfillment audit
        </span>
      </div>
    </div>
  );
}
