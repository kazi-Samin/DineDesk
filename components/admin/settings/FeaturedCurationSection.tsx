"use client";

import { FeaturedRestaurantItem } from "@/types/admin";

interface FeaturedCurationSectionProps {
  featuredRestaurants: FeaturedRestaurantItem[];
  rotationInterval: string;
  includeHeroVideo: boolean;
  onOpenAddModal: () => void;
  onRequestRemove: (item: FeaturedRestaurantItem) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRotationIntervalChange: (val: string) => void;
  onToggleHeroVideo: (val: boolean) => void;
}

export default function FeaturedCurationSection({
  featuredRestaurants,
  rotationInterval,
  includeHeroVideo,
  onOpenAddModal,
  onRequestRemove,
  onMoveUp,
  onMoveDown,
  onRotationIntervalChange,
  onToggleHeroVideo,
}: FeaturedCurationSectionProps) {
  const maxSlots = 8;
  const isAtCapacity = featuredRestaurants.length >= maxSlots;

  const rotationOptions = [
    "Weekly Dynamic Rotation",
    "Daily Midnight Shuffle",
    "Static Editorial Pin (Manual Only)",
    "Algorithmic Impression Balancer",
  ];

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant shadow-2xs flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant/60">
            <span className="material-symbols-outlined text-[22px]">star</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
              Section 02
            </span>
            <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-primary">
              Home Page Curation &amp; Featured Restaurants
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          disabled={isAtCapacity}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
            isAtCapacity
              ? "bg-surface-container text-on-surface-variant/50 border border-outline-variant/40 cursor-not-allowed"
              : "bg-surface-container hover:bg-surface-container-high text-primary border border-outline-variant"
          }`}
          title={isAtCapacity ? "Maximum 8 featured slots occupied" : "Add restaurant"}
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>
            {isAtCapacity ? "Capacity Reached (8/8)" : "Add Restaurant to Featured List"}
          </span>
        </button>
      </div>

      {/* Roster Container */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-on-surface">
            Active Featured Roster ({featuredRestaurants.length} of {maxSlots} slots)
          </span>
          <span className="text-on-surface-variant text-[11px]">
            Use reorder arrows or remove to adjust dynamic prominence
          </span>
        </div>

        {featuredRestaurants.length === 0 ? (
          <div className="p-8 text-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
            <p className="text-xs text-on-surface-variant">
              No featured restaurants currently selected. Click &quot;Add Restaurant&quot; to populate.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5 p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
            {featuredRestaurants.map((restaurant, idx) => (
              <div
                key={restaurant.id}
                className="group flex items-center gap-2 px-3 py-2 bg-surface-container-lowest text-on-surface rounded-xl border border-outline-variant shadow-2xs hover:shadow-xs transition-all"
              >
                {/* Drag / Rank indicator */}
                <span className="text-[10px] font-mono font-bold text-on-surface-variant/60 w-4">
                  #{idx + 1}
                </span>
                <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                <span className="text-xs font-bold text-on-surface">{restaurant.name}</span>
                <span className="text-[11px] text-on-surface-variant">{restaurant.area}</span>

                {/* Accessible Reorder Buttons */}
                <div className="flex items-center gap-0.5 ml-1 border-l border-outline-variant/60 pl-1.5">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => onMoveUp(idx)}
                    className="p-1 rounded text-on-surface-variant hover:text-primary disabled:opacity-20 hover:bg-surface-container transition-colors cursor-pointer"
                    title="Move up"
                    aria-label={`Move ${restaurant.name} up`}
                  >
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                  </button>
                  <button
                    type="button"
                    disabled={idx === featuredRestaurants.length - 1}
                    onClick={() => onMoveDown(idx)}
                    className="p-1 rounded text-on-surface-variant hover:text-primary disabled:opacity-20 hover:bg-surface-container transition-colors cursor-pointer"
                    title="Move down"
                    aria-label={`Move ${restaurant.name} down`}
                  >
                    <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => onRequestRemove(restaurant)}
                  aria-label={`Remove ${restaurant.name}`}
                  className="text-on-surface-variant hover:text-rose-600 transition-colors ml-1 p-0.5 rounded hover:bg-rose-50 cursor-pointer"
                  title="Remove from featured list"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rotation Interval & Visual Banner Allocation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-outline-variant/50">
        {/* Rotation Interval */}
        <div className="flex flex-col gap-2">
          <label htmlFor="rotation-interval" className="text-xs font-bold text-on-surface">
            Feature Rotation Interval
          </label>
          <div className="relative">
            <select
              id="rotation-interval"
              value={rotationInterval}
              onChange={(e) => onRotationIntervalChange(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface text-xs font-medium px-4 py-3 rounded-xl border border-outline-variant outline-none appearance-none cursor-pointer focus:bg-surface-container-lowest transition-all"
            >
              {rotationOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
              expand_more
            </span>
          </div>
          <span className="text-[11px] text-on-surface-variant">
            Redistributes top-of-feed impressions to ensure equitable partner discovery.
          </span>
        </div>

        {/* Hero Video Checkbox */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-on-surface">Visual Banner Allocation</span>
          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">
                gallery_thumbnail
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface">
                  Include Editorial Hero Video
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Autoplay muted on customer web
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={includeHeroVideo}
              onChange={(e) => onToggleHeroVideo(e.target.checked)}
              className="w-4 h-4 accent-primary rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
