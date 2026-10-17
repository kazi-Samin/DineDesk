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
    setTimeout(() => setUpvoteAnimated(false), 300);
  };

  return (
    <article className="bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-outline-variant flex flex-col gap-4 hover:border-primary/50 transition-colors">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-3.5">
          <img
            src={review.restaurantImage}
            alt={review.restaurantName}
            className="w-14 h-14 rounded-lg object-cover shrink-0 border border-outline-variant/40"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-headline-sm text-lg text-primary font-semibold">
                {review.restaurantName}
              </h2>
              {review.verificationType === "dine-in" ? (
                <span className="bg-primary-fixed/80 text-on-primary-fixed px-2 py-0.5 rounded-sm text-xs font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  Dine-in
                </span>
              ) : (
                <span className="bg-secondary-fixed/80 text-on-secondary-fixed px-2 py-0.5 rounded-sm text-xs font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">moped</span>
                  Delivery
                </span>
              )}
            </div>
            <span className="text-xs text-on-surface-variant mt-0.5">
              {review.restaurantLocation} • {review.visitDate.replace(/^Visited on |^Delivered on /g, "")}
            </span>
          </div>
        </div>

        {/* Stars and Rating */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <div className="flex items-center text-secondary">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`material-symbols-outlined text-lg ${
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
          <span className="text-sm text-on-surface font-bold">
            {review.rating.toFixed(1)}
          </span>
          <span className="text-xs text-on-surface-variant">
            • {review.reviewDate}
          </span>
        </div>
      </div>

      {/* Review Headline & Body */}
      <div className="flex flex-col gap-2">
        <h3 className="text-base text-on-surface font-semibold">
          {review.headline}
        </h3>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          {review.content.replace(/^["“]|["”]$/g, "")}
        </p>
      </div>

      {/* Tagged Dishes */}
      {review.dishes && review.dishes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-on-surface-variant font-medium">
            Ordered items:
          </span>
          {review.dishes.map((dish, idx) => (
            <span
              key={idx}
              className="bg-surface-container px-2.5 py-1 rounded-sm text-xs text-primary font-medium flex items-center gap-1 border border-outline-variant/40"
            >
              <span className="material-symbols-outlined text-xs text-on-surface-variant">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {review.photos.map((photo, pIdx) => (
            <div
              key={photo.id || pIdx}
              className="relative group rounded-lg overflow-hidden aspect-[4/3] bg-surface-container border border-outline-variant/40"
            >
              <img
                src={photo.url}
                alt={photo.alt || photo.caption || "Review photo"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {photo.caption && (
                <span className="absolute bottom-1.5 left-1.5 bg-surface-container-lowest/90 backdrop-blur-xs px-2 py-0.5 rounded-sm text-[11px] text-on-surface font-medium border border-outline-variant/40">
                  {photo.caption}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bottom Bar */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-outline-variant/20">
        <button
          type="button"
          onClick={handleUpvote}
          className={`inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-all py-1 px-2.5 rounded-lg cursor-pointer ${
            review.hasUpvoted
              ? "bg-secondary-fixed/60 text-on-secondary-fixed font-semibold"
              : "hover:bg-surface-container"
          } ${upvoteAnimated ? "scale-105" : ""}`}
          title={review.hasUpvoted ? "Remove upvote" : "Mark as helpful"}
        >
          <span
            className={`material-symbols-outlined text-base ${
              review.hasUpvoted ? "text-secondary font-bold" : "text-secondary"
            }`}
            style={{
              fontVariationSettings: review.hasUpvoted ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            thumb_up
          </span>
          <span>
            {review.helpfulVotes}{" "}
            {review.helpfulVotes === 1 ? "person" : "people"} found this helpful
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(review)}
            className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs text-primary transition-colors flex items-center gap-1 font-medium cursor-pointer border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit
          </button>
          <button
            type="button"
            onClick={() => onRemove(review)}
            className="px-3 py-1.5 rounded-lg hover:bg-error-container hover:text-on-error-container text-xs text-secondary transition-colors flex items-center gap-1 font-medium cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
