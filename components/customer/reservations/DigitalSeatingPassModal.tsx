"use client";

import { useEffect } from "react";
import { CustomerReservation } from "@/types/customerReservation";

interface DigitalSeatingPassModalProps {
  isOpen: boolean;
  reservation: CustomerReservation | null;
  onClose: () => void;
}

export default function DigitalSeatingPassModal({
  isOpen,
  reservation,
  onClose,
}: DigitalSeatingPassModalProps) {
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 overflow-hidden flex flex-col animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="seating-pass-title"
      >
        {/* Pass Top Banner */}
        <div className="bg-primary px-space-lg py-space-md text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-2xl text-primary-fixed">
              confirmation_number
            </span>
            <div>
              <span className="font-label-sm text-[11px] text-primary-fixed uppercase tracking-wider block font-semibold">
                DineDesk Patron Pass
              </span>
              <h3
                id="seating-pass-title"
                className="font-headline-sm text-lg font-medium text-on-primary"
              >
                Digital Seating Pass
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-primary/80 hover:text-on-primary p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close pass"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Pass Ticket Body */}
        <div className="p-space-lg flex flex-col gap-space-md bg-surface-container-lowest">
          {/* Restaurant & Ref */}
          <div className="flex items-start justify-between gap-space-sm pb-space-sm border-b border-outline-variant/30">
            <div>
              <h4 className="font-headline-sm text-xl font-bold text-primary">
                {reservation.restaurantName}
              </h4>
              <p className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-sm text-secondary">
                  location_on
                </span>
                {reservation.fullAddress}
              </p>
            </div>
            <span className="font-label-sm text-xs font-mono font-bold px-2 py-1 bg-surface-container rounded-md text-primary">
              #{reservation.id}
            </span>
          </div>

          {/* Ticket Grid Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm p-space-md bg-surface-container-low rounded-xl border border-outline-variant/30">
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] text-on-surface-variant">
                Seating Date
              </span>
              <span className="font-label-md text-xs font-semibold text-on-surface">
                {reservation.displayDate}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] text-on-surface-variant">
                Slot Time
              </span>
              <span className="font-label-md text-xs font-bold text-primary">
                {reservation.time}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] text-on-surface-variant">
                Covers
              </span>
              <span className="font-label-md text-xs font-semibold text-on-surface">
                {reservation.partySize} Guests
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] text-on-surface-variant">
                Table Area
              </span>
              <span className="font-label-md text-xs font-semibold text-primary truncate">
                {reservation.seatingArea}
              </span>
            </div>
          </div>

          {/* Special Requests */}
          {reservation.specialNotes && (
            <div className="p-space-sm bg-surface-container rounded-lg text-xs text-on-surface-variant flex items-start gap-2">
              <span className="material-symbols-outlined text-secondary text-base shrink-0 mt-0.5">
                info
              </span>
              <span>
                <strong>Patron Directives:</strong> &ldquo;{reservation.specialNotes}&rdquo;
              </span>
            </div>
          )}

          {/* Simulated Pass Barcode & QR Code */}
          <div className="py-space-md px-space-lg bg-surface-container-low rounded-xl border border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 text-center">
            <div className="w-24 h-24 bg-white p-2 rounded-lg shadow-xs flex items-center justify-center border border-outline-variant/40">
              {/* SVG QR Code Simulation */}
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full text-primary"
                fill="currentColor"
              >
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v4h-4v-4zm-4 4h4v2h-4v-2zm0-4h2v2h-2v-2zm4-4h2v2h-2v-2zm-6 2h2v4h-2v-4zm2 2h2v2h-2v-2z" />
              </svg>
            </div>
            <span className="font-label-sm text-[11px] font-mono tracking-widest text-on-surface-variant">
              DD-PASS-{reservation.id}-SECURE
            </span>
            <span className="font-body-sm text-[11px] text-on-surface-variant">
              Present this pass to the Maitre d&apos; upon arrival. Table holds expire 15 mins past slot.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-space-md bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-space-md py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-space-lg py-2 bg-primary-container text-on-primary rounded-lg font-label-md text-label-md font-semibold hover:bg-primary transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-base">print</span>
            Print Seating Pass
          </button>
        </div>
      </div>
    </div>
  );
}
