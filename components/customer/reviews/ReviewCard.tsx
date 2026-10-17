"use client";

import { useState } from "react";
import { CustomerReview } from "@/types/customerReview";

interface ReviewCardProps {
  review: CustomerReview;
  onEdit: (review: CustomerReview) => void;
  onRemove: (review: CustomerReview) => void;
  onToggleUpvote: (reviewId: string) => void;
}

export default function ReviewCard({
  review,
  onEdit,
  onRemove,
  onToggleUpvote,
}: ReviewCardProps) {
  const [upvoteAnimated, setUpvoteAnimated] = useState(false);

  const handleUpvote = () => {
    setUpvoteAnimated(true);
    onToggleUpvote(review.id);
    setTimeout(() => setUpvoteAnimated(false), 400);
  };

  return (
    <article className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md transition-all border border-outline-variant/30 hover:shadow-md">
      {/* Card Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md pb-space-md bg-surface-container-low/40 p-space-md rounded-xl">
        <div className="flex items-start gap-space-md">
          <img
            src={review.restaurantImage}
            alt={review.restaurantName}
            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-outline-variant/20 shadow-xs"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-space-sm flex-wrap">
              <h2 className="font-headline-md text-headline-md text-primary font-medium">
                {review.restaurantName}
              </h2>
              {review.verificationType === "dine-in" ? (
                <span className="bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-lg font-label-sm text-label-sm flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  Verified Dine-in
                </span>
              ) : (
                <span className="bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-lg font-label-sm text-label-sm flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-xs">moped</span>
                  Verified Delivery
                </span>
              )}
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              {review.restaurantLocation} • {review.visitDate}
            </span>
          </div>
        </div>

        {/* Stars and Rating */}
        <div className="flex items-center gap-space-xs self-start md:self-center">
          <div className="flex items-center text-secondary">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`material-symbols-outlined text-xl ${
                  star <= Math.round(review.rating)
                    ? "text-secondary"
                    : "text-outline-variant"
                }`}
                style={{
                  fontVariationSettings:
                    star <= Math.round(review.rating) ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                star
              </span>
            ))}
          </div>
          <span className="font-label-lg text-label-lg text-on-surface font-semibold ml-1">
            {review.rating.toFixed(1)}
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant ml-2">
            (Reviewed {review.reviewDate})
          </span>
        </div>
      </div>

      {/* Review Headline & Content */}
      <div className="flex flex-col gap-space-sm px-space-xs">
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
          {review.headline}
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
          &ldquo;{review.content.replace(/^["“]|["”]$/g, "")}&rdquo;
        </p>
      </div>

      {/* Tagged Dishes */}
      {review.dishes && review.dishes.length > 0 && (
        <div className="flex flex-wrap items-center gap-space-sm px-space-xs">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Dishes enjoyed:
          </span>
          {review.dishes.map((dish, idx) => (
            <span
              key={idx}
              className="bg-surface-container-high px-space-md py-1 rounded-lg font-label-md text-label-md text-primary flex items-center gap-1 font-medium"
            >
              <span className="material-symbols-outlined text-sm">
                {dish.toLowerCase().includes("borhani") ||
                dish.toLowerCase().includes("brew") ||
                dish.toLowerCase().includes("shake") ||
                dish.toLowerCase().includes("latte")
                  ? "local_bar"
                  : "restaurant"}
              </span>
              {dish}
            </span>
          ))}
        </div>
      )}

      {/* Attached Photo Gallery */}
      {review.photos && review.photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md pt-space-xs">
          {review.photos.map((photo, pIdx) => (
            <div
              key={photo.id || pIdx}
              className="relative group rounded-xl overflow-hidden aspect-[4/3] bg-surface-container border border-outline-variant/30 shadow-xs"
            >
              <img
                src={photo.url}
                alt={photo.alt || photo.caption || "Review photo"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {photo.caption && (
                <span className="absolute bottom-2 left-2 bg-surface-container-lowest/90 backdrop-blur-xs px-2 py-0.5 rounded font-label-sm text-label-sm text-on-surface shadow-xs font-medium">
                  {photo.caption}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bottom Bar: Helpful Upvote & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm pt-space-md bg-surface-container-low/20 px-space-sm rounded-lg mt-space-xs">
        <button
          type="button"
          onClick={handleUpvote}
          className={`flex items-center gap-space-sm text-on-surface-variant hover:text-primary transition-all py-1 px-2 rounded-lg cursor-pointer ${
            review.hasUpvoted
              ? "bg-secondary-fixed/50 text-on-secondary-fixed font-medium"
              : "hover:bg-surface-container"
          } ${upvoteAnimated ? "scale-105" : ""}`}
          title={review.hasUpvoted ? "Remove upvote" : "Mark as helpful"}
        >
          <span
            className={`material-symbols-outlined text-base ${
              review.hasUpvoted ? "text-secondary font-bold" : "text-secondary"
            }`}
            style={{
              fontVariationSettings: review.hasUpvoted
                ? "'FILL' 1"
                : "'FILL' 0",
            }}
          >
            recommend
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {review.helpfulVotes}{" "}
            {review.helpfulVotes === 1 ? "diner found" : "diners found"} this critique insightful
          </span>
        </button>

        <div className="flex items-center gap-space-sm self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onEdit(review)}
            className="px-space-md py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container font-label-md text-label-md text-primary transition-colors flex items-center gap-1 font-medium cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            Edit Review
          </button>
          <button
            type="button"
            onClick={() => onRemove(review)}
            className="px-space-md py-1.5 rounded-lg hover:bg-error-container hover:text-on-error-container font-label-md text-label-md text-secondary transition-colors flex items-center gap-1 font-medium cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
