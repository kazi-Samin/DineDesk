// components/admin/RevenueBarChart.tsx
"use client";

import { useState } from "react";

export interface MonthlyVolumeItem {
  month: string;
  fullMonth: string;
  revenue: number;
  orders: number;
  isPeak?: boolean;
  isCurrent?: boolean;
}

interface RevenueBarChartProps {
  data: MonthlyVolumeItem[];
  year?: number | string;
}

export default function RevenueBarChart({
  data = [],
  year = 2026,
}: RevenueBarChartProps) {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  const maxRevenue = Math.max(...data.map((d) => d.revenue || 0), 1);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#1b3b2b]/10 shadow-xs flex flex-col justify-between h-full min-h-[440px]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1b3b2b]/10">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1b3b2b] tracking-tight">
            Monthly Gross Volume ({year})
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Aggregated dining, delivery, and culinary table bookings across Detroit venues
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1b3b2b]" />
            <span className="text-neutral-600 font-medium">Peak Volume</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
            <span className="text-neutral-500 font-medium">Standard Run</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="relative w-full h-64 flex items-end justify-between gap-1 sm:gap-2 pt-10 pb-6 px-1 sm:px-2">
        {data.map((item, idx) => {
          const heightPercent = item.revenue > 0
            ? Math.max(12, Math.round((item.revenue / maxRevenue) * 100))
            : 4;

          const isPeak = item.isPeak || (item.revenue === maxRevenue && item.revenue > 0);

          return (
            <div
              key={item.month}
              className="relative flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
              onMouseEnter={() => setActiveTooltip(idx)}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {/* Floating Tooltip */}
              {activeTooltip === idx && (
                <div className="absolute -top-12 z-30 bg-[#1b3b2b] text-white px-3 py-1.5 rounded-xl shadow-lg border border-[#E2B774]/40 flex flex-col items-center pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                  <span className="text-[10px] font-bold text-[#E2B774] uppercase tracking-wider">
                    {item.fullMonth || item.month}
                  </span>
                  <span className="text-xs font-extrabold">
                    ${Number(item.revenue || 0).toLocaleString()} • {item.orders} orders
                  </span>
                  <div className="w-2 h-2 bg-[#1b3b2b] rotate-45 absolute -bottom-1 border-r border-b border-[#E2B774]/40" />
                </div>
              )}

              {/* Bar Column */}
              <div className="w-full max-w-[28px] bg-neutral-100 rounded-t-md h-full flex items-end overflow-hidden p-0.5">
                <div
                  className={`w-full rounded-t-sm transition-all duration-500 ${isPeak
                      ? "bg-[#1b3b2b]"
                      : item.revenue > 0
                        ? "bg-[#1b3b2b]/70 group-hover:bg-[#1b3b2b]"
                        : "bg-neutral-200"
                    }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              {/* Month Label with padding */}
              <span
                className={`text-[10px] sm:text-[11px] mt-2 font-bold select-none ${item.isCurrent
                    ? "text-[#1b3b2b] font-black"
                    : "text-neutral-400 group-hover:text-neutral-700"
                  }`}
              >
                {item.month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom Chart Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#1b3b2b]/10 text-[11px] text-neutral-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span className="font-semibold text-neutral-700">Q4 Pace exceeds target by +8.4%</span>
        </div>
        <span className="font-mono text-[10px] text-neutral-400">
          Fiscal Audit Synchronized
        </span>
      </div>
    </div>
  );
}