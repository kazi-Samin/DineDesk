"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import DashboardLoader from "@/components/ui/DashboardLoader";

import { INITIAL_CUSTOMER_PROFILE } from "@/data/mockCustomerProfile";
import { fetchCustomerOrders } from "@/services/customerDataService";
import { useCart } from "@/context/CartContext";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export interface DatabaseMenu {
  id: string;
  name: string;
  restaurantName: string;
  restaurantId: string;
  price: number;
  description: string;
  image: string;
  imageAlt: string;
  cuisineCategory?: string;
  rating?: number;
  isSaved?: boolean;
  isFavorite?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://dine-desk-backend.vercel.app";

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("dinedesk_auth_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("dinedesk_token") ||
    localStorage.getItem("auth_token") ||
    ""
  );
};

export default function CustomerFavoritesPage() {
  const router = useRouter();
  const { addItem, openDrawer } = useCart();
  const { user } = useAuth();
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_customer_sidebar");

  const [profile, setProfile] = useState(INITIAL_CUSTOMER_PROFILE);
  const [allMenus, setAllMenus] = useState<DatabaseMenu[]>([]);
  const [points, setPoints] = useState(0); // Dynamic real loyalty points starting at 0
  const [isLoaded, setIsLoaded] = useState(false);

  // Filter & Pagination States
  const [activeTab, setActiveTab] = useState<"all" | "saved" | "favorites">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [addingDishId, setAddingDishId] = useState<string | null>(null);

  const realUserName = user?.name || profile.fullName || "Valued Diner";
  const realUserEmail = user?.email || profile.email || "diner@dinedesk.com";

  // Dynamic telemetry synchronizer scoping points strictly to real orders
  const syncTelemetryData = async () => {
    try {
      let loadedProfile = { ...INITIAL_CUSTOMER_PROFILE };

      if (user) {
        loadedProfile.fullName = user.name || loadedProfile.fullName;
        loadedProfile.email = user.email || loadedProfile.email;
        if (user.phone) loadedProfile.phone = user.phone;
        if (user.avatarUrl) {
          loadedProfile.avatarUrl = user.avatarUrl;
        } else {
          loadedProfile.avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.email || "Diner")}`;
        }
      }

      const token = getAuthToken();

      const profileRes = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        credentials: "include",
      }).catch(() => null);

      if (profileRes && profileRes.ok) {
        const data = await profileRes.json();
        const userData = data.user || data;
        if (userData && (!user || userData.email === user.email)) {
          loadedProfile = {
            ...loadedProfile,
            ...userData,
            fullName: userData.fullName || userData.name || loadedProfile.fullName,
            avatarUrl: userData.avatarUrl || loadedProfile.avatarUrl,
          };
        }
      }

      setProfile(loadedProfile);

      const menuRes = await fetch(`/api/customer/favorites`, { credentials: "include" }).catch(() => null);
      if (menuRes && menuRes.ok) {
        const jsonResponse = await menuRes.json();
        const fetchedMenus = jsonResponse.menus || [];
        setAllMenus(fetchedMenus);
      }

      // Fetch real orders scoped strictly to user
      const realOrders = await fetchCustomerOrders(user?.id);
      const userSpecificPayments = user?.id
        ? JSON.parse(localStorage.getItem(`dinedesk_stripe_payments_${user.id}`) || "[]")
        : [];

      const totalPayments = realOrders.length + userSpecificPayments.length;
      const calculatedPoints = totalPayments * 20;

      setPoints(calculatedPoints);
    } catch (err) {
      console.error("Failed to sync telemetry:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      await syncTelemetryData();
      if (isMounted) setIsLoaded(true);
    }

    loadInitialData();

    // Listen to storage events so loyalty points update instantly across actions
    const handleStorageChange = () => {
      syncTelemetryData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("profile-updated", handleStorageChange);
    window.addEventListener("order-updated", handleStorageChange);
    window.addEventListener("dinedesk-points-updated", handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("profile-updated", handleStorageChange);
      window.removeEventListener("order-updated", handleStorageChange);
      window.removeEventListener("dinedesk-points-updated", handleStorageChange);
    };
  }, [user]);

  const handleToggleSave = async (menuId: string, menuName: string, currentStatus: boolean) => {
    setAllMenus((prev) =>
      prev.map((m) => (m.id === menuId ? { ...m, isSaved: !currentStatus } : m))
    );
    toast.success(!currentStatus ? `Added "${menuName}" to Saved Menus.` : `Removed "${menuName}" from Saved Menus.`);
  };

  const handleToggleFavorite = async (menuId: string, menuName: string, currentStatus: boolean) => {
    setAllMenus((prev) =>
      prev.map((m) => (m.id === menuId ? { ...m, isFavorite: !currentStatus } : m))
    );
    toast.success(!currentStatus ? `Added "${menuName}" to Favorites.` : `Removed "${menuName}" from Favorites.`);
  };

  const handleAddToCart = (menu: DatabaseMenu) => {
    setAddingDishId(menu.id);

    const cartItem = {
      id: menu.id,
      menuId: menu.id,
      name: menu.name,
      price: menu.price,
      quantity: 1,
      variant: menu.description,
      image: menu.image,
      imageAlt: menu.imageAlt,
      restaurantName: menu.restaurantName || "The Maple & Vine",
    };

    const existingCart = JSON.parse(localStorage.getItem("dine_desk_cart") || "[]");
    const existingIndex = existingCart.findIndex((i: any) => i.id === menu.id || i.menuId === menu.id);

    if (existingIndex > -1) {
      existingCart[existingIndex].quantity += 1;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem("dine_desk_cart", JSON.stringify(existingCart));
    localStorage.setItem("dinedesk_cart", JSON.stringify(existingCart));

    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("open-cart-drawer"));

    try {
      addItem({
        id: menu.id,
        name: menu.name,
        price: menu.price,
        quantity: 1,
        variant: menu.description,
        image: menu.image,
        imageAlt: menu.imageAlt,
      } as any);
    } catch (e) {
      // fallback handled by direct localStorage sync
    }

    openDrawer();
    toast.success(`Dispatched ${menu.name} ($${menu.price}) to cart.`);
    setTimeout(() => setAddingDishId(null), 1500);
  };

  const filteredMenus = useMemo(() => {
    return allMenus.filter((menu) => {
      if (activeTab === "saved" && !menu.isSaved) return false;
      if (activeTab === "favorites" && !menu.isFavorite) return false;
      if (cuisineFilter !== "all" && menu.cuisineCategory !== cuisineFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${menu.name} ${menu.restaurantName} ${menu.description}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [allMenus, activeTab, cuisineFilter, searchQuery]);

  const totalPages = Math.ceil(filteredMenus.length / itemsPerPage) || 1;
  const paginatedMenus = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMenus.slice(start, start + itemsPerPage);
  }, [filteredMenus, currentPage]);

  const savedCount = useMemo(() => allMenus.filter((m) => m.isSaved).length, [allMenus]);
  const favoriteCount = useMemo(() => allMenus.filter((m) => m.isFavorite).length, [allMenus]);

  if (!isLoaded) {
    return (
      <div className="bg-[#f8f9f6] min-h-screen text-[#1b3b2b] flex flex-col antialiased">
        <CustomerHeader userName={realUserName} userRole={profile.roleBadge} avatarUrl={profile.avatarUrl} onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="flex pt-20 flex-1">
          <CustomerSidebar isOpen={isSidebarOpen} onClose={closeSidebar} onToggle={toggleSidebar} loyaltyPoints={points} />
          <main className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>
            <DashboardLoader />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9f6] font-body-md text-[#1b3b2b] antialiased min-h-screen selection:bg-[#1b3b2b] selection:text-white">
      <CustomerHeader
        userName={realUserName}
        userRole={profile.roleBadge}
        avatarUrl={profile.avatarUrl}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* Dynamic Loyalty Points passed to Sidebar */}
      <CustomerSidebar
        userName={`${realUserName.split(" ")[0]}'s Account`}
        memberSince={profile.memberSince}
        avatarUrl={profile.avatarUrl}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
        activeOrderCount={profile.stats.activeBookings}
        loyaltyPoints={points}
      />

      <div className={`transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>
        <main className="w-full pt-20 bg-[#f8f9f6] min-h-screen flex flex-col justify-between">

          <div className="w-full flex flex-col">
            {/* Welcome Banner & Stats */}
            <section className="w-full px-6 sm:px-10 py-6 bg-gradient-to-r from-white via-[#f8f9f6] to-white border-b border-[#1b3b2b]/10 shadow-xs">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div>
                  <h1 className="font-heading font-extrabold text-xl text-[#1b3b2b]">
                    Welcome back, {realUserName}
                  </h1>
                  <p className="text-xs font-medium text-[#1b3b2b]/70 mt-0.5">
                    {realUserEmail} {user?.phone && `• ${user.phone}`}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">Saved Menus</span>
                    <span className="font-heading font-black text-xl text-[#1b3b2b] mt-0.5 block">{savedCount}</span>
                  </div>
                  <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">Favorites</span>
                    <span className="font-heading font-black text-xl text-[#C05621] mt-0.5 block">{favoriteCount}</span>
                  </div>
                  <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">Loyalty Pts</span>
                    <span className="font-heading font-black text-xl text-[#C05621] mt-0.5 block">{points.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Page Content */}
            <div className="w-full px-6 sm:px-10 py-10 max-w-7xl mx-auto">
              <div className="flex flex-col w-full">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                  <div>
                    <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#1b3b2b] tracking-tight">
                      Saved Menus &amp; Favorites
                    </h1>
                    <p className="text-xs font-medium text-[#1b3b2b]/70 mt-1 max-w-xl">
                      Browse and manage your curated culinary selections synchronized from live database inventories ({allMenus.length} total available).
                    </p>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-2 self-start md:self-auto bg-white/80 p-1.5 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                    <button
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === "all" ? "bg-[#1b3b2b] text-white shadow-md" : "text-[#1b3b2b]/70 hover:text-[#1b3b2b]"}`}
                      onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
                      type="button"
                    >
                      All ({allMenus.length})
                    </button>
                    <button
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === "saved" ? "bg-[#1b3b2b] text-white shadow-md" : "text-[#1b3b2b]/70 hover:text-[#1b3b2b]"}`}
                      onClick={() => { setActiveTab("saved"); setCurrentPage(1); }}
                      type="button"
                    >
                      Saved Menus ({savedCount})
                    </button>
                    <button
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === "favorites" ? "bg-[#1b3b2b] text-white shadow-md" : "text-[#1b3b2b]/70 hover:text-[#1b3b2b]"}`}
                      onClick={() => { setActiveTab("favorites"); setCurrentPage(1); }}
                      type="button"
                    >
                      Favorites ({favoriteCount})
                    </button>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10">
                  <div className="lg:col-span-8 relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1b3b2b]/50 text-lg">search</span>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-white/90 text-[#1b3b2b] text-xs font-medium rounded-2xl placeholder:text-[#1b3b2b]/50 shadow-sm border border-[#1b3b2b]/15 focus:outline-none focus:border-[#1b3b2b] transition-all"
                      placeholder="Search database menus..."
                      type="text"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                  </div>

                  <div className="lg:col-span-4 relative">
                    <select
                      className="w-full appearance-none pl-4 pr-10 py-3 bg-white/90 text-xs font-bold text-[#1b3b2b] rounded-2xl shadow-sm border border-[#1b3b2b]/15 focus:outline-none focus:border-[#1b3b2b] cursor-pointer"
                      value={cuisineFilter}
                      onChange={(e) => { setCuisineFilter(e.target.value); setCurrentPage(1); }}
                    >
                      <option value="all">All Cuisines (Global)</option>
                      <option value="european">European &amp; Specialty</option>
                      <option value="american">Modern American</option>
                      <option value="japanese">Japanese Robata</option>
                      <option value="indian">Modern Indian</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1b3b2b]/50 pointer-events-none text-base">expand_more</span>
                  </div>
                </div>

                {/* Menus Grid */}
                {paginatedMenus.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {paginatedMenus.map((menu) => {
                      const isAdding = addingDishId === menu.id;

                      return (
                        <article
                          key={menu.id}
                          className="group bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl border border-[#1b3b2b]/15 hover:border-[#1b3b2b] transition-all flex flex-col justify-between h-full"
                        >
                          <div>
                            <div className="relative aspect-[16/10] w-full bg-white overflow-hidden">
                              <img
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                alt={menu.imageAlt}
                                src={menu.image}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80";
                                }}
                              />

                              <div className="absolute top-3 right-3 flex items-center gap-2">
                                <button
                                  aria-label="Save Menu"
                                  className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-transform shadow-md cursor-pointer border ${menu.isSaved ? "bg-[#1b3b2b] text-white border-[#1b3b2b]" : "bg-white/90 text-[#1b3b2b] border-[#1b3b2b]/15"
                                    }`}
                                  onClick={() => handleToggleSave(menu.id, menu.name, Boolean(menu.isSaved))}
                                  type="button"
                                  title="Save Menu"
                                >
                                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: menu.isSaved ? "'FILL' 1" : "'FILL' 0" }}>
                                    bookmark
                                  </span>
                                </button>

                                <button
                                  aria-label="Favorite Menu"
                                  className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-transform shadow-md cursor-pointer border ${menu.isFavorite ? "bg-red-600 text-white border-red-600" : "bg-white/90 text-red-600 border-[#1b3b2b]/15"
                                    }`}
                                  onClick={() => handleToggleFavorite(menu.id, menu.name, Boolean(menu.isFavorite))}
                                  type="button"
                                  title="Favorite Menu"
                                >
                                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: menu.isFavorite ? "'FILL' 1" : "'FILL' 0" }}>
                                    favorite
                                  </span>
                                </button>
                              </div>

                              <span className="absolute bottom-3 left-3 text-[10px] px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[#1b3b2b] shadow-sm font-extrabold border border-[#1b3b2b]/15">
                                {menu.restaurantName}
                              </span>
                            </div>

                            <div className="p-5">
                              <h3 className="font-heading font-extrabold text-sm text-[#1b3b2b] line-clamp-1">
                                {menu.name}
                              </h3>
                              <div className="text-[#C05621] font-heading font-black text-base my-1">
                                ${menu.price}
                              </div>
                              <p className="text-xs text-[#1b3b2b]/70 font-medium line-clamp-2 leading-relaxed">
                                {menu.description}
                              </p>
                            </div>
                          </div>

                          <div className="p-5 pt-0 mt-auto">
                            <button
                              className={`w-full py-2.5 px-4 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${isAdding ? "bg-[#1b3b2b] text-white scale-98" : "bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white"
                                }`}
                              onClick={() => handleAddToCart(menu)}
                              type="button"
                            >
                              <span className="material-symbols-outlined text-base">
                                {isAdding ? "check" : "add_shopping_cart"}
                              </span>
                              {isAdding ? "Dispatched" : "+ Add to Cart"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-dashed border-[#1b3b2b]/30 my-8">
                    <span className="material-symbols-outlined text-5xl text-[#1b3b2b]/30 mb-3">restaurant_menu</span>
                    <h3 className="font-heading font-black text-xl text-[#1b3b2b]">No Menus Found</h3>
                    <p className="text-xs font-medium text-[#1b3b2b]/70 max-w-md mt-1">
                      No matching records found for this category or filter.
                    </p>
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8 mb-12">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-5 py-2.5 bg-white rounded-2xl text-xs font-extrabold border border-[#1b3b2b]/20 disabled:opacity-40 cursor-pointer shadow-sm hover:border-[#1b3b2b]"
                    >
                      Previous Page
                    </button>
                    <span className="text-xs font-black text-[#1b3b2b] bg-white px-4 py-2.5 rounded-2xl border border-[#1b3b2b]/15 shadow-2xs">
                      Page {currentPage} of {totalPages} ({filteredMenus.length} Menus)
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-5 py-2.5 bg-white rounded-2xl text-xs font-extrabold border border-[#1b3b2b]/20 disabled:opacity-40 cursor-pointer shadow-sm hover:border-[#1b3b2b]"
                    >
                      Next Page
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>

          <CustomerFooter />
        </main>
      </div>
    </div>
  );
}