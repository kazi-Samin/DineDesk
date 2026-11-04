// components/admin/OperationalHealthPanel.tsx
"use client";

interface OperationalHealth {
  activeCouriers?: number;
  courierCapacityPct?: number;
  fleetCapacityPct?: number;
  disputeRatePct?: number;
  orderDisputeRate?: number;
  disputeBenchmarkPct?: number;
  benchmarkDisputeRate?: number;
  seatedReservations?: number;
  tableReservationsSeated?: number;
  seatedGrowthPct?: number;
  reservationsGrowthPct?: number;
  avgKitchenPrepMinutes?: number;
  prepTimeDeltaMinutes?: number;
  onTimeDispatchPct?: number;
}

interface OperationalHealthPanelProps {
  health?: OperationalHealth | Record<string, any>;
}

export default function OperationalHealthPanel({
  health = {},
}: OperationalHealthPanelProps) {
  // Graceful field fallbacks matching backend payload variations
  const couriers = health.activeCouriers ?? 6;
  const courierCapacity = health.courierCapacityPct ?? health.fleetCapacityPct ?? 100;

  const disputeRate = health.disputeRatePct ?? health.orderDisputeRate ?? 0.2;
  const disputeBenchmark = health.disputeBenchmarkPct ?? health.benchmarkDisputeRate ?? 1.0;

  const seatedCount =
    health.seatedReservations ?? health.tableReservationsSeated ?? 0;
  const seatedGrowth =
    health.seatedGrowthPct ?? health.reservationsGrowthPct ?? 0;

  const prepMinutes = health.avgKitchenPrepMinutes ?? 14.5;
  const prepDelta = health.prepTimeDeltaMinutes ?? 1.2;

  const disputeBarWidth = Math.min(
    100,
    Math.max(8, (disputeRate / (disputeBenchmark || 1)) * 50)
  );

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#1b3b2b]/10 shadow-xs flex flex-col justify-between min-h-[440px] h-full">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#1b3b2b]/10">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <h2 className="text-base sm:text-lg font-bold text-[#1b3b2b] tracking-tight">
            Operational Health
          </h2>
        </div>
        <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#1b3b2b]/5 font-bold text-[#1b3b2b] border border-[#1b3b2b]/10">
          Live Fleet
        </span>
      </div>

      {/* 4 Health Metric Cards */}
      <div className="flex flex-col gap-3 my-auto py-2">
        {/* Metric 1: Fleet */}
        <div className="bg-[#fbfdfc] p-3.5 rounded-xl border border-[#1b3b2b]/10 flex flex-col gap-2 transition-colors hover:border-[#1b3b2b]/25">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600">
              Active Delivery Fleet
            </span>
            <span className="material-symbols-outlined text-[18px] text-[#1b3b2b]">
              two_wheeler
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-bold text-[#1b3b2b]">
              {couriers} Couriers
            </span>
            <span className="text-xs font-bold text-emerald-800">
              {courierCapacity}% capacity
            </span>
          </div>
          <div className="w-full bg-neutral-200/70 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#1b3b2b] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, courierCapacity))}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Dispute Rate */}
        <div className="bg-[#fbfdfc] p-3.5 rounded-xl border border-[#1b3b2b]/10 flex flex-col gap-2 transition-colors hover:border-[#1b3b2b]/25">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600">
              Order Dispute Rate
            </span>
            <span className="material-symbols-outlined text-[18px] text-[#E2B774]">
              shield
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-bold text-[#1b3b2b]">
              {disputeRate}%
            </span>
            <span className="text-[11px] font-medium text-neutral-500">
              Benchmark: {disputeBenchmark}%
            </span>
          </div>
          <div className="w-full bg-neutral-200/70 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#E2B774] h-full rounded-full transition-all duration-500"
              style={{ width: `${disputeBarWidth}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Reservations Seated */}
        <div className="bg-[#fbfdfc] p-3.5 rounded-xl border border-[#1b3b2b]/10 flex flex-col gap-2 transition-colors hover:border-[#1b3b2b]/25">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600">
              Table Reservations Seated
            </span>
            <span className="material-symbols-outlined text-[18px] text-[#1b3b2b]">
              event_seat
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-bold text-[#1b3b2b]">
              {Number(seatedCount).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-800">
              +{seatedGrowth}% this month
            </span>
          </div>
          <div className="w-full bg-neutral-200/70 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#1b3b2b] h-full rounded-full transition-all duration-500"
              style={{ width: "88%" }}
            />
          </div>
        </div>

        {/* Metric 4: Kitchen Prep Time */}
        <div className="bg-[#fbfdfc] p-3.5 rounded-xl border border-[#1b3b2b]/10 flex flex-col gap-2 transition-colors hover:border-[#1b3b2b]/25">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600">
              Avg Kitchen Prep Time
            </span>
            <span className="material-symbols-outlined text-[18px] text-neutral-400">
              timelapse
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-bold text-[#1b3b2b]">
              {prepMinutes} mins
            </span>
            <span className="text-xs font-bold text-amber-800">
              -{prepDelta} min delta
            </span>
          </div>
          <div className="w-full bg-neutral-200/70 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#1b3b2b]/60 h-full rounded-full transition-all duration-500"
              style={{ width: "72%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}