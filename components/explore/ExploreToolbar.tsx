"use client";

import { motion } from "framer-motion";

interface ExploreToolbarProps {
    search: string;
    setSearch: (val: string) => void;
    sortBy: string;
    setSortBy: (val: string) => void;
    viewMode: "grid" | "list";
    setViewMode: (mode: "grid" | "list") => void;
    onMobileFilterOpen: () => void;
    activeFilterCount: number;
    totalCount?: number;
}

export default function ExploreToolbar({
    search,
    setSearch,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    onMobileFilterOpen,
    activeFilterCount,
    totalCount,
}: ExploreToolbarProps) {
    // Dynamically generate the sequential label based on active database count
    const countDisplay = totalCount && totalCount > 0 ? totalCount : 401;
    const dynamicSequentialLabel = `Sequential (#1 - #${countDisplay})`;

    // Ensure bidirectional matching whether parent passes "Sequential", "Sequential (#1 - #400)", or dynamic
    const isSequentialSelected = sortBy.startsWith("Sequential");

    return (
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 bg-surface-container-lowest border border-outline-variant/80 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-sm">
            {/* Responsive Live Search Input */}
            <div className="relative flex-1 min-w-0">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 sm:pl-4 pointer-events-none text-primary">
                    <span className="material-symbols-outlined text-xl">search</span>
                </span>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by menu name, recipe, or restaurant..."
                    className="w-full bg-surface-container-low/60 border border-outline-variant/70 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 pl-10 sm:pl-11 pr-9 sm:pr-10 text-xs sm:text-sm font-semibold text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-variant hover:text-primary cursor-pointer"
                        type="button"
                    >
                        <span className="material-symbols-outlined text-base">close</span>
                    </button>
                )}
            </div>

            {/* Right Controls: Sort, View Mode & Mobile Filter Trigger */}
            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
                {/* Mobile Filter Trigger Button */}
                <button
                    onClick={onMobileFilterOpen}
                    type="button"
                    className="lg:hidden shrink-0 relative inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-primary text-on-primary text-xs font-bold shadow-md active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined text-base">tune</span>
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-secondary text-on-secondary text-[9px] sm:text-[10px] font-black flex items-center justify-center shadow-xs">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* Dynamic Sorting Dropdown */}
                <div className="relative flex-1 min-w-0 md:w-auto md:min-w-[220px]">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-primary">
                        <span className="material-symbols-outlined text-base">sort</span>
                    </span>
                    <select
                        aria-label="Sort menus"
                        className="w-full truncate appearance-none bg-surface-container-low/60 border border-outline-variant/70 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 pl-9 pr-8 sm:pr-10 text-xs font-bold text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs transition-all"
                        value={isSequentialSelected ? "Sequential" : sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="Sequential">{dynamicSequentialLabel}</option>
                        <option value="Highest Rated (Default)">Highest Rated</option>
                        <option value="Price: Low to High">Price: Low to High</option>
                        <option value="Price: High to Low">Price: High to Low</option>
                        <option value="Most Popular">Most Popular</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-outline">
                        <span className="material-symbols-outlined text-sm">expand_more</span>
                    </span>
                </div>

                {/* Grid / List Mode Toggles */}
                <div className="hidden sm:flex items-center bg-surface-container-low/60 rounded-xl sm:rounded-2xl p-1 border border-outline-variant/70 shrink-0">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 sm:p-2.5 rounded-xl transition-all ${viewMode === "grid"
                                ? "bg-surface-container-lowest text-primary shadow-sm scale-105"
                                : "text-on-surface-variant hover:text-primary"
                            }`}
                        title="Grid View"
                        type="button"
                    >
                        <span className="material-symbols-outlined text-lg">grid_view</span>
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 sm:p-2.5 rounded-xl transition-all ${viewMode === "list"
                                ? "bg-surface-container-lowest text-primary shadow-sm scale-105"
                                : "text-on-surface-variant hover:text-primary"
                            }`}
                        title="List View"
                        type="button"
                    >
                        <span className="material-symbols-outlined text-lg">view_list</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
