"use client";

import { useState } from "react";

interface RejectReservationDialogProps {
  isOpen: boolean;
  reservationId: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const REJECTION_REASONS = [
  "Kitchen and courtyard grills at maximum capacity during requested slot.",
  "Requested zone or private suite already committed to earlier booking.",
  "Unable to accommodate special dietary/banquet request on short notice.",
  "Diner requested timing outside current dining service hours.",
];

export default function RejectReservationDialog({
  isOpen,
  reservationId,
  onClose,
  onConfirm,
}: RejectReservationDialogProps) {
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [customNote, setCustomNote] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    const finalReason = customNote.trim()
      ? `${selectedReason} - ${customNote.trim()}`
      : selectedReason;
    onConfirm(finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <span className="p-2.5 rounded-xl bg-error-container text-error flex-shrink-0">
            <span className="material-symbols-outlined text-xl">block</span>
          </span>
          <div>
            <h3 className="font-headline-sm text-lg font-bold text-primary">
              Decline Reservation {reservationId}
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Please specify the operational reason for declining this reservation request.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Select Operational Reason
          </label>
          <div className="space-y-1.5">
            {REJECTION_REASONS.map((r, i) => (
              <label
                key={i}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  selectedReason === r
                    ? "bg-error-container/20 border-error/40 text-on-surface font-medium"
                    : "bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <input
                  type="radio"
                  name="rejection_reason"
                  checked={selectedReason === r}
                  onChange={() => setSelectedReason(r)}
                  className="mt-0.5 text-secondary focus:ring-0"
                />
                <span>{r}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Additional Note (Optional)
          </label>
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. Offered alternate slot tomorrow at 7 PM..."
            className="w-full bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant text-xs text-on-surface focus:outline-none"
          />
        </div>

        <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-medium text-on-surface hover:bg-surface-container-low cursor-pointer"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-error hover:bg-error/90 text-on-error text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}
