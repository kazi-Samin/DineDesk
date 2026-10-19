"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MenuCard, { MenuItemProps } from "@/components/ui/MenuCard";
import ExploreHeader from "@/components/explore/ExploreHeader";
import ExploreToolbar from "@/components/explore/ExploreToolbar";
import ExploreSidebar from "@/components/explore/ExploreSidebar";
import ExplorePagination from "@/components/explore/ExplorePagination";

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

  const [sortBy, setSortBy] = useState<string>("Sequential (#1 - #400)");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // State for clicked menu card instant preview modal
  const [selectedMenuPreview, setSelectedMenuPreview] = useState<MenuItemProps | null>(null);

  // Backend Menus State
  const [menus, setMenus] = useState<MenuItemProps[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch live menus from API
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

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, openKitchensOnly, serviceMode, selectedCuisines, selectedPriceTiers, minRating, dietaryFilters, sortBy]);

  // Toggle Cuisines
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

  // Toggle Price Tier
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

  // Client-side filtering & sorting
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

    // Sorting Logic
    if (sortBy === "Sequential (#1 - #400)") {
      // Database order
    } else if (sortBy === "Highest Rated (Default)") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "Price: Low to High") {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "Price: High to Low") {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "Most Popular") {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return result;
  }, [menus, openKitchensOnly, selectedPriceTiers, minRating, dietaryFilters, sortBy]);

  // Pagination Logic (10 Items Per Page)
  const totalPages = Math.ceil(filteredMenus.length / 10);
  const paginatedMenus = useMemo(() => {
    const start = (currentPage - 1) * 10;
    return filteredMenus.slice(start, start + 10);
  }, [filteredMenus, currentPage]);

  // Auto-scroll and highlight target card when returning from details page via hash
  useEffect(() => {
    if (!loading && paginatedMenus.length > 0) {
      const hash = window.location.hash;
      if (hash && hash.startsWith("#card-")) {
        const element = document.getElementById(hash.replace("#", ""));
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("ring-4", "ring-primary", "transition-all", "duration-700");
            setTimeout(() => {
              element.classList.remove("ring-4", "ring-primary");
            }, 2000);
          }, 300);
        }
      }
    }
  }, [loading, paginatedMenus]);

  const activeFilterCount =
    (openKitchensOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    selectedCuisines.length +
    selectedPriceTiers.length +
    Object.values(dietaryFilters).filter(Boolean).length;

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      <ExploreHeader totalCount={filteredMenus.length} />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10 w-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start relative">

          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <ExploreSidebar
              openKitchensOnly={openKitchensOnly}
              setOpenKitchensOnly={setOpenKitchensOnly}
              serviceMode={serviceMode}
              setServiceMode={setServiceMode}
              selectedCuisines={selectedCuisines}
              toggleCuisine={toggleCuisine}
              selectedPriceTiers={selectedPriceTiers}
              togglePriceTier={togglePriceTier}
              minRating={minRating}
              setMinRating={setMinRating}
              dietaryFilters={dietaryFilters}
              setDietaryFilters={setDietaryFilters}
              handleResetAll={handleResetAll}
            />
          </div>

          {/* Mobile Drawer Sidebar */}
          {mobileFilterOpen && (
            <ExploreSidebar
              openKitchensOnly={openKitchensOnly}
              setOpenKitchensOnly={setOpenKitchensOnly}
              serviceMode={serviceMode}
              setServiceMode={setServiceMode}
              selectedCuisines={selectedCuisines}
              toggleCuisine={toggleCuisine}
              selectedPriceTiers={selectedPriceTiers}
              togglePriceTier={togglePriceTier}
              minRating={minRating}
              setMinRating={setMinRating}
              dietaryFilters={dietaryFilters}
              setDietaryFilters={setDietaryFilters}
              handleResetAll={handleResetAll}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setMobileFilterOpen(false)}
            />
          )}

          {/* Main Column */}
          <div className="flex-1 w-full min-w-0 flex flex-col gap-6">
            <ExploreToolbar
              search={search}
              setSearch={setSearch}
              sortBy={sortBy}
              setSortBy={setSortBy}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onMobileFilterOpen={() => setMobileFilterOpen(true)}
              activeFilterCount={activeFilterCount}
            />

            {/* Active Filters Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mr-1">
                Active Filters:
              </span>
              {openKitchensOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs text-primary font-bold shadow-2xs">
                  <span>Open Now</span>
                  <button onClick={() => setOpenKitchensOnly(false)} className="hover:text-secondary cursor-pointer" type="button">
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              )}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs text-primary font-bold shadow-2xs">
                  <span>Rating: {minRating}+ ★</span>
                  <button onClick={() => setMinRating(0)} className="hover:text-secondary cursor-pointer" type="button">
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              )}
              {selectedCuisines.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs text-primary font-bold capitalize shadow-2xs">
                  <span>{c}</span>
                  <button onClick={() => toggleCuisine(c)} className="hover:text-secondary cursor-pointer" type="button">
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              ))}
              {selectedPriceTiers.map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs text-primary font-bold shadow-2xs">
                  <span>Tier: {t}</span>
                  <button onClick={() => togglePriceTier(t)} className="hover:text-secondary cursor-pointer" type="button">
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              ))}
              {activeFilterCount === 0 && (
                <span className="text-xs text-on-surface-variant/70 italic font-medium">None applied</span>
              )}
            </div>

            {/* Menu Cards */}
            {loading ? (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6" : "flex flex-col gap-4"}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-surface-container animate-pulse rounded-3xl shadow-sm" />
                ))}
              </div>
            ) : paginatedMenus.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 w-full"
                    : "flex flex-col gap-4 w-full"
                }
              >
                {paginatedMenus.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    viewMode={viewMode}
                    onCardClick={(clickedItem) => setSelectedMenuPreview(clickedItem)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-12 flex flex-col items-center justify-center text-center my-6 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined text-3xl">soup_kitchen</span>
                </div>
                <h3 className="font-heading font-bold text-xl text-on-surface mb-1">No matching menus found</h3>
                <p className="text-sm text-on-surface-variant max-w-sm mb-6">
                  Try adjusting your search query, price tier, or disabling active filters.
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

            {/* Pagination */}
            <ExplorePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 200, behavior: "smooth" });
              }}
              totalItems={filteredMenus.length}
            />

          </div>
        </div>
      </div>

      {/* Instant Click Menu Preview Modal (Fixed Cross Overlap, Separated Serial Tag, Image Fallback) */}
      {selectedMenuPreview && (() => {
        const rawName = selectedMenuPreview.menuName || "Gourmet Dish";
        const serialMatch = rawName.match(/#(\d+)/);
        const serialTag = serialMatch ? `Item #${serialMatch[1]}` : `#001`;
        const cleanName = rawName.replace(/^Menu Item #\d+:\s*/, '');

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 relative border border-outline-variant mt-6">

              {/* Safe Non-Overlapping Close Button */}
              <button
                onClick={() => setSelectedMenuPreview(null)}
                className="absolute -top-3 -right-3 md:top-4 md:right-4 w-9 h-9 rounded-full bg-surface-container-lowest text-on-surface border border-outline-variant flex items-center justify-center font-bold hover:text-primary cursor-pointer transition-colors shadow-lg z-20"
                type="button"
              >
                ✕
              </button>

              {/* Modal Header Image with Error Fallback */}
              <div className="relative w-full h-52 md:h-60 rounded-2xl overflow-hidden bg-surface-container shadow-sm border border-outline-variant/40">
                <img
                  src={selectedMenuPreview.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"}
                  alt={cleanName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop";
                  }}
                />
              </div>

              {/* Modal Info & Separated Smaller Serial Tag */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-secondary uppercase tracking-widest">
                    {selectedMenuPreview.restaurantName}
                  </span>
                  <span className="text-xs text-on-surface-variant font-semibold">
                    Location: <span className="text-on-surface font-bold">{selectedMenuPreview.neighborhood || "Gulshan, Dhaka"}</span>
                  </span>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  <span className="w-fit text-[10px] font-extrabold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wider">
                    {serialTag}
                  </span>
                  <h3 className="font-heading font-extrabold text-lg md:text-xl text-on-surface leading-snug tracking-tight">
                    {cleanName}
                  </h3>
                </div>

                <p className="text-xs text-on-surface-variant font-medium capitalize mt-0.5">
                  Cuisine Specialty: <span className="text-on-surface font-semibold">{selectedMenuPreview.cuisineCategory}</span>
                </p>
              </div>

              {/* Structured Footer with Price and Full-Width Action Button */}
              <div className="flex flex-col gap-4 pt-4 border-t border-outline-variant/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-on-surface-variant">
                    Gourmet Price
                  </span>
                  <span className="text-2xl font-black text-primary tracking-tight">
                    ${Number(selectedMenuPreview.price || 18.50).toFixed(2)}
                  </span>
                </div>

                {/* Full-Width Premium Action Button */}
                <Link
                  href={`/menus/${selectedMenuPreview.id}`}
                  className="w-full py-4 rounded-2xl bg-primary text-on-primary font-bold text-xs tracking-wider uppercase shadow-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Full Details Page</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>

            </div>
          </div>
        );
      })()}
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