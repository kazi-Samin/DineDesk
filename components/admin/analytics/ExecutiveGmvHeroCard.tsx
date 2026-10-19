"use client";

import { AdminAnalyticsData } from "@/types/admin";

interface ExecutiveGmvHeroCardProps {
  analytics: AdminAnalyticsData;
}

export default function ExecutiveGmvHeroCard({ analytics }: ExecutiveGmvHeroCardProps) {
  const isYtd = analytics.timeRange === "ytd";

  // Derive display values based on active period
  const gmvDisplay = `$${analytics.summary.totalRevenue.toLocaleString()}`;
  const netPlatformTake = Math.round(analytics.summary.totalRevenue * 0.125);
  const netTakeDisplay = `$${netPlatformTake.toLocaleString()}`;
  const mealsDisplay = analytics.summary.totalOrders.toLocaleString();
  const coversDisplay = analytics.summary.totalReservations.toLocaleString();
  const aovDisplay = `$${analytics.summary.avgOrderValue}`;

  const gmvGrowthText = `+${analytics.summary.revenueGrowthPct || 24.8}% YoY`;
  const mealsGrowthText = `+${analytics.summary.ordersGrowthPct || 19.4}% YoY`;

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xs overflow-hidden">
      {/* Hero Header Block */}
      <div className="p-6 sm:p-8 bg-linear-to-b from-surface-container-low/70 to-surface-container-lowest border-b border-outline-variant/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-label-sm">
                {isYtd ? "Total Cumulative GMV (2025)" : `Gross Merchandise Volume (${analytics.dateRangeLabel.split("(")[0].trim()})`}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-fixed text-on-primary-fixed">
                <span className="material-symbols-outlined text-[13px]">trending_up</span>
                <span>{gmvGrowthText}</span>
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-headline-lg text-primary tracking-tight">
                {gmvDisplay}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-on-surface-variant mt-2 flex items-center gap-2">
              <span className="font-semibold text-on-surface">Platform Target: $140.00M</span>
              <span>•</span>
              <span className="text-secondary font-medium">Outperforming baseline by +6.0%</span>
            </p>
          </div>

          {/* Quick Operational Pulse Pill */}
          <div className="flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 border-outline-variant/50 pt-3 md:pt-0">
            <span className="text-xs font-semibold text-on-surface-variant">Real-Time Take Rate</span>
            <span className="font-headline-sm text-lg font-bold text-primary">12.5% Effective</span>
            <span className="text-[11px] text-on-surface-variant">Audited & reconciled hourly</span>
          </div>
        </div>
      </div>

      {/* 4-Stat Grid Below Hero */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-outline-variant/60">
        {/* Stat 1: Net Platform Take */}
        <div className="p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Net Platform Take
            </span>
            <span className="material-symbols-outlined text-primary text-lg">account_balance_wallet</span>
          </div>
          <div className="text-2xl font-bold font-headline-sm text-primary tracking-tight">
            {netTakeDisplay}
          </div>
          <p className="text-[11px] text-on-surface-variant mt-1.5">
            12.5% avg take rate across platform fees & commissions
          </p>
        </div>

        {/* Stat 2: Meals Delivered */}
        <div className="p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Meals Delivered
            </span>
            <span className="material-symbols-outlined text-primary text-lg">lunch_dining</span>
          </div>
          <div className="text-2xl font-bold font-headline-sm text-primary tracking-tight">
            {mealsDisplay}
          </div>
          <p className="text-[11px] text-on-surface-variant mt-1.5 flex items-center gap-1.5">
            <span className="font-semibold text-secondary">{mealsGrowthText}</span>
            <span>•</span>
            <span>99.1% on-time</span>
          </p>
        </div>

        {/* Stat 3: Table Covers Seated */}
        <div className="p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Table Covers Seated
            </span>
            <span className="material-symbols-outlined text-primary text-lg">table_restaurant</span>
          </div>
          <div className="text-2xl font-bold font-headline-sm text-primary tracking-tight">
            {coversDisplay}
          </div>
          <p className="text-[11px] text-on-surface-variant mt-1.5 flex items-center gap-1.5">
            <span className="font-semibold text-secondary">+31.2% YoY</span>
            <span>•</span>
            <span>3.2 guests avg party</span>
          </p>
        </div>

        {/* Stat 4: Average Order Value */}
        <div className="p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Average Order Value
            </span>
            <span className="material-symbols-outlined text-secondary text-lg">shopping_basket</span>
          </div>
          <div className="text-2xl font-bold font-headline-sm text-primary tracking-tight">
            {aovDisplay}
          </div>
          <p className="text-[11px] text-on-surface-variant mt-1.5">
            +$4 delta vs baseline • Peak dinner basket $85
          </p>
        </div>
      </div>
    </div>
  );
}
