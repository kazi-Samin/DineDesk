"use client";

import { useState } from "react";

export default function NetworkDensityRetentionChart() {
  const [activeTab, setActiveTab] = useState<"density" | "cohorts">("density");

  // Simulated 6-month data for patron density
  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const dinerCounts = [2850, 3200, 3600, 4100, 4500, 4820];
  const nodeCounts = [84, 84, 84, 84, 84, 84];

  const maxDiners = 5500;
  const chartHeight = 180;
  const chartWidth = 400;
  const paddingX = 30;
  const paddingY = 20;

  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const dinerCoords = dinerCounts.map((val, idx) => ({
    x: paddingX + (idx / (dinerCounts.length - 1)) * innerWidth,
    y: chartHeight - paddingY - (val / maxDiners) * innerHeight,
    val,
    month: months[idx],
  }));

  let dinerPath = `M ${dinerCoords[0].x} ${dinerCoords[0].y}`;
  for (let i = 0; i < dinerCoords.length - 1; i++) {
    const curr = dinerCoords[i];
    const next = dinerCoords[i + 1];
    const cx = (curr.x + next.x) / 2;
    dinerPath += ` C ${cx} ${curr.y}, ${cx} ${next.y}, ${next.x} ${next.y}`;
  }

  const dinerAreaPath = `${dinerPath} L ${dinerCoords[dinerCoords.length - 1].x} ${chartHeight - paddingY} L ${dinerCoords[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xs p-6 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-label-sm">
            Guest Loyalty &amp; Retention
          </span>
          <div className="flex items-center gap-1 bg-surface-container p-0.5 rounded-lg text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab("density")}
              className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-colors ${
                activeTab === "density"
                  ? "bg-surface-container-lowest text-primary shadow-2xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Retention
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cohorts")}
              className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-colors ${
                activeTab === "cohorts"
                  ? "bg-surface-container-lowest text-primary shadow-2xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Cohorts
            </button>
          </div>
        </div>

        <h3 className="font-headline-sm text-base sm:text-lg font-bold text-primary">
          Patron Retention &amp; Table Turns
        </h3>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Active dining guests versus floor table turnaround pacing.
        </p>
      </div>

      {/* Main Dual Metric Stats */}
      <div className="grid grid-cols-2 gap-3 my-4 p-3 bg-surface-container-low rounded-xl">
        <div>
          <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block">
            Active Patrons (30D)
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold font-headline-sm text-primary">4,820</span>
            <span className="text-[11px] font-semibold text-secondary">+18.4%</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block">
            Floor Capacity
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold font-headline-sm text-primary">84 Seats</span>
            <span className="text-[11px] font-semibold text-primary">4 Zones</span>
          </div>
        </div>
      </div>

      {/* Content depending on active tab */}
      {activeTab === "density" ? (
        <div className="relative w-full aspect-16/9 min-h-[160px]">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="dinerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9f4122" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#9f4122" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Subtle gridline */}
            <line
              x1={paddingX}
              y1={chartHeight - paddingY}
              x2={chartWidth - paddingX}
              y2={chartHeight - paddingY}
              stroke="#e3e5df"
              strokeWidth="1"
            />

            {/* Area fill */}
            <path d={dinerAreaPath} fill="url(#dinerGradient)" />

            {/* Smooth trend curve */}
            <path
              d={dinerPath}
              fill="none"
              stroke="#9f4122"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Data circles */}
            {dinerCoords.map((pt, i) => (
              <g key={pt.month}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#9f4122"
                  strokeWidth="2"
                />
                <text
                  x={pt.x}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  className="text-[9px] fill-[#686d67] font-medium"
                >
                  {pt.month}
                </text>
              </g>
            ))}
          </svg>
        </div>
      ) : (
        /* Cohort Retention Breakdown View */
        <div className="space-y-3 py-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-on-surface">90-Day Retention Cohort</span>
              <span className="font-bold text-primary">78.4%</span>
            </div>
            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "78.4%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-on-surface">Table Booking Conversion</span>
              <span className="font-bold text-secondary">24.6%</span>
            </div>
            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: "24.6%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-on-surface">Courier Turnaround Compliance</span>
              <span className="font-bold text-primary">96.8%</span>
            </div>
            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-surface-tint rounded-full" style={{ width: "96.8%" }} />
            </div>
          </div>
        </div>
      )}

      {/* Footer Insight Note */}
      <div className="pt-3 border-t border-outline-variant/60 flex items-center justify-between text-[11px] text-on-surface-variant">
        <span>Average Dinner Covers / Night:</span>
        <span className="font-bold text-primary">168 covers (94% Seat Turn)</span>
      </div>
    </div>
  );
}
