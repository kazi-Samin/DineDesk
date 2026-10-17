"use client";

import { MenuSummaryStats } from "@/types/menu";

interface MenuSummaryCardsProps {
  stats: MenuSummaryStats;
}

export default function MenuSummaryCards({ stats }: MenuSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
      {/* 1. Total Curated Dishes */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-2xs flex items-center justify-between border border-outline-variant">
        <div>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Total Curated Dishes
          </span>
          <p className="font-headline-md text-headline-md text-on-surface font-semibold mt-0.5">
            {stats.totalDishes}
          </p>
          <span className="font-body-sm text-body-sm text-primary font-medium">
            {stats.featuredDishesCount} Heritage specials
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
          <span className="material-symbols-outlined text-2xl">dinner_dining</span>
        </div>
      </div>

      {/* 2. Live In-Kitchen */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-2xs flex items-center justify-between border border-outline-variant">
        <div>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Live In-Kitchen
          </span>
          <p className="font-headline-md text-headline-md text-on-surface font-semibold mt-0.5">
            {stats.liveInKitchenCount}
          </p>
          <span className="font-body-sm text-body-sm text-emerald-700 font-medium">
            {stats.availabilityPercent}% Available
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary-fixed/40 flex items-center justify-center text-primary flex-shrink-0">
          <span className="material-symbols-outlined text-2xl">check_circle</span>
        </div>
      </div>

      {/* 3. Sold Out Tonight */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-2xs flex items-center justify-between border border-outline-variant">
        <div>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Sold Out Tonight
          </span>
          <p className="font-headline-md text-headline-md text-secondary font-semibold mt-0.5">
            {stats.soldOutTonightCount}
          </p>
          <span className="font-body-sm text-body-sm text-secondary font-medium">
            {stats.soldOutTonightCount > 0 ? "Restocks 11:00 AM" : "All Available"}
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-secondary-fixed/50 flex items-center justify-center text-secondary flex-shrink-0">
          <span className="material-symbols-outlined text-2xl">production_quantity_limits</span>
        </div>
      </div>

      {/* 4. Avg Dish Margin */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-2xs flex items-center justify-between border border-outline-variant">
        <div>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Avg Dish Margin
          </span>
          <p className="font-headline-md text-headline-md text-on-surface font-semibold mt-0.5">
            {stats.avgDishMargin}%
          </p>
          <span className="font-body-sm text-body-sm text-on-surface-variant truncate block max-w-[130px]">
            Top: {stats.topSellingDish}
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
          <span className="material-symbols-outlined text-2xl">query_stats</span>
        </div>
      </div>
    </div>
  );
}
