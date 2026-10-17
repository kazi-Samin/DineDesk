"use client";

import { useState, useEffect, useRef } from "react";
import { CustomerReview, ReviewPhoto } from "@/types/customerReview";

interface EditReviewModalProps {
  isOpen: boolean;
  review: CustomerReview | null;
  onClose: () => void;
  onSave: (updatedReview: CustomerReview) => void;
  onDeleteRequest: (review: CustomerReview) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "1.0 — Poor",
  2: "2.0 — Fair",
  3: "3.0 — Good",
  4: "4.0 — Very Good",
  5: "5.0 — Excellent",
};

export default function EditReviewModal({
  isOpen,
  review,
  onClose,
  onSave,
  onDeleteRequest,
}: EditReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [headline, setHeadline] = useState("");
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<ReviewPhoto[]>([]);
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const [allAvailableDishes, setAllAvailableDishes] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (review) {
      setRating(Math.round(review.rating) || 5);
      setHoverRating(null);
      setHeadline(review.headline || "");
      setContent(review.content.replace(/^["“]|["”]$/g, "") || "");
      setPhotos([...(review.photos || [])]);
      setSelectedDishes([...(review.dishes || [])]);

      const combined = Array.from(
        new Set([...(review.availableDishes || []), ...(review.dishes || [])])
      );
      setAllAvailableDishes(combined);
      setErrorMsg(null);
    }
  }, [review, isOpen]);

  if (!isOpen || !review) return null;

  const handleToggleDish = (dish: string) => {
    if (selectedDishes.includes(dish)) {
      setSelectedDishes(selectedDishes.filter((d) => d !== dish));
    } else {
      setSelectedDishes([...selectedDishes, dish]);
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos(photos.filter((p) => p.id !== photoId));
  };

  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - photos.length;
    if (remainingSlots <= 0) {
      setErrorMsg("You can add up to 5 photos per review.");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newPhotos: ReviewPhoto[] = filesToProcess.map((file, idx) => ({
      id: `local-${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      caption: file.name.replace(/\.[^/.]+$/, ""),
      alt: file.name,
    }));

    setPhotos([...photos, ...newPhotos]);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    if (!headline.trim()) {
      setErrorMsg("Please add a title for your review.");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("Please write a few words about your experience.");
      return;
    }

    const updated: CustomerReview = {
      ...review,
      rating,
      headline: headline.trim(),
      content: content.trim(),
      photos,
      dishes: selectedDishes,
      availableDishes: allAvailableDishes,
    };

    onSave(updated);
  };

  const activeDisplayRating = hoverRating ?? rating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-surface-container-low flex items-start justify-between border-b border-outline-variant/30">
          <div>
            <h2 className="font-headline-sm text-xl text-primary font-bold">
              Edit Review
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {review.restaurantName} • {review.restaurantLocation}
            </p>
          </div>
          <button
            aria-label="Close modal"
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5 scrollbar-none">
          {errorMsg && (
            <div className="p-3 bg-error-container text-on-error-container rounded-lg text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center justify-between p-4 bg-surface-container-low/60 rounded-xl border border-outline-variant/20">
            <div>
              <span className="text-xs font-semibold text-on-surface block mb-1">
                Your Rating
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => {
                      setRating(star);
                      setErrorMsg(null);
                    }}
                    className="p-0.5 text-secondary hover:scale-110 transition-transform cursor-pointer"
                  >
                    <span
                      className={`material-symbols-outlined text-2xl ${
                        star <= activeDisplayRating
                          ? "text-secondary"
                          : "text-outline-variant"
                      }`}
                      style={{
                        fontVariationSettings:
                          star <= activeDisplayRating ? "'FILL' 1" : "'FILL' 0",
                      }}
                    >
                      star
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <span className="text-sm font-semibold text-secondary">
              {RATING_LABELS[activeDisplayRating] || `${activeDisplayRating}.0`}
            </span>
          </div>

          {/* Headline */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface" htmlFor="review-title">
              Headline
            </label>
            <input
              id="review-title"
              type="text"
              value={headline}
              onChange={(e) => {
                setHeadline(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              className="w-full px-3.5 py-2.5 bg-surface-container-low rounded-xl text-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container border border-outline-variant/30"
              placeholder="What stood out to you?"
            />
          </div>

          {/* Review Text */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-on-surface" htmlFor="review-comment">
                Your Review
              </label>
              <span className="text-[11px] text-on-surface-variant">
                {content.length} / 1000
              </span>
            </div>
            <textarea
              id="review-comment"
              rows={4}
              maxLength={1000}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              className="w-full p-3.5 bg-surface-container-low rounded-xl text-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container border border-outline-variant/30 resize-y"
              placeholder="Tell others about the food, service, and atmosphere..."
            />
          </div>

          {/* Photos */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-on-surface">
              Photos ({photos.length}/5)
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/30"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || "Review photo"}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-1 right-1 p-0.5 bg-on-surface/80 hover:bg-error text-on-error rounded-full transition-colors flex items-center justify-center cursor-pointer shadow-xs"
                    title="Remove photo"
                  >
                    <span className="material-symbols-outlined text-xs leading-none">
                      close
                    </span>
                  </button>
                </div>
              ))}

              {photos.length < 5 && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAddPhotos}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-xl bg-surface-container-low hover:bg-surface-container flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:text-primary transition-colors border border-dashed border-outline-variant/60 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xl">
                      add_photo_alternate
                    </span>
                    <span className="text-[11px] font-medium">Add Photo</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Dishes */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-on-surface">
              Dishes you ordered
            </label>
            <div className="flex flex-wrap gap-2">
              {allAvailableDishes.map((dish) => {
                const isSelected = selectedDishes.includes(dish);
                return (
                  <button
                    key={dish}
                    type="button"
                    onClick={() => handleToggleDish(dish)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-primary-container text-on-primary shadow-xs"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/30"
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">
                      {isSelected ? "check" : "add"}
                    </span>
                    {dish}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between gap-3 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={() => onDeleteRequest(review)}
            className="text-error hover:text-on-error-container text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            <span>Delete review</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-on-surface hover:bg-surface-container font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold shadow-xs cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
