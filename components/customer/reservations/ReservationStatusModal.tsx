"use client";

import { useEffect } from "react";
import { CustomerReservation } from "@/types/customerReservation";

interface ReservationStatusModalProps {
  isOpen: boolean;
  reservation: CustomerReservation | null;
  onClose: () => void;
}

export default function ReservationStatusModal({
  isOpen,
  reservation,
  onClose,
}: ReservationStatusModalProps) {
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

  const isConfirmed = reservation.status === "confirmed";
  const isPending = reservation.status === "pending";
  const isCompleted = reservation.status === "completed";
  const isCancelled = reservation.status === "cancelled" || reservation.status === "declined";

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
        aria-labelledby="status-title"
      >
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
          <div className="flex items-center gap-space-sm">
            <span className="p-2 bg-surface-container text-primary rounded-xl">
              <span className="material-symbols-outlined text-xl">
                fact_check
              </span>
            </span>
            <div>
              <h3
                id="status-title"
                className="font-headline-sm text-lg font-semibold text-primary"
              >
                Reservation Audit
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Ref #{reservation.id} • {reservation.restaurantName}
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

        {/* Status Badge */}
        <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-between">
          <div>
            <span className="font-label-sm text-[11px] text-on-surface-variant block">
              Current Venue State
            </span>
            <span className="font-headline-sm text-base font-semibold text-primary">
              {reservation.statusDisplay}
            </span>
          </div>
          <span
            className={`px-3 py-1 rounded-lg font-label-sm text-xs font-semibold ${
              isConfirmed
                ? "bg-primary-fixed text-on-primary-fixed"
                : isPending
                ? "bg-secondary-fixed text-on-secondary-fixed"
                : isCompleted
                ? "bg-surface-container-high text-on-surface-variant"
                : "bg-error-container text-on-error-container"
            }`}
          >
            {reservation.statusDisplay}
          </span>
        </div>

        {/* Timeline */}
        <div className="flex flex-col gap-3 py-2 pl-2">
          {/* Step 1 */}
          <div className="flex items-start gap-3 relative">
            <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 z-10 text-xs">
              <span className="material-symbols-outlined text-xs">done</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-xs font-semibold text-on-surface">
                Seating Request Submitted
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                Party of {reservation.partySize} requested for {reservation.displayDate}
              </span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 relative">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 text-xs ${
                isCancelled
                  ? "bg-error text-on-error"
                  : isPending
                  ? "bg-secondary text-on-secondary animate-pulse"
                  : "bg-primary text-on-primary"
              }`}
            >
              <span className="material-symbols-outlined text-xs">
                {isCancelled ? "close" : isPending ? "hourglass_top" : "done"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-xs font-semibold text-on-surface">
                Maitre d&apos; Review &amp; Seating Allocation
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                {isPending
                  ? "Venue floor staff is reviewing table inventory"
                  : isCancelled
                  ? "Seating hold cancelled"
                  : `Assigned: ${reservation.seatingArea}`}
              </span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 relative">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 text-xs ${
                isCompleted
                  ? "bg-primary text-on-primary"
                  : isConfirmed
                  ? "bg-primary-container text-on-primary"
                  : "bg-surface-container text-outline"
              }`}
            >
              <span className="material-symbols-outlined text-xs">
                {isCompleted ? "done" : "room_service"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-xs font-semibold text-on-surface">
                {isCompleted ? "Dining Completed" : "Service Arrival & Reception"}
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                {isCompleted
                  ? "Patron points credited to account balance"
                  : "Table held up to 15 minutes past slot"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-space-xs border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onClose}
            className="px-space-md py-2 bg-primary-container text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary transition-colors"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
