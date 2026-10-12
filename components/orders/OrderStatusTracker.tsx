"use client";

import { OrderConfirmation, OrderStatus, FulfillmentMode } from "@/types/order";

interface OrderStatusTrackerProps {
  order: OrderConfirmation;
}

interface StepConfig {
  number: number;
  title: string;
  icon: string;
  activeSubtitle: string;
  completedSubtitle: string;
  upcomingSubtitle: string;
  timeKey?: keyof NonNullable<OrderConfirmation["timeline"]>;
}

export default function OrderStatusTracker({ order }: OrderStatusTrackerProps) {
  const { status, fulfillmentMode, timeline } = order;

  if (status === "cancelled") {
    return (
      <div className="bg-error/10 border border-error/30 rounded-xl p-space-md md:p-space-lg flex items-center justify-between gap-space-md text-error">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-2xl">error</span>
          <div>
            <h3 className="font-label-lg font-semibold text-error">Order Cancelled</h3>
            <p className="font-body-sm text-error/80 text-[13px]">
              This order has been cancelled upon customer or restaurant request at{" "}
              {timeline?.cancelledAt || "recent timestamp"}.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-error text-on-error rounded font-label-sm uppercase tracking-wider text-[11px] font-bold">
          Cancelled
        </span>
      </div>
    );
  }

  // Get steps definition based on fulfillment mode
  const getSteps = (mode: FulfillmentMode): StepConfig[] => {
    if (mode === "takeaway") {
      return [
        {
          number: 1,
          title: "Order Placed",
          icon: "receipt_long",
          activeSubtitle: "Sent to counter",
          completedSubtitle: "Order logged",
          upcomingSubtitle: "Pending transmission",
          timeKey: "placedAt",
        },
        {
          number: 2,
          title: "Preparing",
          icon: "skillet",
          activeSubtitle: "Chef is packing meal",
          completedSubtitle: "Kitchen prepared",
          upcomingSubtitle: "Awaiting preparation",
          timeKey: "preparingAt",
        },
        {
          number: 3,
          title: "Ready for Pickup",
          icon: "shopping_bag",
          activeSubtitle: "Waiting at pickup counter",
          completedSubtitle: "Order boxed & verified",
          upcomingSubtitle: "Ready in ~10m",
          timeKey: "readyAt",
        },
        {
          number: 4,
          title: "Picked Up",
          icon: "storefront",
          activeSubtitle: "Handover in progress",
          completedSubtitle: "Handed to customer",
          upcomingSubtitle: "Pending collection",
          timeKey: "deliveredAt",
        },
      ];
    }

    if (mode === "dinein") {
      return [
        {
          number: 1,
          title: "Order Placed",
          icon: "receipt_long",
          activeSubtitle: "Pre-order received",
          completedSubtitle: "Order logged",
          upcomingSubtitle: "Pending transmission",
          timeKey: "placedAt",
        },
        {
          number: 2,
          title: "Preparing",
          icon: "skillet",
          activeSubtitle: "Chef timed for arrival",
          completedSubtitle: "Kitchen prepared",
          upcomingSubtitle: "Awaiting preparation",
          timeKey: "preparingAt",
        },
        {
          number: 3,
          title: "Ready for Arrival",
          icon: "table_restaurant",
          activeSubtitle: "Table reserved & staged",
          completedSubtitle: "Table & tableware ready",
          upcomingSubtitle: "Staging before arrival",
          timeKey: "readyAt",
        },
        {
          number: 4,
          title: "Completed",
          icon: "check_circle",
          activeSubtitle: "Served at dining room",
          completedSubtitle: "Banquet completed",
          upcomingSubtitle: "Pending dining session",
          timeKey: "deliveredAt",
        },
      ];
    }

    // Default: Delivery
    return [
      {
        number: 1,
        title: "Order Placed",
        icon: "receipt_long",
        activeSubtitle: "Kitchen accepted",
        completedSubtitle: "Verified & logged",
        upcomingSubtitle: "Pending verification",
        timeKey: "placedAt",
      },
      {
        number: 2,
        title: "In Kitchen",
        icon: "skillet",
        activeSubtitle: "Chef is steaming & layering",
        completedSubtitle: "Cooked & packaged",
        upcomingSubtitle: "Awaiting preparation",
        timeKey: "preparingAt",
      },
      {
        number: 3,
        title: "Delivery Run",
        icon: "two_wheeler",
        activeSubtitle: "Courier en route to address",
        completedSubtitle: "Arrived at destination",
        upcomingSubtitle: "Courier on standby",
        timeKey: "outForDeliveryAt",
      },
      {
        number: 4,
        title: "Delivered",
        icon: "home_pin",
        activeSubtitle: "Delivered at doorstep",
        completedSubtitle: "Safely received",
        upcomingSubtitle: "Pending arrival",
        timeKey: "deliveredAt",
      },
    ];
  };

  const steps = getSteps(fulfillmentMode);

  // Helper to determine step status
  const getStepState = (stepIndex: number, currentStatus: OrderStatus) => {
    const statusRanks: Record<OrderStatus, number> = {
      pending: 0,
      confirmed: 1,
      preparing: 2,
      ready: 3,
      out_for_delivery: 3,
      delivered: 4,
      completed: 4,
      cancelled: -1,
    };

    const currentRank = statusRanks[currentStatus] ?? 0;
    const stepRank = stepIndex + 1; // 1, 2, 3, 4

    if (currentStatus === "pending") {
      // Step 1 is active/pending confirmation
      if (stepRank === 1) return "completed";
      return "upcoming";
    }

    if (currentRank > stepRank) return "completed";
    if (currentRank === stepRank) return "active";
    return "upcoming";
  };

  return (
    <div className="bg-surface-container rounded-b-xl px-space-lg md:px-space-xl py-space-lg border-x border-b border-outline-variant/40">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md relative">
        {steps.map((step, idx) => {
          const state = getStepState(idx, status);
          const recordedTime = step.timeKey && timeline ? timeline[step.timeKey] : null;

          return (
            <div
              key={step.number}
              className={`flex items-start gap-space-sm p-space-md rounded-lg transition-all ${
                state === "completed"
                  ? "bg-surface-container-lowest shadow-sm"
                  : state === "active"
                  ? "bg-surface-container-lowest shadow-md ring-2 ring-secondary/30 relative"
                  : "bg-surface-container-low opacity-60"
              }`}
            >
              {/* Step Icon Badge */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  state === "completed"
                    ? "bg-primary-container text-on-primary"
                    : state === "active"
                    ? "bg-secondary text-on-secondary"
                    : "bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                {state === "completed" ? (
                  <span className="material-symbols-outlined text-lg">check</span>
                ) : state === "active" ? (
                  <span className="material-symbols-outlined text-lg animate-spin">{step.icon}</span>
                ) : (
                  <span className="material-symbols-outlined text-lg">{step.icon}</span>
                )}
              </div>

              {/* Step Content */}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-label-lg text-label-lg font-semibold truncate ${
                      state === "completed"
                        ? "text-primary"
                        : state === "active"
                        ? "text-on-surface"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {step.number}. {step.title}
                  </span>
                  {state === "active" && (
                    <span className="w-2 h-2 rounded-full bg-secondary animate-ping shrink-0"></span>
                  )}
                </div>

                <span
                  className={`font-body-sm text-body-sm ${
                    state === "active" ? "text-secondary font-medium" : "text-on-surface-variant"
                  }`}
                >
                  {recordedTime ? `${recordedTime} • ` : ""}
                  {state === "active" ? "Active Now" : state === "completed" ? "Completed" : "Upcoming"}
                </span>

                <span
                  className={`font-label-sm text-label-sm mt-1 truncate ${
                    state === "active"
                      ? "text-on-surface-variant font-medium"
                      : state === "completed"
                      ? "text-primary-container"
                      : "text-on-surface-variant/70"
                  }`}
                >
                  {state === "active"
                    ? step.activeSubtitle
                    : state === "completed"
                    ? step.completedSubtitle
                    : step.upcomingSubtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
