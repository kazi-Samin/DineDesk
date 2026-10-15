"use client";

import { MenuCategory } from "@/types/menu";

interface MenuToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts: Record<string, number>;
}

export const CATEGORIES: { id: string; label: string }[] = [
  { id: "all", label: "All Categories" },
  { id: "Starters & Kebabs", label: "Starters & Kebabs" },
  { id: "Heritage Mains", label: "Heritage Mains" },
  { id: "Desserts", label: "Desserts" },
  { id: "Traditional Refreshers", label: "Traditional Refreshers" },
  { id: "Chef's Tasting Sets", label: "Chef's Tasting Sets" },
];

export default function MenuToolbar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}: MenuToolbarProps) {
  return (
    <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-sm border border-outline-variant/30">
      {/* Search Input */}
      <div className="relative w-full md:w-80">
        <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-xl pointer-events-none">
          search
        </span>
        <input
          className="w-full pl-10 pr-space-md py-2 bg-surface-container rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest transition-colors shadow-inner border border-outline-variant/30"
          placeholder="Search menu items, ingredients, notes..."
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface text-sm cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-space-xs overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count =
            cat.id === "all"
              ? categoryCounts.total || 0
              : categoryCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-label-sm text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isSelected
                  ? "bg-primary-container text-on-primary shadow-xs"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
              type="button"
            >
              <span>{cat.label}</span>
              {cat.id !== "all" && count !== undefined && (
                <span className="ml-1 opacity-80">({count})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
