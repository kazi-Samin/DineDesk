"use client";

import { useState } from "react";

interface BulkAvailabilityDialogProps {
  isOpen: boolean;
  totalDishesCount: number;
  onClose: () => void;
  onConfirm: (isAvailable: boolean) => void;
}

export default function BulkAvailabilityDialog({
  isOpen,
  totalDishesCount,
  onClose,
  onConfirm,
}: BulkAvailabilityDialogProps) {
  const [targetStatus, setTargetStatus] = useState<"in_stock" | "sold_out">("in_stock");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <span className="p-2.5 rounded-xl bg-surface-container text-primary flex-shrink-0">
            <span className="material-symbols-outlined text-xl">sync_alt</span>
          </span>
          <div>
            <h3 className="font-headline-sm text-lg font-bold text-primary">
              Bulk Availability Update
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Batch update kitchen availability across all {totalDishesCount} dishes in your culinary catalog.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Choose Action
          </label>

          <label
            className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
              targetStatus === "in_stock"
                ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-medium"
                : "bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <input
              type="radio"
              name="bulk_status"
              checked={targetStatus === "in_stock"}
              onChange={() => setTargetStatus("in_stock")}
              className="mt-0.5 text-primary-container focus:ring-0"
            />
            <div>
              <span className="font-semibold block text-emerald-800">
                ✓ Mark All Items In Stock
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Enables immediate live ordering for all dishes in the dining catalog.
              </span>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
              targetStatus === "sold_out"
                ? "bg-amber-50 border-amber-300 text-amber-900 font-medium"
                : "bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <input
              type="radio"
              name="bulk_status"
              checked={targetStatus === "sold_out"}
              onChange={() => setTargetStatus("sold_out")}
              className="mt-0.5 text-primary-container focus:ring-0"
            />
            <div>
              <span className="font-semibold block text-amber-800">
                ✕ Mark All Items Sold Out
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Temporarily pauses kitchen dispatch for end-of-shift or holiday closure.
              </span>
            </div>
          </label>
        </div>

        <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-low cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(targetStatus === "in_stock");
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary shadow-sm transition-colors cursor-pointer"
          >
            Apply Bulk Update
          </button>
        </div>
      </div>
    </div>
  );
}
