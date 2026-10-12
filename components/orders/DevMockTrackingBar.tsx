"use client";

import { OrderConfirmation, OrderStatus, PaymentStatus } from "@/types/order";

interface DevMockTrackingBarProps {
  order: OrderConfirmation;
  onStatusChange: (status: OrderStatus, paymentStatus?: PaymentStatus) => void;
}

export default function DevMockTrackingBar({
  order,
  onStatusChange,
}: DevMockTrackingBarProps) {
  // Only available statuses based on mode
  const deliveryStatuses: { label: string; value: OrderStatus }[] = [
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "In Kitchen (Preparing)", value: "preparing" },
    { label: "Out for Delivery", value: "out_for_delivery" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const takeawayStatuses: { label: string; value: OrderStatus }[] = [
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Preparing", value: "preparing" },
    { label: "Ready for Pickup", value: "ready" },
    { label: "Picked Up", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const dineinStatuses: { label: string; value: OrderStatus }[] = [
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Preparing", value: "preparing" },
    { label: "Ready for Arrival", value: "ready" },
    { label: "Dining Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const statuses =
    order.fulfillmentMode === "takeaway"
      ? takeawayStatuses
      : order.fulfillmentMode === "dinein"
      ? dineinStatuses
      : deliveryStatuses;

  return (
    <div className="w-full bg-[#1e1b16] text-[#fff8f2] rounded-xl p-3 shadow-lg border border-secondary/40 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary text-base">developer_mode</span>
        <span className="font-mono font-bold uppercase tracking-wider text-secondary">
          Dev / Demo Simulation Control:
        </span>
        <span className="text-on-surface-variant text-[11px] hidden lg:inline">
          (Switch mock state to test live tracker &amp; UI responses)
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        {statuses.map((s) => {
          const isActive = order.status === s.value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => onStatusChange(s.value)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-secondary text-white font-bold ring-1 ring-white/50"
                  : "bg-surface-container-highest/20 hover:bg-surface-container-highest/40 text-surface-container-lowest"
              }`}
            >
              {s.label}
            </button>
          );
        })}

        {/* Quick Payment State Switcher */}
        <div className="border-l border-outline/30 pl-2 ml-1 flex items-center gap-1">
          <span className="text-[10px] text-outline-variant font-mono">Payment:</span>
          {(["paid", "cash_on_delivery", "failed"] as PaymentStatus[]).map((ps) => (
            <button
              key={ps}
              type="button"
              onClick={() => onStatusChange(order.status, ps)}
              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                order.paymentStatus === ps
                  ? "bg-primary-container text-white font-bold"
                  : "bg-white/10 hover:bg-white/20 text-white/80"
              }`}
            >
              {ps === "cash_on_delivery" ? "cod" : ps}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
