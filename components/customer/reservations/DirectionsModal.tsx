"use client";

import { useEffect } from "react";
import { CustomerReservation } from "@/types/customerReservation";

interface DirectionsModalProps {
  isOpen: boolean;
  reservation: CustomerReservation | null;
  onClose: () => void;
}

export default function DirectionsModal({
  isOpen,
  reservation,
  onClose,
}: DirectionsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !reservation) return null;

  const mapQuery = encodeURIComponent(
    `${reservation.restaurantName}, ${reservation.fullAddress}`
  );
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 p-space-lg flex flex-col gap-space-md animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="directions-title"
      >
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
          <div className="flex items-center gap-space-sm">
            <span className="p-2 bg-primary-fixed text-primary rounded-xl">
              <span className="material-symbols-outlined text-xl">
                directions
              </span>
            </span>
            <div>
              <h3
                id="directions-title"
                className="font-headline-sm text-lg font-semibold text-primary"
              >
                Venue Coordinates
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Transit &amp; Arrival Directives
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-md"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Address Card */}
        <div className="flex flex-col gap-space-sm p-space-md bg-surface-container-low rounded-xl border border-outline-variant/30">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-secondary text-lg mt-0.5">
              storefront
            </span>
            <div>
              <h4 className="font-label-lg font-semibold text-primary">
                {reservation.restaurantName}
              </h4>
              <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                {reservation.fullAddress}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-outline-variant/20 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-on-surface">
              <span className="material-symbols-outlined text-sm text-surface-tint">
                local_parking
              </span>
              <span>Valet Available</span>
            </div>
            <div className="flex items-center gap-1.5 text-on-surface">
              <span className="material-symbols-outlined text-sm text-surface-tint">
                accessible
              </span>
              <span>Step-Free Entry</span>
            </div>
          </div>
        </div>

        {/* Advisory */}
        <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
          Please arrive 5 to 10 minutes ahead of your slot time (<strong>{reservation.time}</strong>) to ensure your table hold remains secured without expiration.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onClose}
            className="px-space-md py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            Close
          </button>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-space-lg py-2 bg-primary-container text-on-primary rounded-lg font-label-md text-label-md font-semibold hover:bg-primary transition-all shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">
              open_in_new
            </span>
            Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
