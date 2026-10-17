"use client";

import { CustomerReview } from "@/types/customerReview";

interface DeleteReviewModalProps {
  isOpen: boolean;
  review: CustomerReview | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteReviewModal({
  isOpen,
  review,
  onCancel,
  onConfirm,
}: DeleteReviewModalProps) {
  if (!isOpen || !review) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-xl shadow-2xl p-space-lg flex flex-col gap-space-md border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl text-error">
              delete_forever
            </span>
          </div>
          <div className="flex flex-col">
            <h3
              id="delete-dialog-title"
              className="font-headline-sm text-headline-sm text-primary font-medium"
            >
              Remove Dining Review?
            </h3>
            <span className="font-label-sm text-label-sm text-secondary font-semibold">
              {review.restaurantName}
            </span>
          </div>
        </div>

        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
          Are you sure you want to remove your review for{" "}
          <strong className="text-on-surface">{review.restaurantName}</strong>? This action will
          remove your rating, tasting impressions, and attached photos from the platform.
        </p>

        <div className="flex items-center justify-end gap-space-md mt-space-sm pt-space-sm border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onCancel}
            className="px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors font-medium cursor-pointer"
          >
            Cancel / Keep Review
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-space-lg py-2 rounded-lg bg-error hover:bg-error/90 text-on-error font-label-md text-label-md transition-colors shadow-xs font-semibold cursor-pointer"
          >
            Yes, Remove Review
          </button>
        </div>
      </div>
    </div>
  );
}
