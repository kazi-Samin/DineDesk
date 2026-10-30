"use client";

import { useMemo } from "react";
import { OrderConfirmation } from "@/types/order";
import { useAuth } from "@/context/AuthContext";
import { ImHappy } from "react-icons/im";

interface OrderConfirmationHeroProps {
  order: OrderConfirmation;
}

export default function OrderConfirmationHero({ order }: OrderConfirmationHeroProps) {
  const { user } = useAuth();

  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered" || order.status === "completed";

  // Dynamic user name resolution
  const customerName = useMemo(() => {
    const raw =
      user?.name ||
      order.contact?.fullName ||
      (order as any).customer?.name ||
      "Diner";

    const firstName = raw.split(" ")[0].trim();
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  }, [user?.name, order.contact?.fullName, (order as any).customer?.name]);

  const getHeroSubText = () => {
    if (isCancelled) {
      return "This order has been marked as cancelled. Any charges will be voided.";
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

  const getBadgeContent = () => {
    if (isCancelled) {
      return {
        label: "Order Cancelled",
        icon: "cancel",
        colorClass: "bg-red-50 text-red-600 border border-red-200/60",
      };
    }
    if (isDelivered) {
      return {
        label: "Completed",
        icon: "check_circle",
        colorClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
      };
    }
    if (order.status === "pending") {
      return {
        label: "Awaiting Kitchen Confirmation",
        icon: "hourglass_top",
        colorClass: "bg-neutral-100 text-neutral-700 border border-neutral-200/60",
      };
    }
    return {
      label: "Order Confirmed & In Production",
      icon: "verified",
      colorClass: "bg-[#1b3b2b]/10 text-[#1b3b2b] border border-[#1b3b2b]/15",
    };
  };

  const badge = getBadgeContent();
  const placedTime = order.timeline?.placedAt || "Recently";

  return (
    <div className="w-full bg-white rounded-2xl md:rounded-3xl shadow-xs overflow-hidden border border-[#1b3b2b]/10 transition-all">
      <div className="p-5 sm:p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">

        {/* Left Side: Status Icon & Details */}
        <div className="flex items-start gap-3.5 sm:gap-4 max-w-2xl">
          {/* Sized-down checkmark container */}
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 mt-0.5 shrink-0 rounded-xl flex items-center justify-center shadow-2xs transition-transform ${isCancelled
              ? "bg-red-50 text-red-600 border border-red-200"
              : isDelivered
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-[#1b3b2b] text-white"
              }`}
          >
            <span
              className="material-symbols-outlined text-lg sm:text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isCancelled ? "cancel" : isDelivered ? "verified" : "check"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {/* Status Pill */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${badge.colorClass} w-fit`}>
              <span>{badge.label}</span>
              <span className="material-symbols-outlined text-xs sm:text-sm">{badge.icon}</span>
            </div>

            {/* Title with styled dynamic name */}
            <div className="text-lg sm:text-xl lg:text-2xl font-extrabold text-[#1b3b2b] tracking-tight leading-snug mt-2">
              <span>Thank you, </span>
              <span className="text-[#C05621] text-xl sm:text-2xl lg:text-3xl">{customerName}</span>
              <span className="italic text-md sm:text-lg lg:text-xl text-emerald-900 block font-normal">
                <span className="flex flex-row items-center gap-0.5 my-1">
                  <ImHappy className="shrink-0" />
                  <span>Your order is confirmed.</span>
                </span>
              </span>
            </div>

            {/* Reference & Restaurant */}
            <p className="text-xs text-neutral-500 font-medium leading-relaxed">
              Order Reference:{" "}
              <strong className="text-neutral-900 font-mono font-semibold">#{order.orderId}</strong>
              {" • "}Placed {placedTime} at{" "}
              <span className="text-neutral-800 font-semibold">{order.restaurantName}</span>.
            </p>

            <p className="text-xs text-[#C05621] font-semibold mt-0.5">
              {getHeroSubText()}
            </p>
          </div>
        </div>

        {/* Right Side: Estimated Arrival Widget */}
        {!isCancelled && (
          <div className="w-full md:w-auto bg-[#FBFBFA] rounded-2xl p-4 sm:p-5 flex flex-col gap-1 min-w-[220px] md:min-w-[240px] border border-[#1b3b2b]/10 self-stretch md:self-auto shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Estimated Arrival
            </span>

            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-[#1b3b2b]">
                {isDelivered ? "Delivered" : order.estimatedDeliveryTime || "25-35 mins"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
              <span className="material-symbols-outlined text-sm text-[#1b3b2b]">schedule</span>
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