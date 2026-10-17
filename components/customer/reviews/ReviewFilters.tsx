"use client";

import { ReviewFilterType, ReviewSortType } from "@/types/customerReview";

interface ReviewFiltersProps {
  activeFilter: ReviewFilterType;
  onFilterChange: (filter: ReviewFilterType) => void;
  sortBy: ReviewSortType;
  onSortChange: (sort: ReviewSortType) => void;
  counts: {
    all: number;
    fiveStar: number;
    fourStar: number;
    withPhotos: number;
  };
}

export default function ReviewFilters({
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  counts,
}: ReviewFiltersProps) {
  const tabs: { key: ReviewFilterType; label: string; count: number }[] = [
    { key: "all", label: "All Reviews", count: counts.all },
    { key: "5-star", label: "5 Stars", count: counts.fiveStar },
    { key: "4-star", label: "4 Stars", count: counts.fourStar },
    { key: "with-photos", label: "With Photos", count: counts.withPhotos },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-low p-space-sm rounded-xl mb-space-lg border border-outline-variant/30">
      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onFilterChange(tab.key)}
              className={`px-space-md py-2 rounded-lg font-label-md text-label-md transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      {/* Sort By Dropdown */}
      <div className="flex items-center gap-space-sm px-space-sm self-end sm:self-auto shrink-0">
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          Sort by:
        </span>
        <div className="relative inline-block text-left">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as ReviewSortType)}
            className="bg-surface-container-lowest font-label-md text-label-md text-on-surface py-1.5 pl-3 pr-8 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-container appearance-none border border-outline-variant/30 shadow-xs"
          >
            <option value="recent">Most Recent</option>
            <option value="highest-rated">Highest Rated</option>
            <option value="most-helpful">Most Helpful Upvotes</option>
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
            expand_more
          </span>
        </div>
      </div>
    </div>
  );
}
