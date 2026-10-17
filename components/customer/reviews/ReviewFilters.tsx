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
    { key: "all", label: "All", count: counts.all },
    { key: "5-star", label: "5 Stars", count: counts.fiveStar },
    { key: "4-star", label: "4 Stars", count: counts.fourStar },
    { key: "with-photos", label: "With Photos", count: counts.withPhotos },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-1.5 rounded-xl mb-6 border border-outline-variant shadow-xs">
      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onFilterChange(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap cursor-pointer font-medium ${
                isActive
                  ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      {/* Sort By Dropdown */}
      <div className="flex items-center gap-2 px-2 self-end sm:self-auto shrink-0">
        <span className="text-xs text-on-surface-variant">
          Sort by:
        </span>
        <div className="relative inline-block text-left">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as ReviewSortType)}
            className="bg-surface-container-low text-xs text-on-surface font-medium py-1.5 pl-3 pr-8 rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-container appearance-none border border-outline-variant"
          >
            <option value="recent">Most Recent</option>
            <option value="highest-rated">Highest Rated</option>
            <option value="most-helpful">Most Helpful</option>
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
            expand_more
          </span>
        </div>
      </div>
    </div>
  );
}
