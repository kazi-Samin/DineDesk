"use client";

import { useState } from "react";
import {
  VendorReservation,
  TableEntity,
} from "@/types/reservation";

interface ReservationCardProps {
  reservation: VendorReservation;
  tables: TableEntity[];
  onAccept: (reservationId: string, tableId: string) => void;
  onReject: (reservationId: string) => void;
  onSeat: (reservationId: string) => void;
  onComplete: (reservationId: string) => void;
  onCancel: (reservationId: string) => void;
  onOpenMessage: (reservation: VendorReservation) => void;
}

export default function ReservationCard({
  reservation,
  tables,
  onAccept,
  onReject,
  onSeat,
  onComplete,
  onCancel,
  onOpenMessage,
}: ReservationCardProps) {
  const [selectedTableId, setSelectedTableId] = useState<string>(
    reservation.assignedTableId || tables[0]?.id || "C-4"
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Left stripe color based on priority/occasion
  const stripeColor =
    reservation.occasionType === "celebration" || reservation.status === "pending"
      ? "bg-secondary"
      : reservation.occasionType === "business"
      ? "bg-primary-container"
      : reservation.occasionType === "accessibility"
      ? "bg-surface-tint"
      : "bg-outline-variant";

  // Filter tables that can accommodate party size
  const suitableTables = tables.filter(
    (t) => t.capacity >= reservation.partySize && (t.status === "available" || t.id === reservation.assignedTableId)
  );

  const allFilteredTables = suitableTables.length > 0 ? suitableTables : tables;

  const handleConfirmClick = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onAccept(reservation.id, selectedTableId);
      setIsProcessing(false);
    }, 400);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Left Accent Stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${stripeColor}`}></div>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-space-md">
        {/* Diner & Meta Info */}
        <div className="flex items-start gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary font-headline-sm text-headline-sm flex-shrink-0 font-semibold">
            {reservation.initials}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                {reservation.guestName}
              </h3>

              {reservation.guestType === "VIP Diner" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-xs">verified</span> VIP Diner
                </span>
              )}

              {reservation.guestType === "Corporate Guest" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-xs">domain</span> Corporate Guest
                </span>
              )}

              {reservation.guestType === "First-time Diner" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                  First-time Diner
                </span>
              )}

              {reservation.guestSubtitle && (
                <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                  {reservation.guestSubtitle}
                </span>
              )}

              {/* Status Badge for Non-pending */}
              {reservation.status === "confirmed" && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-semibold">
                  Confirmed
                </span>
              )}
              {reservation.status === "seated" && (
                <span className="px-2 py-0.5 rounded-md bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold animate-pulse">
                  Seated Now
                </span>
              )}
              {reservation.status === "rejected" && (
                <span className="px-2 py-0.5 rounded-md bg-error-container text-error font-label-sm text-label-sm font-semibold">
                  Declined
                </span>
              )}
              {reservation.status === "cancelled" && (
                <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                  Cancelled
                </span>
              )}
              {reservation.status === "completed" && (
                <span className="px-2 py-0.5 rounded-md bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
                  Completed
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">call</span> {reservation.phone}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">confirmation_number</span>{" "}
                {reservation.id}
              </span>
              <span className={`flex items-center gap-1 ${reservation.status === "pending" ? "text-secondary font-medium" : ""}`}>
                <span className="material-symbols-outlined text-sm">schedule</span>{" "}
                {reservation.requestAge}
              </span>
            </div>
          </div>
        </div>

        {/* Booking Slot & Party Badges */}
        <div className="flex lg:flex-col items-start lg:items-end justify-between gap-1 flex-shrink-0">
          <div className="text-left lg:text-right">
            <span className="font-label-lg text-label-lg font-bold text-primary">
              {reservation.displayDate || reservation.reservationDate}
            </span>
            <span className="block font-headline-sm text-headline-sm text-on-surface">
              {reservation.reservationTime} ({reservation.mealPeriod})
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
            <span className="material-symbols-outlined text-sm">
              {reservation.occasionType === "accessibility"
                ? "accessible"
                : reservation.partySize > 6
                ? "diversity_3"
                : "group"}
            </span>{" "}
            {reservation.partySize} Guests · {reservation.preferredZone}
          </span>
        </div>
      </div>

      {/* Special Occasion / Dietary / Request Highlight Box */}
      {(reservation.occasion || reservation.guestNotes) && (
        <div className="mt-space-md bg-surface-container-low p-space-md rounded-lg flex items-start gap-space-sm border border-outline-variant/30">
          <span
            className={`material-symbols-outlined text-lg mt-0.5 ${
              reservation.occasionType === "celebration"
                ? "text-secondary"
                : reservation.occasionType === "business"
                ? "text-primary"
                : reservation.occasionType === "accessibility"
                ? "text-primary-container"
                : "text-on-surface-variant"
            }`}
          >
            {reservation.occasionType === "celebration"
              ? "celebration"
              : reservation.occasionType === "business"
              ? "business_center"
              : reservation.occasionType === "accessibility"
              ? "accessible_forward"
              : "info"}
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md font-semibold text-on-surface">
                {reservation.occasion || "Guest Booking Preference"}
              </span>
              {reservation.occasionBadge && (
                <span
                  className={`font-label-sm text-label-sm font-semibold uppercase tracking-wide ${
                    reservation.occasionType === "celebration"
                      ? "text-secondary"
                      : "text-on-surface-variant"
                  }`}
                >
                  {reservation.occasionBadge}
                </span>
              )}
            </div>
            {reservation.guestNotes && (
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 italic">
                &ldquo;{reservation.guestNotes}&rdquo;
              </p>
            )}
            {reservation.rejectionReason && (
              <p className="font-body-sm text-body-sm text-error mt-1 font-medium">
                Note: {reservation.rejectionReason}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="mt-space-lg pt-space-md border-t border-outline-variant/30 bg-surface-container-lowest flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
        {/* Table Selector / Assigned Display */}
        <div className="flex items-center gap-space-sm">
          {reservation.status === "pending" ? (
            <>
              <label
                className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase whitespace-nowrap"
                htmlFor={`table-select-${reservation.id}`}
              >
                Assign Table:
              </label>
              <div className="relative w-full md:w-64">
                <select
                  className="w-full bg-surface-container-low py-2 pl-3 pr-8 rounded-lg font-label-md text-label-md text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/40 cursor-pointer"
                  id={`table-select-${reservation.id}`}
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                >
                  {allFilteredTables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                  <option value="WAITING_BUFFER">Hold in Waiting Buffer</option>
                </select>
                <span className="material-symbols-outlined text-base absolute right-2.5 top-2.5 pointer-events-none text-on-surface-variant">
                  expand_more
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase">
                Allocated Table:
              </span>
              <span className="px-2.5 py-1 rounded-md bg-surface-container text-primary font-label-md font-bold">
                {reservation.assignedTableId
                  ? `Table ${reservation.assignedTableId}`
                  : "General Seating"}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-space-sm justify-end">
          <button
            onClick={() => onOpenMessage(reservation)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-base">chat</span>
            <span>Message</span>
          </button>

          {/* Conditional actions based on reservation status */}
          {reservation.status === "pending" && (
            <>
              <button
                onClick={() => onReject(reservation.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-error-container hover:bg-error/20 text-error font-label-md text-label-md font-semibold transition-colors cursor-pointer"
                type="button"
              >
                <span>Reject</span>
              </button>
              <button
                onClick={handleConfirmClick}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-75"
                type="button"
              >
                {isProcessing ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">check</span>
                    <span>Accept &amp; Confirm</span>
                  </>
                )}
              </button>
            </>
          )}

          {reservation.status === "confirmed" && (
            <>
              <button
                onClick={() => onCancel(reservation.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-error/10 text-error font-label-md text-label-md font-semibold transition-colors cursor-pointer"
                type="button"
              >
                <span>Cancel</span>
              </button>
              <button
                onClick={() => onSeat(reservation.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-label-md text-label-md font-semibold shadow-sm transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-base">chair</span>
                <span>Mark Seated</span>
              </button>
            </>
          )}

          {reservation.status === "seated" && (
            <button
              onClick={() => onComplete(reservation.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-sm transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-base">done_all</span>
              <span>Complete Service</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
