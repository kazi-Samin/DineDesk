"use client";

import { OrderConfirmation } from "@/types/order";

interface DeliveryTrackingCardProps {
  order: OrderConfirmation;
}

export default function DeliveryTrackingCard({ order }: DeliveryTrackingCardProps) {
  const isDelivery = order.fulfillmentMode === "delivery";
  const isOutForDelivery = order.status === "out_for_delivery";
  const isDelivered = order.status === "delivered" || order.status === "completed";

  if (!isDelivery) {
    return (
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md border border-outline-variant/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary-container">
              {order.fulfillmentMode === "takeaway" ? "takeout_dining" : "table_restaurant"}
            </span>
            <h2 className="font-headline-sm text-headline-sm text-primary">
              {order.fulfillmentMode === "takeaway" ? "Takeaway Pickup Details" : "Dine-In Reservation Details"}
            </h2>
          </div>
          <span className="font-label-sm text-label-sm px-2.5 py-1 bg-surface-container text-primary font-semibold rounded">
            {order.fulfillmentMode === "takeaway" ? "Express Counter" : "Host Stand Check-in"}
          </span>
        </div>

        <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-2">
          <div className="flex items-start gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-xl shrink-0 mt-0.5">
              storefront
            </span>
            <div>
              <p className="font-label-lg font-semibold text-on-surface">{order.restaurantName}</p>
              <p className="font-body-sm text-on-surface-variant">
                {order.restaurantAddress || "Banani Road 11, Dhaka"}
              </p>
              <p className="font-body-sm text-primary-container font-medium mt-1">
                Contact: {order.restaurantPhone || "+880 1712-490211"}
              </p>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-outline-variant/50 text-body-sm text-on-surface-variant">
            {order.fulfillmentMode === "takeaway" ? (
              <p>
                <strong>Pickup Instructions:</strong> Please present your Order ID{" "}
                <span className="text-primary font-bold">#{order.orderId}</span> at the dedicated takeaway pick-up station. Hot thermal seal intact.
              </p>
            ) : (
              <p>
                <strong>Dine-In Protocol:</strong> Inform our head steward at the reception desk with your name{" "}
                <span className="text-primary font-bold">{order.contact.fullName}</span> or Order reference #{order.orderId}. Your dining table and culinary courses are scheduled.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const destinationStreet = order.address?.street || "House 18, Road 11";
  const destinationApt = order.address?.apartment || "Apartment 4B";
  const deliveryNotes = order.address?.instructions || "Leave with reception security or dial intercom.";

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md border border-outline-variant/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary-container">route</span>
          <h2 className="font-headline-sm text-headline-sm text-primary">Live Transit Map</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container text-on-surface rounded font-label-sm text-label-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            Simulated Fleet GPS
          </span>
        </div>
      </div>

      {/* Simulated Live Vector Map Canvas */}
      <div className="relative w-full h-80 rounded-lg overflow-hidden bg-surface-container-high shadow-inner border border-outline-variant/30">
        <div
          className="w-full h-full bg-cover bg-center"
          data-location="Banani Road 11, Dhaka"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA1Obl42j8CwgesTxCkALVaqw_t4RtdmRv4KhuRRFQj9SdXFMqkmvxnZsL5pAJHV2fpPUVuT7i0palc5cvvGO-FX26-HfDUVRDY-GDTW5yKH7pwRWgaDOdtlvUsKgR4gAw2__7z8SRv3QECijXaYYtrEtTV8N5ZHNM31hfN6Y2blKpGiIuXMVQiCdIAEXXNxIdLDpO4Qood4yrG5-bcDSUD3ATs4oaOdsEwHaou1lrDad0TzgQ4QTZYAw')",
          }}
        ></div>

        {/* Stylized Route Visual Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent pointer-events-none"></div>

        {/* Simulated Route Line (SVG) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M 22 25 Q 50 40 50 50 T 82 78"
            fill="none"
            stroke="#9f4122"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            className="opacity-90"
          />
        </svg>

        {/* Restaurant Origin Marker */}
        <div className="absolute top-6 left-6 flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-md border border-outline-variant/40">
          <span className="material-symbols-outlined text-secondary text-base">restaurant</span>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm font-bold text-on-surface">
              {order.restaurantName}
            </span>
            <span className="text-[10px] text-on-surface-variant">Banani Origin</span>
          </div>
        </div>

        {/* Active Rider Marker on transit path */}
        <div
          className={`absolute flex flex-col items-center group cursor-pointer transition-all ${
            isDelivered
              ? "bottom-10 right-10"
              : isOutForDelivery
              ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              : "top-16 left-16"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-primary text-on-primary shadow-xl flex items-center justify-center ring-4 ring-white/70 animate-bounce">
            <span className="material-symbols-outlined text-lg">two_wheeler</span>
          </div>
          <span className="mt-1 px-2 py-0.5 bg-inverse-surface text-inverse-on-surface rounded font-label-sm text-[11px] shadow">
            {isDelivered
              ? "Delivered at doorstep"
              : isOutForDelivery
              ? "Kabir is en route"
              : "Awaiting dispatch"}
          </span>
        </div>

        {/* Diner Destination Pin */}
        <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-md border border-outline-variant/40">
          <span className="material-symbols-outlined text-primary-container text-base">
            location_on
          </span>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm font-bold text-on-surface">
              Your Residence
            </span>
            <span className="text-[10px] text-on-surface-variant truncate max-w-[140px]">
              {destinationStreet}
            </span>
          </div>
        </div>
      </div>

      {/* Drop-off Instructions & Address */}
      <div className="bg-surface-container rounded-lg p-space-md flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
            Delivery Destination
          </span>
          <span className="font-label-sm text-label-sm text-secondary font-medium">
            Contactless Insulated Dispatch
          </span>
        </div>
        <div className="flex items-start gap-space-sm">
          <span className="material-symbols-outlined text-primary-container shrink-0 mt-0.5">
            home
          </span>
          <div className="flex flex-col">
            <span className="font-body-lg text-body-lg font-medium text-on-surface">
              {destinationApt}, {destinationStreet}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {order.address?.floor || "Floor 4"} • Banani, Dhaka
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-lowest p-2 rounded mt-2 border border-outline-variant/30">
              <strong className="text-on-surface font-medium">Delivery Note:</strong> {deliveryNotes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
