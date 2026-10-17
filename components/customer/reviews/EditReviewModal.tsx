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

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: "1.0 / 5.0 — Dissatisfied Culinary Experience",
  2: "2.0 / 5.0 — Below Expectations",
  3: "3.0 / 5.0 — Fair & Average",
  4: "4.0 / 5.0 — Very Pleased with Taste & Ambiance",
  5: "5.0 / 5.0 — Outstanding Dining Experience",
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

  // Sync state whenever selected review changes
  useEffect(() => {
    if (review) {
      setRating(Math.round(review.rating) || 5);
      setHoverRating(null);
      setHeadline(review.headline || "");
      setContent(review.content.replace(/^["“]|["”]$/g, "") || "");
      setPhotos([...(review.photos || [])]);
      setSelectedDishes([...(review.dishes || [])]);

      // Combine available dishes with any already selected
      const combined = Array.from(
        new Set([...(review.availableDishes || []), ...(review.dishes || [])])
      );
      setAllAvailableDishes(combined);
      setErrorMsg(null);
    }
  }, [review, isOpen]);

  if (!isOpen || !review) return null;

  // Toggle dish selection
  const handleToggleDish = (dish: string) => {
    if (selectedDishes.includes(dish)) {
      setSelectedDishes(selectedDishes.filter((d) => d !== dish));
    } else {
      setSelectedDishes([...selectedDishes, dish]);
    }
  };

  // Remove photo from draft
  const handleRemovePhoto = (photoId: string) => {
    setPhotos(photos.filter((p) => p.id !== photoId));
  };

  // Handle local file uploads
  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - photos.length;
    if (remainingSlots <= 0) {
      setErrorMsg("You can attach a maximum of 5 photos per review.");
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

  // Save changes
  const handleSave = () => {
    if (!headline.trim()) {
      setErrorMsg("Please enter a review headline.");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("Please write your detailed dining impressions.");
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
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-space-lg bg-surface-container-low flex items-start justify-between border-b border-outline-variant/30">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs text-secondary font-label-sm text-label-sm mb-1 font-semibold">
              <span className="material-symbols-outlined text-base">restaurant</span>
              <span>Editing Past Dining Review</span>
            </div>
            <h2
              id="modal-title"
              className="font-headline-md text-headline-md text-primary font-medium"
            >
              Edit Your Review • {review.restaurantName}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Your honest feedback helps both local restaurateurs and fellow Dhaka foodies make informed reservations.
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

        {/* Modal Scrollable Body */}
        <div className="p-space-lg overflow-y-auto flex flex-col gap-space-lg scrollbar-none">
          {errorMsg && (
            <div className="p-space-sm bg-error-container text-on-error-container rounded-lg font-body-sm text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Rating & Visit Date */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20">
            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Your Overall Rating
              </span>
              <div className="flex items-center gap-1" id="star-selector">
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
                    aria-label={`Rate ${star} star`}
                  >
                    <span
                      className={`material-symbols-outlined text-3xl ${
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
              <span className="font-label-sm text-label-sm text-secondary font-semibold">
                {RATING_DESCRIPTIONS[activeDisplayRating] || `${activeDisplayRating}.0 / 5.0`}
              </span>
            </div>

            <div className="flex flex-col gap-1 self-start sm:self-auto bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant/30 shadow-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                Date of Visit
              </span>
              <span className="font-label-md text-label-md text-primary flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-base">calendar_today</span>
                {review.visitDate.replace(/^Visited on |^Delivered on /g, "")}{" "}
                {review.visitMealType ? `(${review.visitMealType})` : ""}
              </span>
            </div>
          </div>

          {/* Review Headline Input */}
          <div className="flex flex-col gap-space-xs">
            <label
              className="font-label-md text-label-md text-on-surface font-semibold"
              htmlFor="review-title"
            >
              Review Headline
            </label>
            <input
              id="review-title"
              type="text"
              value={headline}
              onChange={(e) => {
                setHeadline(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              className="w-full px-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-colors shadow-inner border border-outline-variant/30"
              placeholder="e.g. Unmatched flavors and memorable ambiance"
            />
          </div>

          {/* Detailed Review Textarea */}
          <div className="flex flex-col gap-space-xs">
            <div className="flex justify-between items-center">
              <label
                className="font-label-md text-label-md text-on-surface font-semibold"
                htmlFor="review-comment"
              >
                Detailed Dining Impressions
              </label>
              <span
                className={`font-label-sm text-label-sm ${
                  content.length > 950 ? "text-error font-semibold" : "text-on-surface-variant"
                }`}
              >
                {content.length} / 1000 characters
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
              className="w-full p-space-md bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-colors shadow-inner leading-relaxed border border-outline-variant/30 resize-y"
              placeholder="Share what stood out regarding flavors, presentation, service, or atmosphere..."
            />
          </div>

          {/* Attached Photos (Max 5) */}
          <div className="flex flex-col gap-space-sm">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Attached Dish & Atmosphere Photos ({photos.length}/5)
            </label>
            <div className="flex flex-wrap items-center gap-space-md">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative w-24 h-24 rounded-xl overflow-hidden group bg-surface-container border border-outline-variant/30 shadow-xs"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || "Review photo"}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-1 right-1 p-1 bg-on-surface/80 hover:bg-error text-on-error rounded-full transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                    aria-label="Remove photo"
                    title="Remove this photo"
                  >
                    <span className="material-symbols-outlined text-sm leading-none">
                      close
                    </span>
                  </button>
                  {photo.caption && (
                    <span className="absolute bottom-1 left-1 max-w-[85%] truncate bg-surface-container-lowest/90 px-1 py-0.5 rounded text-[10px] text-on-surface font-medium">
                      {photo.caption}
                    </span>
                  )}
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
                    id="photo-upload-input"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-xl bg-surface-container-low hover:bg-surface-container flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:text-primary transition-colors border border-dashed border-outline-variant cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-2xl">
                      add_photo_alternate
                    </span>
                    <span className="font-label-sm text-label-sm font-medium">
                      Add Photos
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tagged Dishes */}
          <div className="flex flex-col gap-space-xs">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Which dishes did you order? (Tap to tag)
            </label>
            <div className="flex flex-wrap gap-space-sm mt-1" id="dishes-selector">
              {allAvailableDishes.map((dish) => {
                const isSelected = selectedDishes.includes(dish);
                return (
                  <button
                    key={dish}
                    type="button"
                    onClick={() => handleToggleDish(dish)}
                    className={`px-space-md py-1.5 rounded-lg font-label-sm text-label-sm transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                      isSelected
                        ? "bg-primary-container text-on-primary shadow-xs"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-outline-variant/30"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isSelected ? "check" : "add"}
                    </span>
                    {dish}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-space-lg bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-md border-t border-outline-variant/30">
          <button
            type="button"
            onClick={() => onDeleteRequest(review)}
            className="text-error hover:text-on-error-container hover:bg-error-container/20 px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-colors flex items-center gap-1 order-2 sm:order-1 cursor-pointer font-medium"
          >
            <span className="material-symbols-outlined text-base">delete_forever</span>
            <span>Delete this review entirely</span>
          </button>
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end order-1 sm:order-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-space-lg py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors font-medium cursor-pointer"
            >
              Cancel / Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto px-space-xl py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-colors flex items-center justify-center gap-1.5 shadow-sm font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
