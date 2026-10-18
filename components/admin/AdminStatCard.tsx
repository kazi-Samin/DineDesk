"use client";

interface AdminStatCardProps {
  title: string;
  value: string;
  changeText: string;
  changeNote: string;
  isPositive?: boolean;
  progressPct: number;
  icon: string;
  accent?: "primary" | "secondary";
}

export default function AdminStatCard({
  title,
  value,
  changeText,
  changeNote,
  isPositive = true,
  progressPct,
  icon,
  accent = "primary",
}: AdminStatCardProps) {
  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-2xs flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:shadow-xs hover:border-outline">
      {/* Top Row: Label and Icon */}
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
          {title}
        </span>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            accent === "secondary"
              ? "bg-secondary-fixed text-on-secondary-fixed"
              : "bg-surface-container text-primary"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
      </div>

      {/* Metric Display */}
      <div className="mt-4 flex flex-col">
        <span className="font-headline-md text-2xl sm:text-[26px] font-bold text-on-surface tracking-tight">
          {value}
        </span>

        {/* Change Note */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span
            className={`material-symbols-outlined text-sm font-semibold ${
              accent === "secondary"
                ? "text-secondary"
                : isPositive
                ? "text-primary"
                : "text-error"
            }`}
          >
            {accent === "secondary"
              ? "fiber_new"
              : isPositive
              ? "trending_up"
              : "trending_down"}
          </span>

          <span
            className={`text-xs font-bold ${
              accent === "secondary"
                ? "text-secondary"
                : isPositive
                ? "text-primary"
                : "text-error"
            }`}
          >
            {changeText}
          </span>

          <span className="text-xs text-on-surface-variant">{changeNote}</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-surface-container h-1.5 rounded-full mt-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            accent === "secondary" ? "bg-secondary" : "bg-primary"
          }`}
          style={{ width: `${Math.min(100, Math.max(5, progressPct))}%` }}
        />
      </div>
    </div>
  );
}
