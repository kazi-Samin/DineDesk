// components/orders/DeliveryTrackingCard.tsx
"use client";

import { useMemo } from "react";
import { OrderConfirmation } from "@/types/order";

export interface UserAddressData {
  id?: string;
  recipientName?: string;
  contactNumber?: string;
  category?: string;
  building?: string;
  road?: string;
  apartment?: string;
  city?: string;
  postalCode?: string;
  deliveryInstructions?: string | null;
  addressLine?: string;
  isDefault?: boolean;
}

interface DeliveryTrackingCardProps {
  order: OrderConfirmation & {
    delivery?: {
      address?: string;
      lat?: number;
      lng?: number;
      instructions?: string;
    };
    address?: {
      street?: string;
      apartment?: string;
      city?: string;
    };
    [key: string]: any;
  };
  addressData?: UserAddressData;
}

export default function DeliveryTrackingCard({ order, addressData }: DeliveryTrackingCardProps) {
  const isDelivery = order.fulfillmentMode === "delivery";
  const isOutForDelivery = order.status === "out_for_delivery";
  const isDelivered = order.status === "delivered" || order.status === "completed";

  // Check if destination address is valid or just a blank/mock placeholder
  const rawAddress = (
    order.delivery?.address ||
    addressData?.addressLine ||
    order.address?.street ||
    ""
  ).trim();

  const hasValidAddress = Boolean(
    rawAddress &&
    rawAddress.toLowerCase() !== "standard address" &&
    rawAddress.toLowerCase() !== "standard delivery address" &&
    rawAddress.toLowerCase() !== "address on file" &&
    !rawAddress.toLowerCase().includes("shofi villa")
  );

  // Dynamic label for destination
  const destinationLabel = useMemo(() => {
    if (!hasValidAddress) return "Awaiting Customer Address";
    if (addressData?.apartment && addressData?.building) {
      return `${addressData.apartment}, ${addressData.building}`;
    }
    return rawAddress.split(",")[0];
  }, [hasValidAddress, addressData, rawAddress]);

  const destinationSubLabel = useMemo(() => {
    if (!hasValidAddress) return "Pending Manager Review";
    return addressData?.city || "Chattogram, Bangladesh";
  }, [hasValidAddress, addressData]);

  // Dynamic Google Maps Query
  const mapSearchQuery = useMemo(() => {
    if (hasValidAddress) {
      return encodeURIComponent(`${rawAddress}, Chattogram, Bangladesh`);
    }
    return encodeURIComponent(
      order.restaurantAddress || "Agrabad, Chattogram, Bangladesh"
    );
  }, [hasValidAddress, rawAddress, order.restaurantAddress]);

  if (!isDelivery) {
    return (
      <div className="bg-white rounded-3xl shadow-xs p-6 flex flex-col gap-4 border border-[#1b3b2b]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#1b3b2b]">
              {order.fulfillmentMode === "takeaway" ? "takeout_dining" : "table_restaurant"}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#1b3b2b]">
              {order.fulfillmentMode === "takeaway" ? "Takeaway Pickup Details" : "Dine-In Reservation Details"}
            </h2>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 bg-neutral-100 text-[#1b3b2b] rounded-full">
            {order.fulfillmentMode === "takeaway" ? "Express Counter" : "Host Stand Check-in"}
          </span>
        </div>

        <div className="bg-[#FBFBFA] rounded-2xl p-4 sm:p-5 flex flex-col gap-2 border border-neutral-100">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#C05621] text-xl shrink-0 mt-0.5">
              storefront
            </span>
            <div>
              <p className="text-sm font-bold text-[#1b3b2b]">{order.restaurantName}</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {order.restaurantAddress || "Gulshan Avenue, Dhaka"}
              </p>
              <p className="text-xs text-[#1b3b2b] font-semibold mt-1">
                Contact: {order.restaurantPhone || "+880 1712-490211"}
              </p>
            </div>
          </div>

          <div className="mt-2 pt-2.5 border-t border-neutral-200/60 text-xs text-neutral-600 leading-relaxed">
            {order.fulfillmentMode === "takeaway" ? (
              <p>
                <strong className="text-neutral-800">Pickup Instructions:</strong> Please present your Order ID{" "}
                <span className="text-[#1b3b2b] font-mono font-bold">#{order.orderId}</span> at the counter.
              </p>
            ) : (
              <p>
                <strong className="text-neutral-800">Dine-In Protocol:</strong> Inform our head steward with your name{" "}
                <span className="text-[#1b3b2b] font-bold">{order.contact.fullName}</span> or Order Reference #{order.orderId}.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xs overflow-hidden border border-[#1b3b2b]/10 transition-all">
      {/* Top Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-neutral-100 bg-white">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1b3b2b] text-xl">near_me</span>
          <h2 className="text-sm sm:text-base font-bold text-[#1b3b2b]">Live Transit Map</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[11px] font-bold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active GPS Dispatch
          </span>
        </div>
      </div>

      {/* Google Maps Container */}
      <div className="relative w-full h-72 sm:h-80 overflow-hidden bg-neutral-100 border-b border-neutral-100">
        <iframe
          title="Google Map Live Dispatch"
          width="100%"
          height="100%"
          loading="lazy"
          className="w-full h-full border-0 filter contrast-[1.02] brightness-[0.98]"
          src={`https://maps.google.com/maps?q=${mapSearchQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
        />

        {/* Ambient Map Gradients for Premium Contrast */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />

        {/* Restaurant Origin Marker */}
        <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-[#1b3b2b]/15 max-w-[220px]">
          <div className="w-7 h-7 rounded-lg bg-[#1b3b2b] text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-sm">restaurant</span>
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block leading-none">
              Kitchen Origin
            </span>
            <span className="text-[11px] font-bold text-[#1b3b2b] truncate block mt-0.5">
              {order.restaurantName || "DineDesk Central Kitchen"}
            </span>
          </div>
        </div>

        {/* Real-Time Courier Telemetry Pin on Map */}
        <div
          className={`absolute z-10 flex flex-col items-center transition-all duration-700 pointer-events-none ${isDelivered
              ? "bottom-14 right-14"
              : isOutForDelivery
                ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                : "top-16 left-20"
            }`}
        >
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-emerald-400 opacity-75" />
            <div className="w-10 h-10 rounded-2xl bg-[#1b3b2b] text-white shadow-xl flex items-center justify-center ring-4 ring-white/95">
              <span className="material-symbols-outlined text-lg">two_wheeler</span>
            </div>
          </div>
          <span className="mt-1.5 px-2.5 py-0.5 bg-neutral-900/90 backdrop-blur-xs text-white rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap">
            {isDelivered
              ? "Delivered at doorstep"
              : isOutForDelivery
                ? "Fleet in transit"
                : "Kitchen packing order"}
          </span>
        </div>

        {/* Dynamic Destination Marker */}
        <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 z-10 flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-neutral-200/90 max-w-[260px]">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${hasValidAddress ? "bg-[#C05621] text-white" : "bg-red-50 text-red-600 border border-red-200"
              }`}
          >
            <span className="material-symbols-outlined text-sm">
              {hasValidAddress ? "pin_drop" : "location_searching"}
            </span>
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block leading-none">
              {hasValidAddress ? "Destination Point" : "Delivery Address"}
            </span>
            <span
              className={`text-[11px] font-bold truncate block mt-0.5 ${hasValidAddress ? "text-[#1b3b2b]" : "text-red-600 animate-pulse"
                }`}
            >
              {destinationLabel}
            </span>
            <span className="text-[9px] font-medium text-neutral-400 block truncate">
              {destinationSubLabel}
            </span>
          </div>
        </div>

        {/* Speed / Fleet Spec HUD */}
        <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 z-10 bg-black/75 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-2 border border-white/10 shadow-sm pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Fleet 28 km/h • Electric</span>
        </div>
      </div>
    </div>
  );
}