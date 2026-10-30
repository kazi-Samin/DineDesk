"use client";

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
  order: OrderConfirmation;
  addressData?: UserAddressData;
}

export default function DeliveryTrackingCard({ order, addressData }: DeliveryTrackingCardProps) {
  const isDelivery = order.fulfillmentMode === "delivery";
  const isOutForDelivery = order.status === "out_for_delivery";
  const isDelivered = order.status === "delivered" || order.status === "completed";

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
                {order.restaurantAddress || "Banani Road 11, Dhaka"}
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

  // Resolve dynamic destination values with graceful fallbacks
  const destinationApt = addressData?.apartment || order.address?.apartment || "Shofi Villa";
  const destinationBuilding = addressData?.building || order.address?.street || "House 721, Word 24";
  const destinationRoad = addressData?.road || "Rongipara";
  const destinationCity = addressData?.city || "Chattogram";

  const mapPinLabel = addressData?.apartment && addressData?.road
    ? `${addressData.apartment}, ${addressData.road}`
    : `${destinationApt}, ${destinationBuilding}`;

  return (
    <div className="bg-white rounded-3xl shadow-xs overflow-hidden border border-[#1b3b2b]/10 transition-all">
      {/* Top Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1b3b2b] text-xl">route</span>
          <h2 className="text-sm sm:text-base font-bold text-[#1b3b2b]">Live Transit Map</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FBFBFA] text-neutral-700 rounded-full text-[11px] font-bold border border-neutral-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Simulated Fleet GPS
          </span>
        </div>
      </div>

      {/* Map Graphic Area */}
      <div className="relative w-full h-72 sm:h-80 overflow-hidden bg-neutral-100 border-b border-neutral-100">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80')",
          }}
        />

        {/* Route Line */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M 22 25 Q 50 40 50 50 T 82 78"
            fill="none"
            stroke="#C05621"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            className="opacity-90"
          />
        </svg>

        {/* Restaurant Origin Marker */}
        <div className="absolute top-4 left-4 sm:top-5 sm:left-5 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-[#1b3b2b]/15">
          <span className="material-symbols-outlined text-[#C05621] text-base">restaurant</span>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#1b3b2b] line-clamp-1">
              {order.restaurantName}
            </span>
            <span className="text-[9px] font-bold uppercase text-neutral-400">Kitchen Origin</span>
          </div>
        </div>

        {/* Dynamic Courier Pin on Path */}
        <div
          className={`absolute flex flex-col items-center group cursor-pointer transition-all ${isDelivered
              ? "bottom-8 right-8"
              : isOutForDelivery
                ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                : "top-14 left-14"
            }`}
        >
          <div className="w-10 h-10 rounded-2xl bg-[#1b3b2b] text-white shadow-xl flex items-center justify-center ring-4 ring-white/90 animate-bounce">
            <span className="material-symbols-outlined text-lg">two_wheeler</span>
          </div>
          <span className="mt-1 px-2.5 py-0.5 bg-neutral-900/90 text-white rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap">
            {isDelivered
              ? "Delivered at doorstep"
              : isOutForDelivery
                ? "Courier is en route"
                : "Awaiting dispatch"}
          </span>
        </div>

        {/* Destination Residence Pin */}
        <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-[#1b3b2b]/15">
          <span className="material-symbols-outlined text-[#C05621] text-base">
            location_on
          </span>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#1b3b2b] line-clamp-1 max-w-[150px]">
              {mapPinLabel}
            </span>
            <span className="text-[9px] font-bold uppercase text-neutral-400">
              {addressData?.city || destinationCity}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}