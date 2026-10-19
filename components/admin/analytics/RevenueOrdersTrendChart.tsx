"use client";

import { useState } from "react";
import { AnalyticsTrendPoint } from "@/types/admin";

interface RevenueOrdersTrendChartProps {
  trend: AnalyticsTrendPoint[];
}

export default function RevenueOrdersTrendChart({
  trend,
}: RevenueOrdersTrendChartProps) {
  const [metricMode, setMetricMode] = useState<"revenue" | "orders">("revenue");
  const [hoveredIdx, setHoveredIdx] = useState<number>(trend.length - 1);

  if (!trend || trend.length === 0) {
    return (
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant text-center text-on-surface-variant">
        No trend data available for this range.
      </div>
    );
  }

  const activePoint = trend[hoveredIdx] || trend[trend.length - 1];

  const values = trend.map((t) => (metricMode === "revenue" ? t.revenue : t.orders));
  const maxVal = Math.max(...values, 1) * 1.15;
  const minVal = 0;

  // SVG dimensions
  const svgWidth = 740;
  const svgHeight = 220;
  const paddingX = 50;
  const paddingBottom = 40;
  const paddingTop = 25;
  const innerWidth = svgWidth - paddingX * 2;
  const innerHeight = svgHeight - paddingTop - paddingBottom;

  const points = trend.map((t, idx) => {
    const val = metricMode === "revenue" ? t.revenue : t.orders;
    const x =
      trend.length === 1
        ? svgWidth / 2
        : paddingX + (idx / (trend.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - (val / maxVal) * innerHeight;
    return { x, y, val, item: t };
  });

  // Construct SVG Path
  const linePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  // Area path
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${
          paddingTop + innerHeight
        } L ${points[0].x} ${paddingTop + innerHeight} Z`
      : "";

  const activePointCoord = points[hoveredIdx] || points[points.length - 1];

  return (
    <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-xl border border-outline-variant shadow-2xs flex flex-col justify-between">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/40">
        <div>
          <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-primary tracking-tight">
            {metricMode === "revenue" ? "Gross Platform GMV Trend" : "Order Volume Velocity"}
          </h2>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            {metricMode === "revenue"
              ? "Calculated in US Dollars (USD) across food delivery and reserved dining"
              : "Completed order volumes disbursed to active restaurant merchants"}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/60 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetricMode("revenue")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              metricMode === "revenue"
                ? "bg-primary-container text-on-primary shadow-2xs font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Revenue ($)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode("orders")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              metricMode === "orders"
                ? "bg-primary-container text-on-primary shadow-2xs font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Order Volume
          </button>
        </div>
      </div>

      {/* SVG Interactive Trend Chart */}
      <div className="relative w-full h-64 sm:h-72 mt-4 select-none">
        {/* Dynamic Tooltip */}
        {activePoint && (
          <div
            className="absolute pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full z-20"
            style={{
              left: `${(activePointCoord.x / svgWidth) * 100}%`,
              top: `${activePointCoord.y - 12}px`,
            }}
          >
            <div className="bg-inverse-surface text-inverse-on-surface px-3 py-1.5 rounded-lg shadow-md flex flex-col gap-0.5 text-center min-w-[120px]">
              <span className="text-[10px] font-bold text-primary-fixed uppercase tracking-wider">
                {activePoint.label}
              </span>
              <span className="text-xs font-bold text-on-primary font-mono">
                {metricMode === "revenue"
                  ? `$${activePoint.revenue.toLocaleString()}`
                  : `${activePoint.orders.toLocaleString()} orders`}
              </span>
              <span className="text-[10px] text-on-surface-variant/80">
                {activePoint.reservations} bookings • {activePoint.newUsers} diners
              </span>
            </div>
            <div className="w-2 h-2 bg-inverse-surface rotate-45 mx-auto -mt-1" />
          </div>
        )}

        <svg
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        >
          {/* Y Axis Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + innerHeight - ratio * innerHeight;
            const val = minVal + ratio * (maxVal - minVal);
            const formattedVal =
              metricMode === "revenue"
                ? `${(val / 1000000).toFixed(1)}M`
                : Math.round(val).toLocaleString();

            return (
              <g key={ratio}>
                <line
                  stroke="#E3E5DF"
                  strokeDasharray="3,3"
                  strokeWidth="1"
                  x1={paddingX}
                  x2={svgWidth - paddingX}
                  y1={y}
                  y2={y}
                />
                <text
                  className="fill-on-surface-variant/80 text-[10px] font-mono"
                  textAnchor="end"
                  x={paddingX - 8}
                  y={y + 3}
                >
                  {formattedVal}
                </text>
              </g>
            );
          })}

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1f3d2b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1f3d2b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Trend Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#1f3d2b"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Hover Nodes */}
          {points.map((p, idx) => {
            const isSelected = hoveredIdx === idx;
            return (
              <g
                key={p.item.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                className="cursor-pointer"
              >
                {/* Invisible Hover Pillar */}
                <rect
                  x={p.x - 20}
                  y={paddingTop}
                  width="40"
                  height={innerHeight}
                  fill="transparent"
                />

                {/* Vertical Cursor Guide when selected */}
                {isSelected && (
                  <line
                    x1={p.x}
                    x2={p.x}
                    y1={paddingTop}
                    y2={paddingTop + innerHeight}
                    stroke="#1f3d2b"
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                    opacity="0.6"
                  />
                )}

                {/* Node Circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? "5" : "3.5"}
                  className={`transition-all duration-150 ${
                    isSelected
                      ? "fill-primary stroke-surface-container-lowest stroke-2"
                      : "fill-primary/80"
                  }`}
                />

                {/* X Axis Label */}
                <text
                  x={p.x}
                  y={paddingTop + innerHeight + 20}
                  textAnchor="middle"
                  className={`text-[10px] font-medium font-sans ${
                    isSelected ? "fill-primary font-bold" : "fill-on-surface-variant"
                  }`}
                >
                  {p.item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Metrics Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 mt-2 border-t border-outline-variant/40 text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-primary">insights</span>
          <span className="text-on-surface-variant font-medium">
            Average transaction ticket: <strong className="text-on-surface">$28.50</strong>
          </span>
        </div>
        <span className="text-on-surface-variant font-mono text-[11px]">
          Fulfillment SLA: 98.4% On-Time Dispatches
        </span>
      </div>
    </div>
  );
}
