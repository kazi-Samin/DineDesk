"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EXPLORE_RESTAURANTS } from "@/data/restaurants";
import RestaurantCard from "@/components/restaurants/RestaurantCard";

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
    halal: true,
    vegetarian: false,
    kidFriendly: false,
  });

  const [sortBy, setSortBy] = useState<string>("Highest Rated (Default)");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

  // Filtered & Sorted Restaurants
  const filteredRestaurants = useMemo(() => {
    let result = [...EXPLORE_RESTAURANTS];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.neighborhood.toLowerCase().includes(q)
      );
    }

    // Open Kitchens only
    if (openKitchensOnly) {
      result = result.filter((r) => r.isOpen);
    }

    // Service Mode
    if (serviceMode === "delivery") {
      result = result.filter((r) => r.isDelivery);
    } else if (serviceMode === "dine-in") {
      result = result.filter((r) => r.isDineIn);
    }

    // Cuisines
    if (selectedCuisines.length > 0) {
      result = result.filter((r) => selectedCuisines.includes(r.cuisineCategory));
    }

    // Price Tier
    if (selectedPriceTiers.length > 0) {
      result = result.filter((r) => selectedPriceTiers.includes(r.priceTier));
    }

    // Rating
    if (minRating > 0) {
      result = result.filter((r) => r.rating >= minRating);
    }

    // Dietary
    if (dietaryFilters.halal) {
      result = result.filter((r) => r.isHalal);
    }
    if (dietaryFilters.vegetarian) {
      result = result.filter((r) => r.isVegetarianFriendly);
    }
    if (dietaryFilters.kidFriendly) {
      result = result.filter((r) => r.isKidFriendly);
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
  }, [
    search,
    openKitchensOnly,
    serviceMode,
    selectedCuisines,
    selectedPriceTiers,
    minRating,
    dietaryFilters,
    sortBy,
  ]);

  return (
    <div className="flex flex-col w-full">
      {/* Page Header with Breadcrumb, Title and Sorting Bar */}
      <div className="w-full bg-surface-bright py-space-xl border-b border-outline-variant/40">
        <div className="max-w-[1440px] mx-auto px-margin">
          <nav className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant mb-space-sm uppercase tracking-wider">
            <Link className="hover:text-primary transition-colors" href="/">
              Home
            </Link>
            <span className="text-outline">/</span>
            <span className="text-primary font-semibold">Browse Restaurants</span>
          </nav>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
            <div>
              <div className="flex items-baseline gap-space-sm">
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                  Explore Restaurants in Dhaka
                </h1>
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                  ({filteredRestaurants.length} restaurants)
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mt-space-xs">
                Discover popular dining spots, order food delivery, or book a table across Dhaka.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm">
              <div className="relative min-w-[280px]">
                <span className="absolute inset-y-0 left-0 flex items-center pl-space-md pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-lg">tune</span>
                </span>
                <select
                  aria-label="Sort restaurants"
                  className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded py-space-sm pl-10 pr-space-xl font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary-container cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option>Highest Rated (Default)</option>
                  <option>Fastest Delivery</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Most Popular</option>
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-space-md pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </span>
              </div>
              <div className="flex items-center bg-surface-container-low rounded p-1 border border-outline-variant">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition-all ${
                    viewMode === "grid"
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
                  className={`p-1.5 rounded transition-all ${
                    viewMode === "list"
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
      <div className="max-w-[1440px] mx-auto px-margin py-space-xl w-full">
        <div className="flex flex-col lg:flex-row gap-gutter items-start">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-[280px] shrink-0 sticky top-24 bg-surface-container-lowest border border-outline-variant rounded p-space-lg flex flex-col gap-space-lg">
            <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant">
              <div className="flex items-center gap-space-xs text-primary">
                <span className="material-symbols-outlined text-lg">filter_alt</span>
                <span className="font-label-lg text-label-lg font-semibold uppercase tracking-wider">
                  Filters
                </span>
              </div>
              <button
                onClick={handleResetAll}
                className="font-label-sm text-label-sm text-secondary hover:text-on-secondary-container transition-colors font-medium cursor-pointer"
                type="button"
              >
                Reset All
              </button>
            </div>

            {/* Open Kitchens Only Toggle */}
            <div className="flex items-center justify-between py-space-xs">
              <div>
                <span className="block font-label-md text-label-md text-on-surface font-medium">
                  Open Kitchens Only
                </span>
                <span className="block font-body-sm text-[12px] text-on-surface-variant">
                  Open for orders &amp; dining right now
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={openKitchensOnly}
                  onChange={(e) => setOpenKitchensOnly(e.target.checked)}
                  className="sr-only peer"
                  type="checkbox"
                />
                <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>

            {/* Service Mode Selector */}
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Service Mode
              </span>
              <div className="grid grid-cols-2 gap-space-xs bg-surface-container-low p-1 rounded-lg border border-outline-variant">
                <button
                  type="button"
                  onClick={() => setServiceMode("delivery")}
                  className={`py-1.5 px-space-sm rounded-md font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 transition-all ${
                    serviceMode === "delivery"
                      ? "bg-surface-container-lowest text-primary shadow-xs"
                      : "text-on-surface-variant hover:text-primary font-medium"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">delivery_dining</span> Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setServiceMode("dine-in")}
                  className={`py-1.5 px-space-sm rounded-md font-label-sm text-label-sm flex items-center justify-center gap-1 transition-all ${
                    serviceMode === "dine-in"
                      ? "bg-surface-container-lowest text-primary shadow-xs font-semibold"
                      : "text-on-surface-variant hover:text-primary font-medium"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">table_restaurant</span> Dine-in
                </button>
              </div>
            </div>

            {/* Cuisines */}
            <div className="flex flex-col gap-space-sm pt-space-xs border-t border-outline-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Cuisines
              </span>
              <div className="flex flex-col gap-space-xs max-h-56 overflow-y-auto pr-space-xs">
                <label className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface cursor-pointer select-none">
                  <input
                    checked={selectedCuisines.length === 0}
                    onChange={() => toggleCuisine("all")}
                    className="w-4 h-4 rounded border-outline-variant text-primary-container focus:ring-0"
                    type="checkbox"
                  />
                  <span className="flex-1">All Cuisines</span>
                  <span className="text-on-surface-variant text-[11px] font-label-sm">142</span>
                </label>
                <label className="flex items-center gap-space-sm font-body-sm text-body-sm text-primary font-semibold cursor-pointer select-none">
                  <input
                    checked={selectedCuisines.includes("desi")}
                    onChange={() => toggleCuisine("desi")}
                    className="w-4 h-4 rounded border-outline-variant text-primary-container focus:ring-0 accent-primary-container"
                    type="checkbox"
                  />
                  <span className="flex-1">Desi &amp; Biryani</span>
                  <span className="text-on-surface-variant text-[11px] font-label-sm">38</span>
                </label>
                <label className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface cursor-pointer select-none">
                  <input
                    checked={selectedCuisines.includes("burger")}
                    onChange={() => toggleCuisine("burger")}
                    className="w-4 h-4 rounded border-outline-variant text-primary-container focus:ring-0 accent-primary-container"
                    type="checkbox"
                  />
                  <span className="flex-1">Artisan Burgers</span>
                  <span className="text-on-surface-variant text-[11px] font-label-sm">24</span>
                </label>
                <label className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface cursor-pointer select-none">
                  <input
                    checked={selectedCuisines.includes("italian")}
                    onChange={() => toggleCuisine("italian")}
                    className="w-4 h-4 rounded border-outline-variant text-primary-container focus:ring-0 accent-primary-container"
                    type="checkbox"
                  />
                  <span className="flex-1">Italian &amp; Woodfired</span>
                  <span className="text-on-surface-variant text-[11px] font-label-sm">19</span>
                </label>
                <label className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface cursor-pointer select-none">
                  <input
                    checked={selectedCuisines.includes("japanese")}
                    onChange={() => toggleCuisine("japanese")}
                    className="w-4 h-4 rounded border-outline-variant text-primary-container focus:ring-0 accent-primary-container"
                    type="checkbox"
                  />
                  <span className="flex-1">Japanese &amp; Izakaya</span>
                  <span className="text-on-surface-variant text-[11px] font-label-sm">15</span>
                </label>
                <label className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface cursor-pointer select-none">
                  <input
                    checked={selectedCuisines.includes("asian")}
                    onChange={() => toggleCuisine("asian")}
                    className="w-4 h-4 rounded border-outline-variant text-primary-container focus:ring-0 accent-primary-container"
                    type="checkbox"
                  />
                  <span className="flex-1">Pan-Asian &amp; Dim Sum</span>
                  <span className="text-on-surface-variant text-[11px] font-label-sm">22</span>
                </label>
                <label className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface cursor-pointer select-none">
                  <input
                    checked={selectedCuisines.includes("dessert")}
                    onChange={() => toggleCuisine("dessert")}
                    className="w-4 h-4 rounded border-outline-variant text-primary-container focus:ring-0 accent-primary-container"
                    type="checkbox"
                  />
                  <span className="flex-1">Patisserie &amp; Desserts</span>
                  <span className="text-on-surface-variant text-[11px] font-label-sm">16</span>
                </label>
              </div>
            </div>

            {/* Tasting Tier (Price) */}
            <div className="flex flex-col gap-space-sm pt-space-xs border-t border-outline-variant">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  Tasting Tier
                </span>
                <span className="font-body-sm text-[12px] text-on-surface-variant">Avg. per cover</span>
              </div>
              <div className="grid grid-cols-4 gap-space-xs">
                {(["৳", "৳৳", "৳৳৳", "৳৳৳৳"] as const).map((tier) => {
                  const isSelected = selectedPriceTiers.includes(tier);
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => togglePriceTier(tier)}
                      className={`py-1.5 border rounded-md font-label-md text-label-md transition-colors ${
                        isSelected
                          ? "border-primary-container bg-primary-container text-on-primary font-semibold"
                          : "border-outline-variant text-on-surface hover:border-primary"
                      }`}
                    >
                      {tier}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minimum Critic Score */}
            <div className="flex flex-col gap-space-sm pt-space-xs border-t border-outline-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Minimum Critic Score
              </span>
              <div className="flex flex-col gap-space-xs">
                <label
                  className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                    minRating === 4.5
                      ? "border-primary-container/60 bg-primary-fixed/20"
                      : "border-outline-variant/60 hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex items-center gap-space-sm">
                    <input
                      checked={minRating === 4.5}
                      onChange={() => setMinRating(4.5)}
                      className="text-primary-container accent-primary-container"
                      name="rating-filter"
                      type="radio"
                    />
                    <span className="font-label-md text-label-md font-medium text-on-surface">
                      Exceptional (4.5+ ★)
                    </span>
                  </div>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">42 spots</span>
                </label>
                <label
                  className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                    minRating === 4.0
                      ? "border-primary-container/60 bg-primary-fixed/20"
                      : "border-outline-variant/60 hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex items-center gap-space-sm">
                    <input
                      checked={minRating === 4.0}
                      onChange={() => setMinRating(4.0)}
                      className="text-primary-container accent-primary-container"
                      name="rating-filter"
                      type="radio"
                    />
                    <span className="font-label-md text-label-md font-medium text-on-surface">
                      Very Good (4.0+ ★)
                    </span>
                  </div>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">98 spots</span>
                </label>
                <label
                  className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                    minRating === 3.5
                      ? "border-primary-container/60 bg-primary-fixed/20"
                      : "border-outline-variant/60 hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex items-center gap-space-sm">
                    <input
                      checked={minRating === 3.5}
                      onChange={() => setMinRating(3.5)}
                      className="text-primary-container accent-primary-container"
                      name="rating-filter"
                      type="radio"
                    />
                    <span className="font-label-md text-label-md font-medium text-on-surface">
                      Good (3.5+ ★)
                    </span>
                  </div>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">142 spots</span>
                </label>
              </div>
            </div>

            {/* Special Dietary & Ethos */}
            <div className="flex flex-col gap-space-sm pt-space-xs border-t border-outline-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Special Dietary &amp; Ethos
              </span>
              <div className="flex flex-col gap-space-xs">
                <label className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface cursor-pointer select-none">
                  <input
                    checked={dietaryFilters.halal}
                    onChange={(e) =>
                      setDietaryFilters({ ...dietaryFilters, halal: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-outline-variant accent-primary-container"
                    type="checkbox"
                  />
                  <span>Halal Certified</span>
                </label>
                <label className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface cursor-pointer select-none">
                  <input
                    checked={dietaryFilters.vegetarian}
                    onChange={(e) =>
                      setDietaryFilters({ ...dietaryFilters, vegetarian: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-outline-variant accent-primary-container"
                    type="checkbox"
                  />
                  <span>Vegetarian Friendly</span>
                </label>
                <label className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface cursor-pointer select-none">
                  <input
                    checked={dietaryFilters.kidFriendly}
                    onChange={(e) =>
                      setDietaryFilters({ ...dietaryFilters, kidFriendly: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-outline-variant accent-primary-container"
                    type="checkbox"
                  />
                  <span>Kid &amp; Family Friendly</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Results Main Column */}
          <div className="flex-1 w-full min-w-0 flex flex-col gap-space-lg">
            {/* Active Filters Bar */}
            <div className="flex flex-wrap items-center gap-space-xs pb-space-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mr-space-xs">
                Active Filters:
              </span>
              {openKitchensOnly && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-lowest border border-outline-variant rounded font-label-sm text-label-sm text-primary">
                  <span>Open Now</span>
                  <button
                    aria-label="Remove open filter"
                    onClick={() => setOpenKitchensOnly(false)}
                    className="hover:text-secondary text-outline hover:rotate-90 transition-all flex items-center"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </span>
              )}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-lowest border border-outline-variant rounded font-label-sm text-label-sm text-primary">
                  <span>Rating: {minRating}+ ★</span>
                  <button
                    aria-label="Remove rating filter"
                    onClick={() => setMinRating(0)}
                    className="hover:text-secondary text-outline hover:rotate-90 transition-all flex items-center"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </span>
              )}
              {selectedCuisines.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-lowest border border-outline-variant rounded-sm font-label-sm text-xs text-primary font-medium shadow-xs"
                >
                  <span className="capitalize">{c === "desi" ? "Desi & Biryani" : c}</span>
                  <button
                    aria-label={`Remove ${c} filter`}
                    onClick={() => toggleCuisine(c)}
                    className="hover:text-secondary text-outline hover:rotate-90 transition-all flex items-center"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </span>
              ))}
              <button
                onClick={handleResetAll}
                className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary ml-space-xs underline underline-offset-4 decoration-outline-variant"
                type="button"
              >
                Clear all
              </button>
            </div>

            {/* Restaurant Cards Container (Grid or List) */}
            {filteredRestaurants.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter w-full"
                    : "flex flex-col gap-gutter w-full"
                }
              >
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs p-space-xl flex flex-col items-center justify-center text-center my-6">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary-container mb-space-sm">
                  <span className="material-symbols-outlined text-3xl">soup_kitchen</span>
                </div>
                <h3 className="font-headline-sm text-xl text-on-surface mb-1">No matches found</h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-md">
                  Try widening your price tier or disabling the &ldquo;Open Kitchens Only&rdquo; constraint.
                </p>
                <button
                  onClick={handleResetAll}
                  className="px-space-md py-2 border border-primary-container text-primary-container hover:bg-primary-container/5 rounded-lg font-label-sm text-label-sm font-semibold transition-colors"
                  type="button"
                >
                  Clear Active Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="mt-space-lg pt-space-lg border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Showing <span className="font-semibold text-on-surface">{filteredRestaurants.length}</span> restaurant{filteredRestaurants.length === 1 ? "" : "s"}
              </p>
              <div className="flex items-center gap-space-xs">
                <button
                  className="px-3 py-1.5 border border-outline-variant rounded-md font-label-md text-label-md text-outline hover:text-on-surface hover:border-on-surface disabled:opacity-40 transition-colors flex items-center gap-1"
                  disabled
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span> Prev
                </button>
                <button
                  className="w-8 h-8 rounded-md bg-primary-container text-on-primary font-label-md text-label-md font-semibold"
                  type="button"
                >
                  1
                </button>
                <button
                  className="w-8 h-8 rounded-md border border-outline-variant hover:border-primary-container font-label-md text-label-md text-on-surface transition-colors"
                  type="button"
                >
                  2
                </button>
                <button
                  className="w-8 h-8 rounded-md border border-outline-variant hover:border-primary-container font-label-md text-label-md text-on-surface transition-colors"
                  type="button"
                >
                  3
                </button>
                <span className="px-1 text-outline">...</span>
                <button
                  className="w-8 h-8 rounded-md border border-outline-variant hover:border-primary-container font-label-md text-label-md text-on-surface transition-colors"
                  type="button"
                >
                  12
                </button>
                <button
                  className="px-3 py-1.5 border border-outline-variant rounded-md font-label-md text-label-md text-on-surface hover:border-primary-container transition-colors flex items-center gap-1"
                  type="button"
                >
                  Next <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <main className="w-full pt-20 bg-surface">
      <Suspense fallback={<div className="p-8 text-center text-primary">Loading curated dining spots...</div>}>
        <ExploreContent />
      </Suspense>
    </main>
  );
}
