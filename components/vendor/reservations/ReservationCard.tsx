// components/vendor/reservations/ReservationCard.tsx
"use client";

import { useState } from "react";
import {
  VendorReservation,
  TableEntity,
} from "@/types/reservation";

interface ExtendedReservation extends VendorReservation {
  avatarUrl?: string | null;
  avatar?: string | null;
  userImage?: string | null;
  tableNumber?: string;
  tableId?: string;
  displayDate?: string;
  date?: string;
  time?: string;
  specialNotes?: string;
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
  } | null;
  [key: string]: any;
}

interface ReservationCardProps {
  reservation: ExtendedReservation;
  tables: (TableEntity & { [key: string]: any })[];
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
  const rawTableRef =
    reservation.assignedTableId ||
    reservation.tableNumber ||
    reservation.tableId ||
    tables[0]?.label ||
    tables[0]?.name ||
    tables[0]?.id ||
    "Table 1";

  const cleanTableNumber = String(rawTableRef).startsWith("Table ")
    ? rawTableRef
    : `Table ${rawTableRef}`;

  const [selectedTableId, setSelectedTableId] = useState<string>(cleanTableNumber);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 1. Resolve Avatar directly from user relation (never restaurant image)
  const avatarSrc =
    reservation.user?.avatarUrl ||
    reservation.avatarUrl ||
    null;

  // 2. Resolve Guest Name directly from user relation
  const displayName =
    reservation.user?.name ||
    reservation.guestName ||
    "Dining Guest";

  // 3. Resolve Unique Phone Number directly from user relation
  const displayPhone =
    reservation.user?.phone ||
    reservation.phone ||
    "No contact provided";

  // 4. Fallback Initials
  const guestInitials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part: string) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "DG";

  const suitableTables = tables.filter(
    (t) =>
      t.capacity >= reservation.partySize &&
      (t.status === "available" ||
        t.id === reservation.assignedTableId ||
        t.label === reservation.assignedTableId ||
        t.name === reservation.assignedTableId)
  );

  const availableTableOptions = suitableTables.length > 0 ? suitableTables : tables;

  const handleConfirmClick = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onAccept(reservation.id, selectedTableId);
      setIsProcessing(false);
    }, 300);
  };

  const isPending = reservation.status === "pending";
  const isConfirmed = reservation.status === "confirmed";
  const isSeated = reservation.status === "seated";
  const isCancelled = reservation.status === "cancelled";
  const isRejected = reservation.status === "rejected";

  const displaySlotDate =
    reservation.displayDate ||
    reservation.reservationDate ||
    reservation.date ||
    "Today";

  const displaySlotTime =
    reservation.reservationTime ||
    reservation.time ||
    "08:00 PM";

  const guestNoteText =
    reservation.specialNotes ||
    reservation.guestNotes ||
    "";

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md border border-[#1b3b2b]/10 transition-all relative overflow-hidden group">
      {/* Dynamic Left Status Accent Line */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${isPending
            ? "bg-amber-500 animate-pulse"
            : isSeated
              ? "bg-[#C05621]"
              : isConfirmed
                ? "bg-emerald-600"
                : isRejected || isCancelled
                  ? "bg-red-400"
                  : "bg-[#1b3b2b]"
          }`}
      />

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
        {/* Guest Profile & Avatar */}
        <div className="flex items-start gap-4">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-neutral-200/80 bg-neutral-100 flex items-center justify-center shadow-xs">
            {avatarSrc && !imageError ? (
              <img
                src={avatarSrc}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-[#1b3b2b] to-[#2d5f46] text-white flex items-center justify-center font-bold text-sm shadow-inner uppercase tracking-wider">
                {guestInitials}
              </div>
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-[#1b3b2b] truncate capitalize">
                {displayName}
              </h3>

              {isConfirmed && (
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                  Confirmed
                </span>
              )}
              {isSeated && (
                <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  Seated Now
                </span>
              )}
              {isPending && (
                <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  Pending Request
                </span>
              )}
              {isRejected && (
                <span className="px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold uppercase tracking-wider">
                  Declined
                </span>
              )}
              {isCancelled && (
                <span className="px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200 text-[10px] font-bold uppercase tracking-wider">
                  Cancelled
                </span>
              )}
              {reservation.status === "completed" && (
                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                  Completed
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 font-medium">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-neutral-400">call</span>
                <span className="font-mono text-neutral-600">{displayPhone}</span>
              </span>
              <span className="text-neutral-300">•</span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-400">
                <span className="material-symbols-outlined text-sm text-neutral-400">tag</span>
                <span>{reservation.id.slice(-8)}</span>
              </span>
              <span className="text-neutral-300">•</span>
              <span className="flex items-center gap-1 text-[#1b3b2b] font-semibold">
                <span className="material-symbols-outlined text-sm text-neutral-400">table_bar</span>
                <span>{cleanTableNumber}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Slot & Party Details */}
        <div className="flex sm:flex-col items-start sm:items-end justify-between gap-1 shrink-0">
          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-[#1b3b2b] block">
              {displaySlotDate}
            </span>
            <span className="text-sm font-bold text-[#C05621] block mt-0.5">
              {displaySlotTime} ({reservation.mealPeriod || "Dining"})
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-100 text-[#1b3b2b] text-xs font-bold border border-neutral-200/80 mt-1">
            <span className="material-symbols-outlined text-sm text-[#1b3b2b]">group</span>
            <span>{reservation.partySize} Guests • {reservation.preferredZone || "Main Hall"}</span>
          </span>
        </div>
      </div>

      {/* Guest Note Box */}
      {guestNoteText && (
        <div className="mt-4 bg-[#FBFBFA] p-3.5 rounded-xl flex items-start gap-2.5 border border-neutral-100 text-xs">
          <span className="material-symbols-outlined text-sm text-[#C05621] shrink-0 mt-0.5">
            notes
          </span>
          <div className="flex-1">
            <span className="font-bold text-[#1b3b2b] block">Guest Special Request:</span>
            <p className="text-neutral-600 mt-0.5 italic leading-relaxed">
              &ldquo;{guestNoteText}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Bottom Action Strip */}
      <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Serial Table Selection & Allocation */}
        <div className="flex items-center gap-2">
          {isPending ? (
            <>
              <label
                className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider whitespace-nowrap"
                htmlFor={`table-select-${reservation.id}`}
              >
                Assign Table:
              </label>
              <div className="relative">
                <select
                  id={`table-select-${reservation.id}`}
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="bg-neutral-50 py-1.5 pl-3 pr-8 rounded-xl text-xs font-bold text-[#1b3b2b] border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#1b3b2b] cursor-pointer"
                >
                  {availableTableOptions.map((t) => {
                    const label = t.label || t.name || `Table ${t.id}`;
                    return (
                      <option key={t.id} value={label}>
                        {label} ({t.capacity} Seats - {t.zone})
                      </option>
                    );
                  })}
                </select>
                <span className="material-symbols-outlined text-base absolute right-2 top-2 pointer-events-none text-neutral-400">
                  expand_more
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">
                Allocated Table:
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#1b3b2b]/5 text-[#1b3b2b] border border-[#1b3b2b]/15 text-xs font-bold">
                {cleanTableNumber}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onOpenMessage(reservation)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold border border-neutral-200 transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-sm">chat</span>
            <span>Message</span>
          </button>

          {isPending && (
            <>
              <button
                onClick={() => onReject(reservation.id)}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-colors cursor-pointer"
                type="button"
              >
                Reject
              </button>
              <button
                onClick={handleConfirmClick}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                type="button"
              >
                {isProcessing ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">check</span>
                    <span>Accept &amp; Confirm</span>
                  </>
                )}
              </button>
            </>
          )}

          {isConfirmed && (
            <>
              <button
                onClick={() => onCancel(reservation.id)}
                className="px-3 py-1.5 rounded-xl text-neutral-500 hover:text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => onSeat(reservation.id)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#C05621] hover:bg-[#C05621]/90 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-sm">chair</span>
                <span>Mark Seated</span>
              </button>
            </>
          )}

          {isSeated && (
            <button
              onClick={() => onComplete(reservation.id)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-sm">done_all</span>
              <span>Complete Service</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}