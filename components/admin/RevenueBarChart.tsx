"use client";

import { useState } from "react";
import { MonthlyVolumeItem } from "@/types/admin";

interface RevenueBarChartProps {
  data: MonthlyVolumeItem[];
}

export default function RevenueBarChart({ data }: RevenueBarChartProps) {
  // Default hovered index to the last one (October)
  const [hoveredIndex, setHoveredIndex] = useState<number>(data.length - 1);

  const maxRevenue = 1600000; // 1.6M BDT ceiling for consistent scaling
  const chartHeight = 180;
  const activeItem = data[hoveredIndex] || data[data.length - 1];

  // Tooltip position calculation (percentage along X axis)
  const tooltipXPercent =
    data.length > 0
      ? ((hoveredIndex + 0.5) / data.length) * 100
      : 90;

  return (
    <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-xl border border-outline-variant shadow-2xs flex flex-col justify-between min-h-[440px]">
      {/* Header & Legends */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/40">
        <div>
          <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-primary tracking-tight">
            Monthly Gross Volume (2025)
          </h2>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Aggregated dining, delivery, and culinary table bookings across Dhaka outlets
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-primary inline-block" />
            <span className="font-medium text-on-surface text-xs">Peak Volume</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-surface-dim inline-block border border-outline-variant/60" />
            <span className="text-on-surface-variant text-xs">Standard Run</span>
          </div>
        </div>
      </div>

      {/* SVG Bar Chart with Hover Tooltip */}
      <div className="relative w-full h-64 sm:h-72 mt-4 select-none">
        {/* Dynamic Tooltip */}
        {activeItem && (
          <div
            className="absolute pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full z-20"
            style={{
              left: `${Math.min(92, Math.max(8, tooltipXPercent))}%`,
              top: `${Math.max(15, chartHeight - (activeItem.revenue / maxRevenue) * chartHeight)}px`,
            }}
          >
            <div className="bg-inverse-surface text-inverse-on-surface px-3 py-1.5 rounded-lg shadow-md flex flex-col gap-0.5 text-center min-w-[130px]">
              <span className="text-[10px] font-bold tracking-wider text-primary-fixed uppercase">
                {activeItem.fullMonth}
              </span>
              <span className="text-xs font-bold text-on-primary font-mono">
                ৳{(activeItem.revenue / 1000000).toFixed(2)}M • {activeItem.orders.toLocaleString()} orders
              </span>
            </div>
            <div className="w-2 h-2 bg-inverse-surface rotate-45 mx-auto -mt-1" />
          </div>
        )}

        <svg
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          viewBox="0 0 740 240"
        >
          {/* Horizontal Gridlines */}
          <line stroke="#E3E5DF" strokeDasharray="3,3" strokeWidth="1" x1="45" x2="720" y1="20" y2="20" />
          <text className="fill-on-surface-variant/80 text-[10px] font-mono" textAnchor="end" x="38" y="24">
            1.6M
          </text>

          <line stroke="#E3E5DF" strokeDasharray="3,3" strokeWidth="1" x1="45" x2="720" y1="65" y2="65" />
          <text className="fill-on-surface-variant/80 text-[10px] font-mono" textAnchor="end" x="38" y="69">
            1.2M
          </text>

          <line stroke="#E3E5DF" strokeDasharray="3,3" strokeWidth="1" x1="45" x2="720" y1="110" y2="110" />
          <text className="fill-on-surface-variant/80 text-[10px] font-mono" textAnchor="end" x="38" y="114">
            0.8M
          </text>

          <line stroke="#E3E5DF" strokeDasharray="3,3" strokeWidth="1" x1="45" x2="720" y1="155" y2="155" />
          <text className="fill-on-surface-variant/80 text-[10px] font-mono" textAnchor="end" x="38" y="159">
            0.4M
          </text>

          <line stroke="#C2C8C1" strokeWidth="1" x1="45" x2="720" y1="200" y2="200" />
          <text className="fill-on-surface-variant/80 text-[10px] font-mono" textAnchor="end" x="38" y="204">
            0
          </text>

          {/* Interactive Bars */}
          {data.map((item, idx) => {
            const barWidth = 36;
            const xSpacing = 68;
            const xPos = 60 + idx * xSpacing;
            const barHeight = Math.round((item.revenue / maxRevenue) * chartHeight);
            const yPos = 200 - barHeight;
            const isSelected = hoveredIndex === idx;

            return (
              <g
                key={item.month}
                onMouseEnter={() => setHoveredIndex(idx)}
                className="cursor-pointer group"
              >
                {/* Background hover pillar */}
                <rect
                  x={xPos - 8}
                  y={10}
                  width={barWidth + 16}
                  height={190}
                  fill="transparent"
                  className="hover:fill-surface-container/50 transition-colors"
                />

                {/* The Bar */}
                <rect
                  x={xPos}
                  y={yPos}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  className={`transition-all duration-200 ${
                    item.isCurrent
                      ? "fill-primary hover:opacity-90"
                      : isSelected
                      ? "fill-primary"
                      : "fill-surface-dim hover:fill-primary/70"
                  }`}
                />

                {/* X Axis Month Label */}
                <text
                  x={xPos + barWidth / 2}
                  y={220}
                  textAnchor="middle"
                  className={`text-[11px] font-sans transition-colors ${
                    isSelected || item.isCurrent
                      ? "fill-primary font-bold"
                      : "fill-on-surface-variant font-medium"
                  }`}
                >
                  {item.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Audit Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 mt-2 border-t border-outline-variant/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span className="font-body-sm text-xs text-on-surface-variant">
            Q4 Pace exceeds target by <strong className="text-on-surface font-semibold">+8.4%</strong>
          </span>
        </div>
        <span className="font-label-sm text-[11px] text-on-surface-variant">
          Fiscal Audit Synchronized: Today 18:30 UTC
        </span>
      </div>
    </div>
  );
}
