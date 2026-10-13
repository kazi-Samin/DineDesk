"use client";

import { OrderConfirmation } from "@/types/order";

interface OrderConfirmationHeroProps {
  order: OrderConfirmation;
}

export default function OrderConfirmationHero({ order }: OrderConfirmationHeroProps) {
  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered" || order.status === "completed";

  // Contextual heading and subtitle based on status and fulfillment mode
  const getHeroHeading = () => {
    if (isCancelled) {
      return `Order #${order.orderId} was cancelled`;
    }
    if (isDelivered) {
      if (order.fulfillmentMode === "takeaway") return `Thank you, ${order.contact.fullName}! Order picked up.`;
      if (order.fulfillmentMode === "dinein") return `Thank you, ${order.contact.fullName}! Dining completed.`;
      return `Thank you, ${order.contact.fullName}! Your order has arrived.`;
    }

    if (order.status === "pending") {
      return `Order received — awaiting restaurant confirmation`;
    }

    return `Thank you, ${order.contact.fullName}! Your order is confirmed.`;
  };

  const getHeroSubText = () => {
    if (isCancelled) {
      return `This mock order has been marked as cancelled. Any demo charges will be voided.`;
    }
    if (order.fulfillmentMode === "takeaway") {
      return order.status === "ready"
        ? "Your order is packed and ready for pickup at the counter!"
        : "Your order is being prepared for takeaway pickup.";
    }
    if (order.fulfillmentMode === "dinein") {
      return order.status === "ready"
        ? "Your table and pre-ordered dishes are prepared for your arrival."
        : "Your restaurant pre-order has been received.";
    }
    return order.status === "out_for_delivery"
      ? "Your order is on its way to your doorstep with our dedicated courier."
      : "Your order is being lovingly prepared in the kitchen.";
  };

  // Status tag styling
  const getBadgeContent = () => {
    if (isCancelled) {
      return {
        label: "Order Cancelled",
        icon: "cancel",
        colorClass: "bg-error/10 text-error",
      };
    }
    if (isDelivered) {
      return {
        label: "Completed",
        icon: "check_circle",
        colorClass: "bg-primary-container text-on-primary",
      };
    }
    if (order.status === "pending") {
      return {
        label: "Awaiting Kitchen Confirmation",
        icon: "hourglass_top",
        colorClass: "bg-surface-container-high text-on-surface-variant",
      };
    }
    return {
      label: "Order Confirmed & In Production",
      icon: "verified",
      colorClass: "bg-primary-container/10 text-primary-container",
    };
  };

  const badge = getBadgeContent();
  const placedTime = order.timeline?.placedAt || "Recently";

  return (
    <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden relative border border-outline-variant/40">
      <div className="p-space-lg md:p-space-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg relative z-10">
        <div className="flex items-start gap-space-lg max-w-2xl">
          <div
            className={`w-16 h-16 shrink-0 rounded-full flex items-center justify-center shadow-md ${
              isCancelled
                ? "bg-error text-on-error"
                : "bg-primary text-on-primary"
            }`}
          >
            <span
              className="material-symbols-outlined text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isCancelled ? "cancel" : isDelivered ? "verified" : "check_circle"}
            </span>
          </div>

          <div className="flex flex-col gap-space-xs">
            <div className={`inline-flex items-center gap-space-xs px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.colorClass} w-fit`}>
              <span className="font-label-sm text-label-sm uppercase tracking-wider">
                {badge.label}
              </span>
              <span className="material-symbols-outlined text-sm">{badge.icon}</span>
            </div>

            <h1 className="font-headline-lg text-headline-lg text-primary leading-tight mt-1">
              {getHeroHeading()}
            </h1>

            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Order Reference:{" "}
              <strong className="text-on-surface font-medium">#{order.orderId}</strong> • Placed at{" "}
              {placedTime} at {order.restaurantName}.
            </p>
            <p className="font-body-sm text-body-sm text-secondary font-medium">
              {getHeroSubText()}
            </p>
          </div>
        </div>

        {/* Estimated Arrival / Ready Time Widget */}
        {!isCancelled && (
          <div className="w-full md:w-auto bg-surface-container-low rounded-lg p-space-md flex flex-col gap-1 min-w-[280px] border border-outline-variant/30">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              {order.fulfillmentMode === "delivery"
                ? "Estimated Arrival"
                : order.fulfillmentMode === "takeaway"
                ? "Estimated Ready Time"
                : "Estimated Table Readiness"}
            </span>

            <div className="flex items-baseline gap-2">
              <span className="font-headline-md text-headline-md text-secondary font-display font-medium">
                {isDelivered ? "Delivered" : order.estimatedDeliveryTime}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-body-sm text-body-sm text-primary font-medium">
              <span className="material-symbols-outlined text-base">schedule</span>
              <span>
                {isDelivered
                  ? "Order finalized"
                  : `Approx. ${order.remainingMinutes || 30} mins remaining`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
