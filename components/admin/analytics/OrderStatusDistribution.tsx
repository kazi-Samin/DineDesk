"use client";

import { OrderStatusBreakdown } from "@/types/admin";

interface OrderStatusDistributionProps {
  distribution: OrderStatusBreakdown[];
}

export default function OrderStatusDistribution({
  distribution,
}: OrderStatusDistributionProps) {
  const total = distribution.reduce((acc, curr) => acc + curr.count, 0);

  const getBarColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-primary";
      case "preparing":
        return "bg-surface-tint";
      case "out_for_delivery":
        return "bg-secondary";
      case "disputed_cancelled":
        return "bg-error";
      default:
        return "bg-outline";
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return "check_circle";
      case "preparing":
        return "skillet";
      case "out_for_delivery":
        return "two_wheeler";
      case "disputed_cancelled":
        return "cancel";
      default:
        return "receipt";
    }
  };

  return (
    <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-xl border border-outline-variant shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
        <div>
          <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-primary tracking-tight">
            Order Lifecycle Distribution
          </h2>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Operational status breakdown of all {total.toLocaleString()} customer orders
          </p>
        </div>
        <span className="font-label-sm text-[11px] px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">
          99.3% Healthy
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="my-5 space-y-2">
        <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden flex shadow-inner">
          {distribution.map((item) => (
            <div
              key={item.status}
              className={`${getBarColor(item.status)} h-full transition-all duration-500`}
              style={{ width: `${item.percentage}%` }}
              title={`${item.label}: ${item.percentage}%`}
            />
          ))}
        </div>

        {/* Quick Legend Bar */}
        <div className="flex items-center justify-between text-[11px] text-on-surface-variant px-1">
          <span>93.4% Completed</span>
          <span>5.9% In Active Pipeline</span>
          <span>0.7% Exceptions</span>
        </div>
      </div>

      {/* 4 Detail Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {distribution.map((item) => (
          <div
            key={item.status}
            className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/50 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-on-surface-variant truncate">
                {item.label}
              </span>
              <span className={`material-symbols-outlined text-base ${
                item.status === 'delivered' ? 'text-primary' : item.status === 'disputed_cancelled' ? 'text-error' : 'text-secondary'
              }`}>
                {getIcon(item.status)}
              </span>
            </div>

            <div className="mt-2">
              <span className="font-headline-sm text-base sm:text-lg font-bold text-on-surface block">
                {item.count.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-on-surface-variant/80 block mt-0.5">
                {item.percentage}% of total
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
