"use client";

import { useEffect, useState } from "react";
import { CustomerReservation } from "@/types/customerReservation";

interface RateSeatingModalProps {
  isOpen: boolean;
  reservation: CustomerReservation | null;
  onClose: () => void;
  onSubmit: (reservationId: string, rating: number, comment?: string) => void;
}

export default function RateSeatingModal({
  isOpen,
  reservation,
  onClose,
  onSubmit,
}: RateSeatingModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen && reservation) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      setRating(reservation.rating || 5);
      setComment(reservation.reviewComment || "");
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, reservation, onClose]);

  if (!isOpen || !reservation) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reservation.id, rating, comment.trim() || undefined);
  };

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
        aria-labelledby="rate-title"
      >
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
          <div className="flex items-center gap-space-sm">
            <span className="p-2 bg-secondary/10 text-secondary rounded-xl">
              <span className="material-symbols-outlined text-xl">
                rate_review
              </span>
            </span>
            <div>
              <h3
                id="rate-title"
                className="font-headline-sm text-lg font-semibold text-primary"
              >
                Rate Your Dining Experience
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant">
                {reservation.restaurantName} • {reservation.displayDate}
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          {/* Star Picker */}
          <div className="flex flex-col items-center justify-center gap-2 py-space-sm bg-surface-container-low rounded-xl border border-outline-variant/30">
            <span className="font-label-sm text-xs text-on-surface-variant">
              How was the service, seating, and culinary execution?
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled =
                  (hoverRating !== null ? hoverRating : rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl text-amber-500 hover:scale-115 transition-transform"
                    aria-label={`${star} Stars`}
                  >
                    <span
                      className="material-symbols-outlined text-3xl"
                      style={{
                        fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0",
                      }}
                    >
                      star
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="font-label-md text-xs font-semibold text-primary">
              {rating === 5
                ? "Exceptional Seating (5/5)"
                : rating === 4
                ? "Very Good Dining (4/5)"
                : rating === 3
                ? "Satisfactory Experience (3/5)"
                : rating === 2
                ? "Disappointing (2/5)"
                : "Poor (1/5)"}
            </span>
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface">
              Culinary Review &amp; Maitre d&apos; Feedback
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share highlights of your meal, table placement, or acoustic ambience..."
              className="px-space-md py-2 bg-surface-container-lowest rounded-md border border-outline-variant/60 font-body-sm text-body-sm focus:outline-none focus:border-primary-container resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-space-md py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-space-lg py-2 bg-primary-container text-on-primary rounded-lg font-label-md text-label-md font-semibold hover:bg-primary shadow-xs transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">
                check_circle
              </span>
              Submit Rating
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
