"use client";

import { useState } from "react";
import { FeaturedRestaurantItem } from "@/types/admin";

interface AddFeaturedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRestaurant: (restaurant: FeaturedRestaurantItem) => void;
  availablePool: FeaturedRestaurantItem[];
  currentFeaturedIds: string[];
}

export default function AddFeaturedModal({
  isOpen,
  onClose,
  onAddRestaurant,
  availablePool,
  currentFeaturedIds,
}: AddFeaturedModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  // Filter pool excluding existing featured items and matching search
  const candidates = availablePool.filter((item) => {
    const isAlreadyFeatured = currentFeaturedIds.includes(item.id);
    const matchesQuery =
      searchQuery.trim() === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.cuisine && item.cuisine.toLowerCase().includes(searchQuery.toLowerCase()));

    return !isAlreadyFeatured && matchesQuery;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-xl border border-outline-variant flex flex-col gap-5 animate-in fade-in zoom-in-95 max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
          <div>
            <h3 className="font-headline-sm text-lg font-bold text-primary">
              Feature Restaurant on Home Page
            </h3>
            <p className="text-xs text-on-surface-variant">
              Select verified dining partner to add to the hero roster
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by restaurant name, area, or cuisine..."
            className="w-full bg-surface-container-low text-on-surface text-xs font-medium pl-9 pr-4 py-2.5 rounded-xl border border-outline-variant focus:outline-primary placeholder:text-on-surface-variant/70"
          />
        </div>

        {/* Candidates List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-64">
          {candidates.length === 0 ? (
            <div className="py-8 text-center text-xs text-on-surface-variant">
              No available restaurants found matching your search.
            </div>
          ) : (
            candidates.map((res) => (
              <div
                key={res.id}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface">{res.name}</span>
                  <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mt-0.5">
                    <span>{res.area}</span>
                    {res.cuisine && (
                      <>
                        <span>•</span>
                        <span>{res.cuisine}</span>
                      </>
                    )}
                    {res.rating && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-amber-600">★ {res.rating.toFixed(2)}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onAddRestaurant(res);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-bold shadow-2xs hover:opacity-95 transition-all cursor-pointer"
                >
                  Feature
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-outline-variant/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
