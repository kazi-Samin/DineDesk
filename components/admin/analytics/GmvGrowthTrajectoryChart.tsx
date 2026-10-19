"use client";

import { useState } from "react";
import { AnalyticsTrendPoint } from "@/types/admin";

interface GmvGrowthTrajectoryChartProps {
  trend: AnalyticsTrendPoint[];
  showBaseline: boolean;
}

export default function GmvGrowthTrajectoryChart({
  trend,
  showBaseline,
}: GmvGrowthTrajectoryChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // If no trend, provide fallback
  const points = trend.length > 0 ? trend : [];

  // Compute maximum revenue for SVG scaling
  const maxRevenue = Math.max(...points.map((p) => p.revenue), 20000000);
  const chartHeight = 220;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 25;

  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  // 2025 Actual points
  const coords2025 = points.map((p, idx) => {
    const x = paddingX + (idx / Math.max(points.length - 1, 1)) * innerWidth;
    const y = chartHeight - paddingY - (p.revenue / maxRevenue) * innerHeight;
    return { x, y, point: p };
  });

  // 2024 Baseline points (simulated 80% with slight seasonal variation)
  const coords2024 = points.map((p, idx) => {
    const x = paddingX + (idx / Math.max(points.length - 1, 1)) * innerWidth;
    const baselineRev = p.revenue * 0.78 + (idx % 2 === 0 ? 200000 : -150000);
    const y = chartHeight - paddingY - (baselineRev / maxRevenue) * innerHeight;
    return { x, y };
  });

  // Generate SVG path commands with smooth quadratic/cubic curves
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const current = pts[i];
      const next = pts[i + 1];
      const controlX = (current.x + next.x) / 2;
      d += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const path2025 = buildSmoothPath(coords2025);
  const path2024 = buildSmoothPath(coords2024);

  // Area path for gradient fill
  const areaPath = coords2025.length > 0
    ? `${path2025} L ${coords2025[coords2025.length - 1].x} ${chartHeight - paddingY} L ${coords2025[0].x} ${chartHeight - paddingY} Z`
    : "";

  // Find peak point for callout
  const peakCoord = coords2025.reduce((max, curr) => (curr.point.revenue > (max?.point.revenue || 0) ? curr : max), coords2025[0]);

  // Y-axis tick intervals
  const yTicks = [
    { label: "$20M", val: 20000000 },
    { label: "$15M", val: 15000000 },
    { label: "$10M", val: 10000000 },
    { label: "$5M", val: 5000000 },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xs p-6 flex flex-col justify-between">
      {/* Header with Title and Legends */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-headline-sm text-base sm:text-lg font-bold text-primary">
              GMV Growth Trajectory
            </h3>
            <span className="text-[11px] font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md">
              Monthly USD
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Comparing 2025 actual monthly platform GMV vs 2024 baseline.
          </p>
        </div>

        {/* Legend Indicators */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1.5 rounded-full bg-primary" />
            <span className="text-on-surface">2025 Actual</span>
          </div>

          {showBaseline && (
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <span className="w-3.5 h-0.5 border-b-2 border-dashed border-outline" />
              <span>2024 Baseline</span>
            </div>
          )}
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative w-full aspect-21/9 min-h-[220px]">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gmvAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1f3d2b" stopOpacity="0.22" />
              <stop offset="85%" stopColor="#1f3d2b" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#1f3d2b" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {yTicks.map((tick) => {
            const y = chartHeight - paddingY - (tick.val / maxRevenue) * innerHeight;
            return (
              <g key={tick.label}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#e3e5df"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-[#686d67] font-medium"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Area Fill for 2025 Curve */}
          {areaPath && <path d={areaPath} fill="url(#gmvAreaGradient)" />}

          {/* 2024 Baseline Dashed Curve */}
          {showBaseline && path2024 && (
            <path
              d={path2024}
              fill="none"
              stroke="#8c9188"
              strokeWidth="1.8"
              strokeDasharray="4 4"
            />
          )}

          {/* 2025 Actual Curve */}
          {path2025 && (
            <path
              d={path2025}
              fill="none"
              stroke="#1f3d2b"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Data Points on 2025 Curve */}
          {coords2025.map((coord, idx) => {
            const isHovered = hoveredIdx === idx;
            const isPeak = coord === peakCoord;

            return (
              <g
                key={coord.point.label + idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Outer Glow on hover */}
                {isHovered && (
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="8"
                    fill="#1f3d2b"
                    opacity="0.2"
                  />
                )}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isPeak || isHovered ? "4.5" : "3"}
                  fill={isPeak ? "#9f4122" : "#1f3d2b"}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                {/* X-Axis Month Label */}
                <text
                  x={coord.x}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  className={`text-[10px] font-medium ${
                    isHovered ? "fill-[#1f3d2b] font-bold" : "fill-[#686d67]"
                  }`}
                >
                  {coord.point.label}
                </text>
              </g>
            );
          })}

          {/* Peak Value Callout Tag */}
          {peakCoord && (
            <g transform={`translate(${peakCoord.x - 45}, ${peakCoord.y - 30})`}>
              <rect
                width="90"
                height="22"
                rx="6"
                fill="#1f3d2b"
                className="filter drop-shadow-xs"
              />
              <text
                x="45"
                y="14"
                textAnchor="middle"
                fill="#f7f7f4"
                className="text-[9px] font-bold tracking-tight"
              >
                PEAK ${(peakCoord.point.revenue / 1000000).toFixed(1)}M
              </text>
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && coords2025[hoveredIdx] && (
          <div
            className="absolute z-20 pointer-events-none bg-inverse-surface text-inverse-on-surface px-3 py-2 rounded-xl text-xs shadow-lg transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${(coords2025[hoveredIdx].x / chartWidth) * 100}%`,
              top: `${(coords2025[hoveredIdx].y / chartHeight) * 100}%`,
            }}
          >
            <p className="font-bold text-[11px] text-white/90">
              {coords2025[hoveredIdx].point.label} 2025
            </p>
            <p className="text-secondary-fixed text-xs font-semibold">
              ${coords2025[hoveredIdx].point.revenue.toLocaleString()}
            </p>
            <p className="text-[10px] text-white/70">
              {coords2025[hoveredIdx].point.orders.toLocaleString()} orders • {coords2025[hoveredIdx].point.reservations.toLocaleString()} covers
            </p>
          </div>
        )}
      </div>

      {/* Quarterly Run Rate Chips at bottom */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-2 border-t border-outline-variant/60">
        <div className="bg-surface-container-low p-2.5 rounded-xl text-center">
          <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block">
            Q1 Run Rate
          </span>
          <span className="text-xs font-bold text-primary block mt-0.5">$29.10M</span>
        </div>
        <div className="bg-surface-container-low p-2.5 rounded-xl text-center">
          <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block">
            Q2 Run Rate
          </span>
          <span className="text-xs font-bold text-primary block mt-0.5">$41.50M</span>
        </div>
        <div className="bg-surface-container-low p-2.5 rounded-xl text-center">
          <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block">
            Q3 Run Rate
          </span>
          <span className="text-xs font-bold text-primary block mt-0.5">$51.30M</span>
        </div>
        <div className="bg-surface-container-low p-2.5 rounded-xl text-center">
          <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider block">
            Oct Peak Momentum
          </span>
          <span className="text-xs font-bold text-secondary block mt-0.5">$18.45M</span>
        </div>
      </div>
    </div>
  );
}
