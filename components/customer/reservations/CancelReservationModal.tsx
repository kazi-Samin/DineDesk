"use client";

import { useEffect } from "react";
import { CustomerReservation } from "@/types/customerReservation";

interface CancelReservationModalProps {
  isOpen: boolean;
  reservation: CustomerReservation | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CancelReservationModal({
  isOpen,
  reservation,
  onClose,
  onConfirm,
}: CancelReservationModalProps) {
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
        aria-labelledby="cancel-res-title"
      >
        <div className="flex items-start gap-space-sm">
          <div className="p-2.5 bg-error-container text-error rounded-xl shrink-0">
            <span className="material-symbols-outlined text-2xl">
              event_busy
            </span>
          </div>
          <div className="flex-1">
            <h3
              id="cancel-res-title"
              className="font-headline-sm text-lg font-semibold text-primary"
            >
              Release Seating Hold?
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
              Are you sure you want to cancel your reservation at{" "}
              <strong className="text-on-surface">{reservation.restaurantName}</strong>?
            </p>
          </div>
        </div>

        {/* Details Box */}
        <div className="p-space-sm bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs flex flex-col gap-1 text-on-surface-variant">
          <div>
            <strong className="text-on-surface">Reference:</strong> #{reservation.id}
          </div>
          <div>
            <strong className="text-on-surface">Date &amp; Time:</strong> {reservation.displayDate} • {reservation.time}
          </div>
          <div>
            <strong className="text-on-surface">Party:</strong> {reservation.partySize} Guests ({reservation.seatingArea})
          </div>
          <div className="text-[11px] text-secondary mt-1 pt-1 border-t border-outline-variant/30">
            Grace period: Free cancellation applies. Your table hold will be released for fellow patrons.
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onClose}
            className="px-space-md py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            Keep Hold
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-space-lg py-2 bg-error text-on-error hover:bg-error/90 rounded-lg font-label-md text-label-md font-semibold transition-all shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">close</span>
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
}
