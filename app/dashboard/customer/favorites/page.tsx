"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import RestaurantDetailsModal from "@/components/customer/favorites/RestaurantDetailsModal";

import {
  FavoriteRestaurant,
  FavoriteDish,
  ActiveFavoritesTab,
  CuisineFilterType,
  AreaFilterType,
} from "@/types/customerFavorites";
import {
  getSavedRestaurants,
  getSavedDishes,
  removeFavoriteRestaurant,
  removeFavoriteDish,
} from "@/services/mockCustomerFavoritesService";
import { getCustomerProfile } from "@/services/mockCustomerProfileService";
import { INITIAL_CUSTOMER_PROFILE } from "@/data/mockCustomerProfile";
import { useCart } from "@/context/CartContext";
import { useReservation } from "@/context/ReservationContext";

export default function CustomerFavoritesPage() {
  const router = useRouter();
  const { addItem, openDrawer } = useCart();
  const { openReservationModal } = useReservation();

  // Sidebar responsive drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Profile data
  const [profile, setProfile] = useState(INITIAL_CUSTOMER_PROFILE);

  // Favorites state
  const [restaurants, setRestaurants] = useState<FavoriteRestaurant[]>([]);
  const [dishes, setDishes] = useState<FavoriteDish[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filter states
  const [activeTab, setActiveTab] = useState<ActiveFavoritesTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState<CuisineFilterType>("all");
  const [areaFilter, setAreaFilter] = useState<AreaFilterType>("all");

  // Detail Modal state
  const [detailsRestaurant, setDetailsRestaurant] = useState<FavoriteRestaurant | null>(null);

  // Added-to-cart button animation state
  const [addingDishId, setAddingDishId] = useState<string | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 2800);
  };

  // Load favorites and profile on client mount
  useEffect(() => {
    const loadedProfile = getCustomerProfile();
    const loadedRestaurants = getSavedRestaurants();
    const loadedDishes = getSavedDishes();

    setProfile(loadedProfile);
    setRestaurants(loadedRestaurants);
    setDishes(loadedDishes);
    setIsLoaded(true);
  }, []);

  // Remove actions
  const handleRemoveRestaurant = (id: string, name: string) => {
    const updated = removeFavoriteRestaurant(restaurants, id);
    setRestaurants(updated);
    showToast(`Removed "${name}" from saved restaurants.`);
  };

  const handleRemoveDish = (id: string, name: string) => {
    const updated = removeFavoriteDish(dishes, id);
    setDishes(updated);
    showToast(`Removed "${name}" from favorite dishes.`);
  };

  // Add dish to cart
  const handleAddToCart = (dish: FavoriteDish) => {
    setAddingDishId(dish.id);
    addItem({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
      variant: dish.description,
      image: dish.image,
      imageAlt: dish.imageAlt,
    });
    showToast(`Added ${dish.name} (৳${dish.price}) to Cart`);

    setTimeout(() => {
      setAddingDishId(null);
    }, 1500);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setActiveTab("all");
    setSearchQuery("");
    setCuisineFilter("all");
    setAreaFilter("all");
  };

  // Filtered lists
  const query = searchQuery.toLowerCase().trim();

  const filteredRestaurants = useMemo(() => {
    if (activeTab === "dishes") return [];

    return restaurants.filter((rest) => {
      // Cuisine filter
      if (cuisineFilter !== "all" && rest.cuisineKey !== cuisineFilter) return false;
      // Area filter
      if (areaFilter !== "all" && rest.areaKey !== areaFilter) return false;
      // Search
      if (query) {
        const text = `${rest.name} ${rest.cuisine} ${rest.neighborhood} ${rest.description}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      return true;
    });
  }, [restaurants, activeTab, cuisineFilter, areaFilter, query]);

  const filteredDishes = useMemo(() => {
    if (activeTab === "restaurants") return [];

    return dishes.filter((dish) => {
      // Cuisine filter
      if (cuisineFilter !== "all" && dish.cuisineKey !== cuisineFilter) return false;
      // Area filter
      if (areaFilter !== "all" && dish.areaKey !== areaFilter) return false;
      // Search
      if (query) {
        const text = `${dish.name} ${dish.restaurantName} ${dish.description}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      return true;
    });
  }, [dishes, activeTab, cuisineFilter, areaFilter, query]);

  // Derived counts
  const totalSavedSpots = restaurants.length + dishes.length;
  const isOverallEmpty = isLoaded && restaurants.length === 0 && dishes.length === 0;
  const isFilterEmpty =
    isLoaded &&
    !isOverallEmpty &&
    filteredRestaurants.length === 0 &&
    filteredDishes.length === 0;

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      {/* Top Fixed Customer Navigation Header */}
      <CustomerHeader
        userName={profile.fullName}
        userRole={profile.roleBadge}
        avatarUrl={profile.avatarUrl}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Fixed Left Customer Navigation Sidebar */}
      <CustomerSidebar
        userName={`${profile.fullName.split(" ")[0]}'s Account`}
        memberSince={profile.memberSince}
        avatarUrl={profile.avatarUrl}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeOrderCount={profile.stats.activeBookings}
        loyaltyPoints={profile.stats.loyaltyPoints}
      />

      {/* Main Content Area */}
      <div className="pl-0 lg:pl-72 transition-all">
        <main className="w-full pt-16 bg-background min-h-screen">
          {/* Section 1: Patron Welcome Banner & Stats */}
          <section className="w-full px-space-xl py-space-lg bg-surface-container-low shadow-[0_1px_4px_rgba(0,0,0,0.02)] border-b border-outline-variant/20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
              <div className="flex flex-col gap-1">
                <span className="font-display-mobile md:font-headline-lg text-headline-lg text-on-surface font-medium">
                  Welcome back, {profile.fullName.split(" ")[0]}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {profile.email} • {profile.phone}
                </span>
              </div>

              {/* 4 Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-lg shadow-2xs border border-outline-variant">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">
                    Total Orders
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                    {profile.stats.totalOrders}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-lg shadow-2xs border border-outline-variant">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">
                    Active Bookings
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-semibold">
                    {profile.stats.activeBookings}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-lg shadow-2xs border border-outline-variant">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">
                    Saved Spots
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                    {totalSavedSpots}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-lg shadow-2xs border border-outline-variant">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">
                    Loyalty Points
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary-container font-semibold">
                    {profile.stats.loyaltyPoints.toLocaleString()} pts
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Page Heading & Filter Tabs */}
          <div className="w-full px-space-xl py-space-lg max-w-7xl mx-auto">
            <div className="flex flex-col w-full">
              {/* Heading Row */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg mb-space-xl">
                <div>
                  <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
                    Saved Favorites
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-xl">
                    Restaurants and dishes you&apos;ve bookmarked across Dhaka.
                  </p>
                </div>

                {/* 3 Filter Tabs */}
                <div className="flex items-center gap-space-sm self-start md:self-auto bg-surface-container-low p-1 rounded-lg border border-outline-variant">
                  <button
                    className={`tab-btn px-space-md py-1.5 rounded-md font-label-md text-label-md transition-all font-semibold ${
                      activeTab === "all"
                        ? "bg-surface-container-lowest text-primary shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    onClick={() => setActiveTab("all")}
                    type="button"
                  >
                    All Saved ({totalSavedSpots})
                  </button>
                  <button
                    className={`tab-btn px-space-md py-1.5 rounded-md font-label-md text-label-md transition-all font-semibold ${
                      activeTab === "restaurants"
                        ? "bg-surface-container-lowest text-primary shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    onClick={() => setActiveTab("restaurants")}
                    type="button"
                  >
                    Saved Restaurants ({restaurants.length})
                  </button>
                  <button
                    className={`tab-btn px-space-md py-1.5 rounded-md font-label-md text-label-md transition-all font-semibold ${
                      activeTab === "dishes"
                        ? "bg-surface-container-lowest text-primary shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    onClick={() => setActiveTab("dishes")}
                    type="button"
                  >
                    Favorite Dishes ({dishes.length})
                  </button>
                </div>
              </div>

              {/* Filter Controls Row (Search, Cuisine Select, Neighborhood Select) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md mb-space-xl">
                {/* Search Bar */}
                <div className="lg:col-span-6 relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    search
                  </span>
                  <input
                    className="w-full pl-10 pr-space-md py-2.5 bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-md placeholder:text-on-surface-variant shadow-xs border border-outline-variant focus:outline-none focus:border-primary-container transition-all"
                    id="savedSearch"
                    placeholder="Search saved kitchens, specialties, or cuisines..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                      aria-label="Clear search"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  )}
                </div>

                {/* Cuisine Filter */}
                <div className="lg:col-span-3">
                  <div className="relative">
                    <select
                      className="w-full appearance-none pl-space-md pr-10 py-2.5 bg-surface-container-lowest font-body-sm text-body-sm text-on-surface rounded-lg shadow-xs border border-outline-variant focus:outline-none focus:border-primary-container cursor-pointer"
                      id="cuisineSelect"
                      value={cuisineFilter}
                      onChange={(e) => setCuisineFilter(e.target.value as CuisineFilterType)}
                    >
                      <option value="all">All Cuisines</option>
                      <option value="mughlai">Mughlai &amp; Kacchi</option>
                      <option value="japanese">Japanese Robata</option>
                      <option value="artisan">Artisan Burgers</option>
                      <option value="dhakaiya">Old Dacca Heritage</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Neighborhood Filter */}
                <div className="lg:col-span-3">
                  <div className="relative">
                    <select
                      className="w-full appearance-none pl-space-md pr-10 py-2.5 bg-surface-container-lowest font-body-sm text-body-sm text-on-surface rounded-lg shadow-xs border border-outline-variant focus:outline-none focus:border-primary-container cursor-pointer"
                      id="areaSelect"
                      value={areaFilter}
                      onChange={(e) => setAreaFilter(e.target.value as AreaFilterType)}
                    >
                      <option value="all">All Neighborhoods</option>
                      <option value="banani">Banani &amp; Banani 11</option>
                      <option value="gulshan">Gulshan 2</option>
                      <option value="old-dhaka">Old Dhaka</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg">
                      location_on
                    </span>
                  </div>
                </div>
              </div>

              {/* Bookmarked Restaurants Section */}
              {activeTab !== "dishes" && filteredRestaurants.length > 0 && (
                <section className="section-group flex flex-col mb-14" id="restaurantSection">
                  <div className="flex items-baseline justify-between mb-space-lg">
                    <div className="flex items-center gap-space-sm">
                      <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                        Bookmarked Restaurants
                      </h2>
                      <span className="font-label-sm text-xs px-2 py-0.5 rounded-sm bg-surface-container-high text-on-surface-variant font-medium">
                        {filteredRestaurants.length} Ensembles
                      </span>
                    </div>
                    <Link
                      className="font-label-sm text-label-sm text-primary underline underline-offset-4 hover:text-secondary transition-colors font-semibold"
                      href="/dashboard/customer/reservations"
                    >
                      Manage Reservations
                    </Link>
                  </div>

                  {/* Restaurants Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
                    {filteredRestaurants.map((restaurant) => (
                      <article
                        key={restaurant.id}
                        className="card-item group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-all border border-outline-variant h-full justify-between"
                      >
                        {/* Image & Badges */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-container">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt={restaurant.imageAlt}
                            src={restaurant.image}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                          <div className="absolute top-2.5 left-2.5">
                            <span className="px-2.5 py-1 rounded-sm bg-surface-container-lowest/90 backdrop-blur-xs text-primary font-label-sm text-xs flex items-center gap-1 shadow-xs border border-outline-variant/60 font-medium">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  restaurant.statusVariant === "live"
                                    ? "bg-surface-tint animate-pulse"
                                    : "bg-secondary"
                                }`}
                              />
                              {restaurant.statusLabel}
                            </span>
                          </div>

                          {/* Heart Remove Button */}
                          <button
                            aria-label="Remove from Favorites"
                            className="favorite-toggle absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-surface-container-lowest/90 backdrop-blur-xs flex items-center justify-center text-secondary hover:scale-110 transition-transform shadow-xs cursor-pointer border border-outline-variant/60"
                            onClick={() =>
                              handleRemoveRestaurant(restaurant.id, restaurant.name)
                            }
                            type="button"
                          >
                            <span
                              className="material-symbols-outlined text-base"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              favorite
                            </span>
                          </button>

                          {/* Bottom info on image */}
                          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between text-on-primary">
                            <div>
                              <span className="font-label-sm text-xs text-secondary-fixed block font-medium">
                                {restaurant.areaBadge}
                              </span>
                              <p className="font-headline-sm text-base sm:text-lg text-on-primary leading-tight font-semibold line-clamp-1">
                                {restaurant.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 bg-primary-container/90 px-2 py-0.5 rounded-sm text-on-primary font-label-sm text-xs backdrop-blur-xs font-semibold">
                              <span className="material-symbols-outlined text-xs text-secondary-fixed">
                                star
                              </span>
                              <span>{restaurant.rating}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
                          <div className="space-y-space-xs">
                            <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-xs">
                              <span className="font-medium text-primary line-clamp-1">{restaurant.cuisine}</span>
                              <span className="shrink-0 text-on-surface-variant/80">
                                {restaurant.reviewCount} reviews
                              </span>
                            </div>
                            <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                              {restaurant.description}
                            </p>
                          </div>

                          {/* Card Actions */}
                          <div className="pt-3 bg-surface-container-lowest flex items-center gap-space-sm border-t border-outline-variant/50">
                            <button
                              onClick={() =>
                                openReservationModal({
                                  id: restaurant.restaurantId,
                                  name: restaurant.name,
                                  neighborhood: restaurant.neighborhood,
                                })
                              }
                              className="flex-1 py-2 px-3 bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-sm">
                                calendar_month
                              </span>
                              Reserve Table
                            </button>
                            <button
                              onClick={() => setDetailsRestaurant(restaurant)}
                              className="py-2 px-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-xs font-medium rounded-lg transition-colors border border-outline-variant/60"
                              type="button"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* Favorite Dishes Section */}
              {activeTab !== "restaurants" && filteredDishes.length > 0 && (
                <section className="section-group flex flex-col mb-14" id="dishSection">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-space-xs mb-space-lg">
                    <div className="flex items-center gap-space-sm">
                      <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                        Favorite Dishes
                      </h2>
                      <span className="font-label-sm text-xs px-2 py-0.5 rounded-sm bg-surface-container-high text-on-surface-variant font-medium">
                        Quick Reorder
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Tap + to dispatch direct to your dining basket
                    </span>
                  </div>

                  {/* Dishes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                    {filteredDishes.map((dish) => {
                      const isAdding = addingDishId === dish.id;

                      return (
                        <article
                          key={dish.id}
                          className="card-item group bg-surface-container-lowest rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-all flex flex-col justify-between border border-outline-variant h-full"
                        >
                          <div>
                            {/* Dish Image */}
                            <div className="relative aspect-[16/10] w-full bg-surface-container overflow-hidden">
                              <img
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                alt={dish.imageAlt}
                                src={dish.image}
                              />
                              <button
                                aria-label="Remove item"
                                className="favorite-toggle absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-surface-container-lowest/90 backdrop-blur-xs flex items-center justify-center text-secondary hover:scale-110 transition-transform shadow-xs cursor-pointer border border-outline-variant/60"
                                onClick={() => handleRemoveDish(dish.id, dish.name)}
                                type="button"
                              >
                                <span
                                  className="material-symbols-outlined text-base"
                                  style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                  favorite
                                </span>
                              </button>
                              <span className="absolute bottom-2.5 left-2.5 font-label-sm text-xs px-2 py-0.5 bg-surface-container-lowest/95 backdrop-blur-xs rounded-sm text-primary shadow-xs font-medium border border-outline-variant/60">
                                {dish.restaurantName}
                              </span>
                            </div>

                            {/* Dish Info */}
                            <div className="p-space-md">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-headline-sm text-base text-on-surface leading-snug font-semibold line-clamp-1">
                                  {dish.name}
                                </h3>
                              </div>
                              <div className="text-secondary font-headline-sm text-base mb-1.5 font-bold">
                                ৳{dish.price}
                              </div>
                              <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                                {dish.description}
                              </p>
                            </div>
                          </div>

                          {/* Add to Cart Button */}
                          <div className="p-space-md pt-0 mt-auto">
                            <button
                              className={`w-full py-2 px-space-md font-label-md text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-95 font-medium ${
                                isAdding
                                  ? "bg-primary text-on-primary scale-98"
                                  : "bg-primary-container hover:bg-primary text-on-primary"
                              }`}
                              onClick={() => handleAddToCart(dish)}
                              type="button"
                            >
                              <span className="material-symbols-outlined text-base">
                                {isAdding ? "check" : "add_shopping_cart"}
                              </span>
                              {isAdding ? "Added to Cart" : "+ Add to Cart"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Empty Filter Result State */}
              {isFilterEmpty && (
                <div
                  className="flex flex-col items-center justify-center py-16 text-center bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 mt-space-md"
                  id="emptyNotice"
                >
                  <span className="material-symbols-outlined text-5xl text-outline mb-space-sm">
                    bookmark_remove
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    No saved items found
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mt-1">
                    Try resetting your filter parameters or search term to discover your saved culinary favorites.
                  </p>
                  <button
                    className="mt-space-md px-space-lg py-2 bg-primary-container text-on-primary rounded-lg font-label-md text-label-md shadow-sm hover:bg-primary transition-colors font-semibold"
                    onClick={handleResetFilters}
                    type="button"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Complete Empty Collection State (when all items removed) */}
              {isOverallEmpty && (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-surface-container-lowest rounded-xl shadow-sm border border-dashed border-outline-variant mt-space-md">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-space-sm">
                    favorite_border
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                    Your Wishlist is Empty
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mt-1">
                    You haven&apos;t bookmarked any restaurants or dishes yet. Discover Dhaka&apos;s premier dining rooms and add your favorites.
                  </p>
                  <Link
                    href="/explore"
                    className="mt-space-md px-space-lg py-2.5 bg-primary-container text-on-primary rounded-xl font-label-md text-label-md shadow-sm hover:bg-primary transition-colors font-semibold"
                  >
                    Discover Restaurants
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Customer Footer */}
          <CustomerFooter />
        </main>
      </div>

      {/* Restaurant Details Modal */}
      <RestaurantDetailsModal
        isOpen={Boolean(detailsRestaurant)}
        restaurant={detailsRestaurant}
        onClose={() => setDetailsRestaurant(null)}
        onReserve={(rest) => {
          openReservationModal({
            id: rest.restaurantId,
            name: rest.name,
            neighborhood: rest.neighborhood,
          });
        }}
        onOrderOnline={() => {
          openDrawer();
        }}
      />

      {/* Floating Cart / Removal Action Toast */}
      {toastMessage && (
        <div
          className="fixed bottom-space-xl right-10 z-50 bg-primary text-on-primary px-space-lg py-space-sm rounded-xl shadow-xl border border-outline-variant/30 flex items-center gap-space-sm animate-in fade-in slide-in-from-bottom-4"
          id="cartToast"
        >
          <span className="material-symbols-outlined text-secondary-fixed text-lg">
            check_circle
          </span>
          <span className="font-label-md text-label-md" id="toastMessage">
            {toastMessage}
          </span>
        </div>
      )}
    </div>
  );
}
