"use client";

import { useEffect } from "react";
import { CustomerAddress } from "@/types/customerProfile";

interface DeleteAddressModalProps {
  isOpen: boolean;
  address: CustomerAddress | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAddressModal({
  isOpen,
  address,
  onClose,
  onConfirm,
}: DeleteAddressModalProps) {
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

  if (!isOpen || !address) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/40 p-space-lg flex flex-col gap-space-md animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-addr-title"
      >
        <div className="flex items-start gap-space-sm">
          <div className="p-2.5 bg-error-container text-error rounded-xl shrink-0">
            <span className="material-symbols-outlined text-2xl">
              delete_forever
            </span>
          </div>
          <div className="flex-1">
            <h3
              id="delete-addr-title"
              className="font-headline-sm text-lg font-semibold text-primary"
            >
              Remove Delivery Coordinate?
            </h3>
            <p className="font-body-sm text-[13px] text-on-surface-variant mt-1 leading-relaxed">
              Are you sure you want to remove{" "}
              <strong className="text-on-surface">{address.label}</strong> from
              your saved delivery dispatch addresses?
            </p>
          </div>
        </div>

        {/* Address Preview Box */}
        <div className="p-space-sm bg-surface-container-low rounded-lg border border-outline-variant/30 text-left font-body-sm text-xs text-on-surface-variant">
          <div className="font-semibold text-on-surface">
            {address.recipientName} • {address.contactNumber}
          </div>
          <div>
            {address.building}, {address.road}
            {address.apartment ? `, ${address.apartment}` : ""},{" "}
            {address.city} - {address.postalCode}
          </div>
          {address.isDefault && (
            <div className="mt-1.5 text-secondary font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">info</span>
              This is currently your default delivery coordinate. A remaining
              address will be assigned as default.
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onClose}
            className="px-space-md py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            Keep Address
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-space-lg py-2 bg-error text-on-error hover:bg-error/90 rounded-lg font-label-md text-label-md font-semibold transition-all shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            Delete Coordinate
          </button>
        </div>
      </div>
    </div>
  );
}
