"use client";

import { useEffect } from "react";
import { FavoriteRestaurant } from "@/types/customerFavorites";

interface RestaurantDetailsModalProps {
  isOpen: boolean;
  restaurant: FavoriteRestaurant | null;
  onClose: () => void;
  onReserve: (restaurant: FavoriteRestaurant) => void;
  onOrderOnline: (restaurant: FavoriteRestaurant) => void;
}

export default function RestaurantDetailsModal({
  isOpen,
  restaurant,
  onClose,
  onReserve,
  onOrderOnline,
}: RestaurantDetailsModalProps) {
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

  if (!isOpen || !restaurant) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 overflow-hidden flex flex-col animate-in zoom-in-95 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rest-detail-title"
      >
        {/* Cover Header */}
        <div className="relative h-48 w-full bg-surface-container overflow-hidden">
          <img
            src={restaurant.image}
            alt={restaurant.imageAlt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center text-primary hover:bg-surface-container-lowest transition-colors shadow-sm"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-on-primary">
            <div>
              <span className="font-label-sm text-label-sm text-secondary-fixed block">
                {restaurant.areaBadge}
              </span>
              <h3
                id="rest-detail-title"
                className="font-headline-sm text-xl text-on-primary font-bold leading-tight"
              >
                {restaurant.name}
              </h3>
            </div>
            <div className="flex items-center gap-1 bg-primary-container/90 px-2.5 py-1 rounded-md text-on-primary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-sm text-secondary-fixed">
                star
              </span>
              <span>{restaurant.rating}</span>
            </div>
          </div>
        </div>

        {/* Body Details */}
        <div className="p-space-lg flex flex-col gap-space-md overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-on-surface-variant pb-2 border-b border-outline-variant/30">
            <span className="font-semibold text-primary">{restaurant.cuisine}</span>
            <span>{restaurant.reviewCount} Verified Reviews</span>
          </div>

          <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed">
            {restaurant.description}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-surface-container-low rounded-lg border border-outline-variant/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-surface-tint text-base">
                schedule
              </span>
              <span>{restaurant.statusLabel}</span>
            </div>
            <div className="p-2.5 bg-surface-container-low rounded-lg border border-outline-variant/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-base">
                room_service
              </span>
              <span>Dine-in &amp; Takeaway</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-space-md bg-surface-container-low border-t border-outline-variant/30 flex items-center gap-space-sm">
          <button
            type="button"
            onClick={() => {
              onClose();
              onReserve(restaurant);
            }}
            className="flex-1 py-2.5 px-space-md bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm font-semibold"
          >
            <span className="material-symbols-outlined text-sm">
              calendar_month
            </span>
            Reserve Table
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOrderOnline(restaurant);
            }}
            className="py-2.5 px-space-md bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/50 text-on-surface font-label-md text-label-md rounded-lg transition-colors font-medium shadow-2xs"
          >
            Order Online
          </button>
        </div>
      </div>
    </div>
  );
}
