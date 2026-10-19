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
}: ExploreToolbarProps) {
    return (
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-surface-container-lowest border border-outline-variant/80 p-4 rounded-3xl shadow-sm">
            {/* Responsive Live Search Input */}
            <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-primary">
                    <span className="material-symbols-outlined text-xl">search</span>
                </span>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by menu name, recipe, or restaurant..."
                    className="w-full bg-surface-container-low/60 border border-outline-variant/70 rounded-2xl py-3 pl-11 pr-10 text-xs sm:text-sm font-semibold text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
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
            <div className="flex items-center gap-3">
                {/* Mobile Filter Trigger Button */}
                <button
                    onClick={onMobileFilterOpen}
                    type="button"
                    className="lg:hidden relative inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary text-on-primary text-xs font-bold shadow-md active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined text-base">tune</span>
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-secondary text-on-secondary text-[10px] font-black flex items-center justify-center shadow-xs">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* Sorting Dropdown */}
                <div className="relative min-w-[210px]">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-primary">
                        <span className="material-symbols-outlined text-base">sort</span>
                    </span>
                    <select
                        aria-label="Sort menus"
                        className="w-full appearance-none bg-surface-container-low/60 border border-outline-variant/70 rounded-2xl py-3 pl-10 pr-10 text-xs font-bold text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs transition-all"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="Sequential (#1 - #400)">Sequential (#1 - #400)</option>
                        <option value="Highest Rated (Default)">Highest Rated</option>
                        <option value="Price: Low to High">Price: Low to High</option>
                        <option value="Price: High to Low">Price: High to Low</option>
                        <option value="Most Popular">Most Popular</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-outline">
                        <span className="material-symbols-outlined text-sm">expand_more</span>
                    </span>
                </div>

                {/* Grid / List Mode Toggles */}
                <div className="hidden sm:flex items-center bg-surface-container-low/60 rounded-2xl p-1 border border-outline-variant/70">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2.5 rounded-xl transition-all ${viewMode === "grid"
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
                        className={`p-2.5 rounded-xl transition-all ${viewMode === "list"
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