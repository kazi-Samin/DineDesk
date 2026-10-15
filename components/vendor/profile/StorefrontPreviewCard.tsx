"use client";

import Link from "next/link";
import { PriceTier, OperatingDay } from "@/types/profile";

interface StorefrontPreviewCardProps {
  name: string;
  cuisineTags: string[];
  priceTier: PriceTier;
  coverImage: string;
  logoImage: string;
  neighborhood: string;
  operatingHours: OperatingDay[];
}

export default function StorefrontPreviewCard({
  name,
  cuisineTags,
  priceTier,
  coverImage,
  logoImage,
  neighborhood,
  operatingHours,
}: StorefrontPreviewCardProps) {
  // Format price tier label
  const priceTierLabel =
    priceTier === "economy"
      ? "৳ Economy"
      : priceTier === "fine-dining"
      ? "৳৳৳ Fine Dining"
      : "৳৳ Moderate";

  // Derive today's schedule
  const todayDayName = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });
  const todaySchedule = operatingHours.find((h) => h.day === todayDayName);
  const isOpenToday = todaySchedule ? todaySchedule.isOpen : true;
  const closingTime = todaySchedule ? todaySchedule.closingTime : "11:30 PM";

  // Cuisine preview line
  const cuisinePreview =
    cuisineTags.length > 0
      ? cuisineTags.slice(0, 2).join(" • ")
      : "Traditional Heritage Cuisine";

  // Neighborhood preview
  const shortNeighborhood = neighborhood.split(",")[0] || "Banani";

  return (
    <div
      className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-sm overflow-hidden"
      id="storefront-preview"
    >
      {/* Top Header Strip */}
      <div className="p-space-sm bg-surface-container-high/60 border-b border-outline-variant/40 flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-primary font-semibold uppercase tracking-wider">
          Public Marketplace Card
        </span>
        <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>Live Preview</span>
        </span>
      </div>

      {/* Card Header Image with Overlay Badges */}
      <div className="relative h-36 w-full bg-surface-container">
        {coverImage ? (
          <img
            className="w-full h-full object-cover"
            src={coverImage}
            alt={name || "Storefront Preview"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-4xl">restaurant</span>
          </div>
        )}

        {/* Price Tier Badge */}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary-container text-on-primary font-label-sm text-xs font-medium shadow-xs">
          {priceTierLabel}
        </span>

        {/* Rating Badge */}
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-surface/90 text-on-surface font-label-sm text-xs font-bold flex items-center gap-0.5 shadow-xs backdrop-blur-xs">
          <span
            className="material-symbols-outlined text-xs text-amber-600"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span>4.9 (1.4k)</span>
        </span>
      </div>

      {/* Card Details */}
      <div className="p-space-md space-y-space-xs">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-tight truncate">
              {name || "Sultan's Heritage Kitchen"}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
              {cuisinePreview}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-outline-variant shrink-0 bg-primary-fixed">
            {logoImage ? (
              <img
                className="w-full h-full object-cover"
                src={logoImage}
                alt={name}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-primary-fixed">
                <span className="material-symbols-outlined text-base">storefront</span>
              </div>
            )}
          </div>
        </div>

        {/* Operating status & location pills */}
        <div className="pt-space-xs border-t border-outline-variant/30 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-primary">schedule</span>
            <span>{isOpenToday ? `Open till ${closingTime}` : "Closed today"}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-primary">pin_drop</span>
            <span className="truncate max-w-[120px]">{shortNeighborhood}</span>
          </span>
        </div>

        {/* Action Link */}
        <div className="pt-2">
          <Link
            href="/restaurants/sultans-dine"
            className="block w-full py-2 text-center rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors"
          >
            Open Full Guest Menu &amp; Book
          </Link>
        </div>
      </div>
    </div>
  );
}
