"use client";

import { useEffect, useState } from "react";
import { CustomerReservation } from "@/types/customerReservation";

interface ModifyReservationModalProps {
  isOpen: boolean;
  reservation: CustomerReservation | null;
  onClose: () => void;
  onSave: (updated: CustomerReservation) => void;
}

export default function ModifyReservationModal({
  isOpen,
  reservation,
  onClose,
  onSave,
}: ModifyReservationModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [seatingArea, setSeatingArea] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen && reservation) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      setDate(reservation.date);
      setTime(reservation.time);
      setPartySize(reservation.partySize);
      setSeatingArea(reservation.seatingArea);
      setSpecialNotes(reservation.specialNotes || "");
      setError(null);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, reservation, onClose]);

  if (!isOpen || !reservation) return null;

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError("Please select a reservation date.");
      return;
    }
    if (date < todayStr) {
      setError("Reservation date cannot be in the past.");
      return;
    }
    if (!time) {
      setError("Please select a valid time slot.");
      return;
    }
    if (partySize < 1 || partySize > 12) {
      setError("Party size must be between 1 and 12 guests.");
      return;
    }

    // Format new display date
    const d = new Date(date + "T00:00:00");
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const displayDate = `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;

    const updated: CustomerReservation = {
      ...reservation,
      date,
      displayDate,
      time,
      partySize,
      seatingArea,
      specialNotes: specialNotes.trim() || undefined,
      statusDisplay: "Confirmed",
    };

    onSave(updated);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 p-space-lg flex flex-col gap-space-md animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modify-res-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
          <div className="flex items-center gap-space-sm">
            <span className="p-2 bg-primary-container text-on-primary rounded-xl">
              <span className="material-symbols-outlined text-xl">
                edit_calendar
              </span>
            </span>
            <div>
              <h3
                id="modify-res-title"
                className="font-headline-sm text-lg font-semibold text-primary"
              >
                Modify Seating Hold
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant">
                {reservation.restaurantName} • Ref #{reservation.id}
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

        {error && (
          <div className="p-2.5 bg-error-container text-on-error-container rounded-lg text-xs font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface">
                Reservation Date *
              </label>
              <input
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-space-md py-2 bg-surface-container-lowest rounded-md border border-outline-variant/60 font-body-sm text-body-sm focus:outline-none focus:border-primary-container"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface">
                Time Slot *
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="px-space-md py-2 bg-surface-container-lowest rounded-md border border-outline-variant/60 font-body-sm text-body-sm focus:outline-none focus:border-primary-container"
              >
                <option value="12:30 PM (Lunch)">12:30 PM (Lunch)</option>
                <option value="1:00 PM (Lunch)">1:00 PM (Lunch)</option>
                <option value="1:30 PM (Lunch)">1:30 PM (Lunch)</option>
                <option value="7:00 PM (Dinner)">7:00 PM (Dinner)</option>
                <option value="7:30 PM (Dinner)">7:30 PM (Dinner)</option>
                <option value="8:00 PM (Sharp)">8:00 PM (Sharp)</option>
                <option value="8:30 PM (Dinner)">8:30 PM (Dinner)</option>
                <option value="9:00 PM (Dinner)">9:00 PM (Dinner)</option>
              </select>
            </div>
          </div>

          {/* Party Size & Seating Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface">
                Party Size (Guests) *
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant/60 bg-surface-container-low hover:bg-surface-container text-primary font-bold"
                >
                  -
                </button>
                <span className="flex-1 text-center font-label-md font-semibold text-on-surface py-1.5 border border-outline-variant/40 rounded-lg bg-surface-container-lowest">
                  {partySize} {partySize === 1 ? "Guest" : "Guests"}
                </span>
                <button
                  type="button"
                  onClick={() => setPartySize((p) => Math.min(12, p + 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant/60 bg-surface-container-low hover:bg-surface-container text-primary font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface">
                Seating Area
              </label>
              <select
                value={seatingArea}
                onChange={(e) => setSeatingArea(e.target.value)}
                className="px-space-md py-2 bg-surface-container-lowest rounded-md border border-outline-variant/60 font-body-sm text-body-sm focus:outline-none focus:border-primary-container"
              >
                <option value="Courtyard Seating #C-04">Courtyard Seating</option>
                <option value="Main Dining Hall">Main Dining Hall</option>
                <option value="Omakase Counter">Omakase Counter</option>
                <option value="Family Hall">Family Hall</option>
                <option value="Patio Garden">Patio Garden</option>
                <option value="Private Dining Room">Private Dining Room</option>
              </select>
            </div>
          </div>

          {/* Special Notes */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface">
              Special Instructions / Dietary Notes
            </label>
            <textarea
              rows={2}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="e.g. Quiet table, birthday celebration, high chair..."
              className="px-space-md py-2 bg-surface-container-lowest rounded-md border border-outline-variant/60 font-body-sm text-body-sm focus:outline-none focus:border-primary-container resize-none"
            />
          </div>

          <div className="p-space-sm bg-surface-container-low rounded-lg text-xs text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-sm">
              info
            </span>
            <span>
              Changes to seating holds are confirmed immediately in this prototype session.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-space-md py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              className="px-space-lg py-2 bg-primary-container text-on-primary rounded-lg font-label-md text-label-md font-semibold hover:bg-primary shadow-xs transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">save</span>
              Save Modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
