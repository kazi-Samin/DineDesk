"use client";

import { useState } from "react";
import {
  TableEntity,
  SeatingZone,
  WalkInFormInput,
} from "@/types/reservation";

interface ManualWalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableEntity[];
  onSubmit: (input: WalkInFormInput) => void;
}

export default function ManualWalkInModal({
  isOpen,
  onClose,
  tables,
  onSubmit,
}: ManualWalkInModalProps) {
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [preferredZone, setPreferredZone] = useState<SeatingZone>("Courtyard Terrace");
  const [reservationDate, setReservationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reservationTime, setReservationTime] = useState("8:00 PM");
  const [mealPeriod, setMealPeriod] = useState<"Dinner" | "Lunch">("Dinner");
  const [tableId, setTableId] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // Filter available tables for the zone and party size
  const eligibleTables = tables.filter(
    (t) => t.capacity >= partySize && t.status === "available"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError("Please enter the guest's name.");
      return;
    }
    const chosenTable = tableId || eligibleTables[0]?.id;
    if (!chosenTable) {
      setError("Please select an available table.");
      return;
    }

    onSubmit({
      guestName: guestName.trim(),
      phone: phone.trim() || "(313) 555-0100",
      partySize: Number(partySize),
      reservationDate,
      reservationTime,
      mealPeriod,
      preferredZone,
      tableId: chosenTable,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary-container text-on-primary">
              <span className="material-symbols-outlined text-lg">add_circle</span>
            </span>
            <div>
              <h3 className="font-headline-sm text-lg font-bold text-primary">
                Manual Walk-in Seating
              </h3>
              <p className="text-xs text-on-surface-variant">
                Create a walk-in record and allocate immediate floor seating
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-error-container text-error text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Guest Name *
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Jordan Smith"
                className="w-full bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant text-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(313) 555-..."
                className="w-full bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant text-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Party Size
              </label>
              <select
                value={partySize}
                onChange={(e) => setPartySize(Number(e.target.value))}
                className="w-full bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant text-sm text-on-surface focus:outline-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
                  <option key={num} value={num}>
                    {num} Guests
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Time
              </label>
              <input
                type="text"
                value={reservationTime}
                onChange={(e) => setReservationTime(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant text-sm text-on-surface focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Meal Period
              </label>
              <select
                value={mealPeriod}
                onChange={(e) => setMealPeriod(e.target.value as "Dinner" | "Lunch")}
                className="w-full bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant text-sm text-on-surface focus:outline-none cursor-pointer"
              >
                <option value="Dinner">Dinner</option>
                <option value="Lunch">Lunch</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Select Available Table (Capacity ≥ {partySize})
            </label>
            <select
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant text-sm text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="">-- Choose Floor Table --</option>
              {eligibleTables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} (Max {t.capacity} pax)
                </option>
              ))}
            </select>
            {eligibleTables.length === 0 && (
              <p className="text-[11px] text-error mt-1">
                No free tables match this party size. Please check the interactive floor manager.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Host / Seating Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Near courtyard window, celebrating birthday..."
              className="w-full bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant text-sm text-on-surface focus:outline-none resize-none"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-medium text-on-surface hover:bg-surface-container-low cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary shadow-sm transition-colors cursor-pointer"
            >
              Confirm &amp; Seat Walk-in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
