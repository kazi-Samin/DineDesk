"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MenuCard, { MenuItemProps } from "@/components/ui/MenuCard";

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCuisine = searchParams.get("cuisine") || "";

  // Interactive Filter States
  const [search, setSearch] = useState(initialQuery);
  const [openKitchensOnly, setOpenKitchensOnly] = useState(false);
  const [serviceMode, setServiceMode] = useState<"delivery" | "dine-in">("delivery");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    initialCuisine ? [initialCuisine] : []
  );
  const [selectedPriceTiers, setSelectedPriceTiers] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [dietaryFilters, setDietaryFilters] = useState<{
    halal: boolean;
    vegetarian: boolean;
    kidFriendly: boolean;
  }>({
    halal: false,
    vegetarian: false,
    kidFriendly: false,
  });

  const [sortBy, setSortBy] = useState<string>("Highest Rated (Default)");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Backend Menus State
  const [menus, setMenus] = useState<MenuItemProps[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch menus from live API route based on filters
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (selectedCuisines.length > 0) params.set("cuisine", selectedCuisines[0]);

    fetch(`/api/menus?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMenus(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch explore menus:", err);
        setLoading(false);
      });
  }, [search, selectedCuisines]);

  // Keep query sync if URL changes
  useEffect(() => {
    if (initialQuery) setSearch(initialQuery);
    if (initialCuisine && !selectedCuisines.includes(initialCuisine)) {
      setSelectedCuisines([initialCuisine]);
    }
  }, [initialQuery, initialCuisine]);

  // Handle Cuisines toggle
  const toggleCuisine = (cuisineKey: string) => {
    if (cuisineKey === "all") {
      setSelectedCuisines([]);
      return;
    }
    if (selectedCuisines.includes(cuisineKey)) {
      setSelectedCuisines(selectedCuisines.filter((c) => c !== cuisineKey));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisineKey]);
    }
  };

  // Handle Price Tier toggle
  const togglePriceTier = (tier: string) => {
    if (selectedPriceTiers.includes(tier)) {
      setSelectedPriceTiers(selectedPriceTiers.filter((t) => t !== tier));
    } else {
      setSelectedPriceTiers([...selectedPriceTiers, tier]);
    }
  };

  // Reset All Filters
  const handleResetAll = () => {
    setSearch("");
    setOpenKitchensOnly(false);
    setSelectedCuisines([]);
    setSelectedPriceTiers([]);
    setMinRating(0);
    setDietaryFilters({ halal: false, vegetarian: false, kidFriendly: false });
  };

  // Client-side filtering & sorting on fetched data
  const filteredMenus = useMemo(() => {
    let result = [...menus];

    if (openKitchensOnly) {
      result = result.filter((m) => m.isOpen !== false);
    }

    if (selectedPriceTiers.length > 0) {
      result = result.filter((m) => selectedPriceTiers.includes(m.priceTier));
    }

    if (minRating > 0) {
      result = result.filter((m) => m.rating >= minRating);
    }

    if (dietaryFilters.halal) {
      result = result.filter((m) => m.isHalal);
    }
    if (dietaryFilters.vegetarian) {
      result = result.filter((m) => m.isVegetarianFriendly);
    }
    if (dietaryFilters.kidFriendly) {
      result = result.filter((m) => m.isKidFriendly);
    }

    // Sorting
    if (sortBy === "Highest Rated (Default)") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "Price: Low to High") {
      result.sort((a, b) => a.priceTier.length - b.priceTier.length);
    } else if (sortBy === "Price: High to Low") {
      result.sort((a, b) => b.priceTier.length - a.priceTier.length);
    } else if (sortBy === "Most Popular") {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return result;
  }, [menus, openKitchensOnly, selectedPriceTiers, minRating, dietaryFilters, sortBy]);

  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <div className="w-full bg-surface-bright py-12 border-b border-outline-variant/40">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-3 uppercase tracking-wider font-bold">
            <Link className="hover:text-primary transition-colors" href="/">
              Home
            </Link>
            <span className="text-outline">/</span>
            <span className="text-primary font-semibold">Explore Menus</span>
          </nav>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary tracking-tight">
                  Explore Menus of this Restaurant
                </h1>
                <span className="text-sm text-on-surface-variant font-bold">
                  ({filteredMenus.length} items)
                </span>
              </div>
              <p className="text-sm text-on-surface-variant max-w-xl mt-2">
                Discover culinary masterworks, order fast delivery, or reserve tables across the city.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative min-w-[240px]">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-base">tune</span>
                </span>
                <select
                  aria-label="Sort menus"
                  className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded-xl py-2.5 pl-10 pr-10 text-xs font-bold text-on-surface focus:outline-none focus:border-primary cursor-pointer shadow-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option>Highest Rated (Default)</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Most Popular</option>
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </span>
              </div>

              <div className="flex items-center bg-surface-container-low rounded-xl p-1 border border-outline-variant">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid"
                      ? "bg-surface-container-lowest text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-primary"
                    }`}
                  title="Grid View"
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg">grid_view</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "list"
                      ? "bg-surface-container-lowest text-primary shadow-sm"
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
        </div>
      </div>

      {/* Main Browse Container */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12 w-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Filters Sidebar */}
          <aside className="w-full lg:w-[300px] shrink-0 sticky top-28 bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 flex flex-col gap-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-lg">filter_alt</span>
                <span className="text-xs font-extrabold uppercase tracking-widest">
                  Filters
                </span>
              </div>
              <button
                onClick={handleResetAll}
                className="text-xs text-secondary hover:underline font-bold cursor-pointer"
                type="button"
              >
                Reset All
              </button>
            </div>

            {/* Open Kitchens Only Toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="block text-xs font-bold text-on-surface">
                  Open Kitchens Only
                </span>
                <span className="block text-[11px] text-on-surface-variant">
                  Ready for instant delivery
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={openKitchensOnly}
                  onChange={(e) => setOpenKitchensOnly(e.target.checked)}
                  className="sr-only peer"
                  type="checkbox"
                />
                <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Service Mode Selector */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                Service Mode
              </span>
              <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-1 rounded-xl border border-outline-variant">
                <button
                  type="button"
                  onClick={() => setServiceMode("delivery")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${serviceMode === "delivery"
                      ? "bg-surface-container-lowest text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-primary"
                    }`}
                >
                  <span className="material-symbols-outlined text-sm">delivery_dining</span> Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setServiceMode("dine-in")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${serviceMode === "dine-in"
                      ? "bg-surface-container-lowest text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-primary"
                    }`}
                >
                  <span className="material-symbols-outlined text-sm">table_restaurant</span> Dine-in
                </button>
              </div>
            </div>

            {/* Cuisines */}
            <div className="flex flex-col gap-3 pt-3 border-t border-outline-variant">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                Cuisine Categories
              </span>
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-2">
                {[
                  { key: "all", label: "All Cuisines" },
                  { key: "desi", label: "Desi & Biryani" },
                  { key: "burger", label: "Artisan Burgers" },
                  { key: "italian", label: "Italian & Woodfired" },
                  { key: "sushi", label: "Japanese & Sushi" },
                  { key: "european", label: "European Gourmet" },
                  { key: "desserts", label: "Patisserie & Desserts" },
                ].map((c) => (
                  <label key={c.key} className="flex items-center gap-3 text-xs text-on-surface cursor-pointer select-none font-medium">
                    <input
                      checked={c.key === "all" ? selectedCuisines.length === 0 : selectedCuisines.includes(c.key)}
                      onChange={() => toggleCuisine(c.key)}
                      className="w-4 h-4 rounded border-outline-variant text-primary accent-primary"
                      type="checkbox"
                    />
                    <span className="flex-1">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tasting Tier (Price) */}
            <div className="flex flex-col gap-3 pt-3 border-t border-outline-variant">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                  Price Tier
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["$", "$$", "$$$"] as const).map((tier) => {
                  const isSelected = selectedPriceTiers.includes(tier);
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => togglePriceTier(tier)}
                      className={`py-2 border rounded-xl text-xs font-bold transition-colors ${isSelected
                          ? "border-primary bg-primary text-on-primary"
                          : "border-outline-variant text-on-surface hover:border-primary"
                        }`}
                    >
                      {tier}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="flex flex-col gap-3 pt-3 border-t border-outline-variant">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                Minimum Rating
              </span>
              <div className="flex flex-col gap-2">
                {[4.5, 4.0, 3.5].map((rating) => (
                  <label
                    key={rating}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${minRating === rating
                        ? "border-primary bg-primary/5 font-bold"
                        : "border-outline-variant/60 hover:bg-surface-container-low"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        checked={minRating === rating}
                        onChange={() => setMinRating(rating)}
                        className="accent-primary"
                        name="rating-filter"
                        type="radio"
                      />
                      <span className="text-xs text-on-surface">{rating}+ ★</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Dietary Ethos */}
            <div className="flex flex-col gap-3 pt-3 border-t border-outline-variant">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                Special Dietary &amp; Ethos
              </span>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 text-xs text-on-surface cursor-pointer font-medium">
                  <input
                    checked={dietaryFilters.halal}
                    onChange={(e) => setDietaryFilters({ ...dietaryFilters, halal: e.target.checked })}
                    className="w-4 h-4 rounded border-outline-variant accent-primary"
                    type="checkbox"
                  />
                  <span>Halal Certified</span>
                </label>
                <label className="flex items-center gap-3 text-xs text-on-surface cursor-pointer font-medium">
                  <input
                    checked={dietaryFilters.vegetarian}
                    onChange={(e) => setDietaryFilters({ ...dietaryFilters, vegetarian: e.target.checked })}
                    className="w-4 h-4 rounded border-outline-variant accent-primary"
                    type="checkbox"
                  />
                  <span>Vegetarian Friendly</span>
                </label>
                <label className="flex items-center gap-3 text-xs text-on-surface cursor-pointer font-medium">
                  <input
                    checked={dietaryFilters.kidFriendly}
                    onChange={(e) => setDietaryFilters({ ...dietaryFilters, kidFriendly: e.target.checked })}
                    className="w-4 h-4 rounded border-outline-variant accent-primary"
                    type="checkbox"
                  />
                  <span>Kid &amp; Family Friendly</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Results Main Column */}
          <div className="flex-1 w-full min-w-0 flex flex-col gap-6">

            {/* Active Filters Bar */}
            <div className="flex flex-wrap items-center gap-2 pb-2">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mr-2">
                Active Filters:
              </span>
              {openKitchensOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs text-primary font-bold">
                  <span>Open Now</span>
                  <button onClick={() => setOpenKitchensOnly(false)} className="hover:text-secondary cursor-pointer" type="button">
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              )}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs text-primary font-bold">
                  <span>Rating: {minRating}+ ★</span>
                  <button onClick={() => setMinRating(0)} className="hover:text-secondary cursor-pointer" type="button">
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              )}
              {selectedCuisines.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs text-primary font-bold capitalize">
                  <span>{c}</span>
                  <button onClick={() => toggleCuisine(c)} className="hover:text-secondary cursor-pointer" type="button">
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              ))}
            </div>

            {/* Menu Cards Grid / List */}
            {loading ? (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-80 bg-surface-container animate-pulse rounded-3xl shadow-sm" />
                ))}
              </div>
            ) : filteredMenus.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full"
                    : "flex flex-col gap-4 w-full"
                }
              >
                {filteredMenus.map((item) => (
                  <MenuCard key={item.id} item={item} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-12 flex flex-col items-center justify-center text-center my-6 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined text-3xl">soup_kitchen</span>
                </div>
                <h3 className="font-heading font-bold text-xl text-on-surface mb-1">No matching menus found</h3>
                <p className="text-sm text-on-surface-variant max-w-sm mb-6">
                  Try widening your price tier or disabling active filters.
                </p>
                <button
                  onClick={handleResetAll}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                  type="button"
                >
                  Clear All Filters
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <main className="w-full pt-20 bg-surface">
      <Suspense fallback={<div className="p-12 text-center text-primary font-bold">Loading curated menus from database...</div>}>
        <ExploreContent />
      </Suspense>
    </main>
  );
}