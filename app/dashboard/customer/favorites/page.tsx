"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import DashboardLoader from "@/components/ui/DashboardLoader";

import { CustomerProfileData } from "@/types/customerProfile";
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://dine-desk-backend.vercel.app";

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

const EMPTY_PROFILE: CustomerProfileData = {
  fullName: "Diner",
  email: "",
  phone: "",
  avatarUrl: "",
  roleBadge: "Verified Foodie",
  memberSince: "Member since 2026",
  language: "en",
  dietaryPreferences: [],
  isEmailVerified: false,
  isPhoneVerified: false,
  passwordLastChangedDays: 0,
  twoFactorPhone: "",
  stats: {
    totalOrders: 0,
    activeBookings: 0,
    savedSpots: 0,
    loyaltyPoints: 0,
  },
};

export default function CustomerFavoritesPage() {
  const router = useRouter();
  const { addItem, openDrawer } = useCart();
  const { user, token: authContextToken } = useAuth();
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle(
    "dinedesk_customer_sidebar"
  );

  const [profile, setProfile] = useState<CustomerProfileData>(EMPTY_PROFILE);
  const [allMenus, setAllMenus] = useState<DatabaseMenu[]>([]);
  const [points, setPoints] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filter & Pagination States
  const [activeTab, setActiveTab] = useState<"all" | "saved" | "favorites">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [addingDishId, setAddingDishId] = useState<string | null>(null);

  const realUserName = user?.name || profile.fullName || "Diner";
  const realUserEmail = user?.email || profile.email || "";

  const syncDatabaseData = useCallback(async () => {
    try {
      const token = authContextToken || getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const [profileRes, ordersRes, resApi, favoritesRes, catalogRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/users/profile`, {
            method: "GET",
            headers,
            credentials: "include",
          }).catch(() => null),

          fetch(`${API_BASE_URL}/api/v1/orders/my`, {
            method: "GET",
            headers,
            credentials: "include",
          }).catch(() => null),

          fetch(`${API_BASE_URL}/api/v1/reservations`, {
            method: "GET",
            headers,
            credentials: "include",
          }).catch(() => null),

          fetch(`${API_BASE_URL}/api/v1/favorites`, {
            method: "GET",
            headers,
            credentials: "include",
          }).catch(() => null),

          fetch(`${API_BASE_URL}/api/v1/menus?limit=100`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }).catch(() => null),
        ]);

      // 1. Process Profile & Loyalty Points
      let currentFullName = user?.name || "Diner";
      let currentEmail = user?.email || "";
      let currentPhone = user?.phone || "";
      let currentAvatar =
        user?.avatarUrl || (user as any)?.image || (user as any)?.avatar || "";
      let dbLoyaltyPoints = 0;

      if (profileRes && profileRes.ok) {
        const data = await profileRes.json();
        const userData = data.user || data.data || data;
        if (userData) {
          currentFullName =
            userData.fullName || userData.name || currentFullName;
          currentEmail = userData.email || currentEmail;
          currentPhone = userData.phone || currentPhone;
          currentAvatar =
            userData.avatarUrl || userData.image || currentAvatar;
          if (typeof userData.loyaltyPoints === "number") {
            dbLoyaltyPoints = userData.loyaltyPoints;
          }
        }
      }

      // 2. Process Live Database Orders
      let rawOrders: any[] = [];
      if (ordersRes && ordersRes.ok) {
        const apiData = await ordersRes.json();
        rawOrders = apiData.data || apiData.orders || [];
      }

      const validOrders = rawOrders.filter((ord: any) => {
        const st = String(ord.status || "").toLowerCase();
        return !st.includes("cancel");
      });

      const totalValidOrders = validOrders.length;
      const activeOrders = validOrders.filter((ord: any) => {
        const st = String(ord.status || "").toLowerCase();
        return st !== "delivered" && st !== "completed";
      }).length;

      // 3. Process Live Reservations
      let rawReservations: any[] = [];
      if (resApi && resApi.ok) {
        const apiData = await resApi.json();
        rawReservations =
          apiData.reservations || apiData.data || apiData || [];
      }

      const activeBookings = rawReservations.filter((r: any) => {
        const st = String(r.status || "").toLowerCase();
        return st === "confirmed" || st === "upcoming" || st === "pending";
      }).length;

      // 4. Read User's Favorited/Saved Items Map
      const userFavoriteMap = new Map<string, { isFavorite: boolean; isSaved: boolean }>();
      if (favoritesRes && favoritesRes.ok) {
        const favsData = await favoritesRes.json();
        const rawFavorites =
          favsData.data || favsData.menus || favsData.favorites || [];
        if (Array.isArray(rawFavorites)) {
          rawFavorites.forEach((item: any) => {
            const mId = String(item.id || item.menuItemId || item._id);
            userFavoriteMap.set(mId, {
              isFavorite: Boolean(item.isFavorite),
              isSaved: Boolean(item.isSaved),
            });
          });
        }
      }

      // 5. Build Unified Menu Catalog
      let catalogList: any[] = [];
      if (catalogRes && catalogRes.ok) {
        const catData = await catalogRes.json();
        catalogList = catData.data || catData.menus || catData.items || [];
      }

      // If catalog endpoint returns items, merge with user flags.
      // If catalog endpoint is empty, fallback to the user's saved items.
      let normalizedMenus: DatabaseMenu[] = [];

      if (Array.isArray(catalogList) && catalogList.length > 0) {
        normalizedMenus = catalogList.map((item: any) => {
          const mId = String(item.id || item._id);
          const userStatus = userFavoriteMap.get(mId);
          return {
            id: mId,
            name: item.menuName || item.name || "Delicious Dish",
            restaurantName:
              item.restaurantName || item.restaurant?.name || "Partner Restaurant",
            restaurantId: String(item.restaurantId || item.restaurant?.id || ""),
            price: Number(item.price || 0),
            description: item.description || "",
            image:
              item.image ||
              item.imageUrl ||
              "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
            imageAlt: item.imageAlt || item.menuName || item.name || "Dish",
            cuisineCategory: item.cuisineCategory || item.category || "all",
            rating: Number(item.rating || 4.8),
            isSaved: userStatus ? userStatus.isSaved : false,
            isFavorite: userStatus ? userStatus.isFavorite : false,
          };
        });
      } else if (userFavoriteMap.size > 0) {
        // Fallback to favorite items list if general catalog returned nothing
        if (favoritesRes && favoritesRes.ok) {
          const favsData = await favoritesRes.json();
          const rawFavorites =
            favsData.data || favsData.menus || favsData.favorites || [];
          normalizedMenus = rawFavorites.map((item: any) => ({
            id: String(item.id || item._id),
            name: item.name || "Delicious Dish",
            restaurantName: item.restaurantName || "Partner Restaurant",
            restaurantId: String(item.restaurantId || ""),
            price: Number(item.price || 0),
            description: item.description || "",
            image: item.image || "",
            imageAlt: item.imageAlt || item.name || "Dish",
            cuisineCategory: item.cuisineCategory || "all",
            rating: Number(item.rating || 5),
            isSaved: Boolean(item.isSaved),
            isFavorite: Boolean(item.isFavorite),
          }));
        }
      }

      const calculatedLoyalty =
        dbLoyaltyPoints > 0 ? dbLoyaltyPoints : totalValidOrders * 20;

      setAllMenus(normalizedMenus);
      setTotalOrdersCount(totalValidOrders);
      setActiveOrdersCount(activeOrders);
      setActiveBookingsCount(activeBookings);
      setPoints(calculatedLoyalty);

      setProfile({
        ...EMPTY_PROFILE,
        fullName: currentFullName,
        email: currentEmail,
        phone: currentPhone,
        avatarUrl: currentAvatar,
        stats: {
          totalOrders: totalValidOrders,
          activeBookings,
          savedSpots: Array.from(userFavoriteMap.values()).filter(
            (v) => v.isFavorite || v.isSaved
          ).length,
          loyaltyPoints: calculatedLoyalty,
        },
      });
    } catch (err) {
      console.error("Failed to sync customer menus & telemetry:", err);
    } finally {
      setIsLoaded(true);
    }
  }, [user, authContextToken]);

  useEffect(() => {
    syncDatabaseData();

    const handleSync = () => syncDatabaseData();
    window.addEventListener("profile-updated", handleSync);
    window.addEventListener("booking-updated", handleSync);
    window.addEventListener("order-updated", handleSync);

    return () => {
      window.removeEventListener("profile-updated", handleSync);
      window.removeEventListener("booking-updated", handleSync);
      window.removeEventListener("order-updated", handleSync);
    };
  }, [syncDatabaseData]);

  const handleToggleSave = async (
    menuId: string,
    menuName: string,
    currentStatus: boolean
  ) => {
    const nextStatus = !currentStatus;
    setAllMenus((prev) =>
      prev.map((m) => (m.id === menuId ? { ...m, isSaved: nextStatus } : m))
    );

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/favorites/save/${menuId}`, {
        method: nextStatus ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (!res.ok) {
        setAllMenus((prev) =>
          prev.map((m) => (m.id === menuId ? { ...m, isSaved: currentStatus } : m))
        );
        toast.error("Failed to update saved item.");
      } else {
        toast.success(
          nextStatus
            ? `Added "${menuName}" to Saved Menus.`
            : `Removed "${menuName}" from Saved Menus.`
        );
      }
    } catch (e) {
      setAllMenus((prev) =>
        prev.map((m) => (m.id === menuId ? { ...m, isSaved: currentStatus } : m))
      );
      toast.error("Network error updating saved menu.");
    }
  };

  const handleToggleFavorite = async (
    menuId: string,
    menuName: string,
    currentStatus: boolean
  ) => {
    const nextStatus = !currentStatus;
    setAllMenus((prev) =>
      prev.map((m) => (m.id === menuId ? { ...m, isFavorite: nextStatus } : m))
    );

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/favorites/${menuId}`, {
        method: nextStatus ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (!res.ok) {
        setAllMenus((prev) =>
          prev.map((m) =>
            m.id === menuId ? { ...m, isFavorite: currentStatus } : m
          )
        );
        toast.error("Failed to update favorite item.");
      } else {
        toast.success(
          nextStatus
            ? `Added "${menuName}" to Favorites.`
            : `Removed "${menuName}" from Favorites.`
        );
      }
    } catch (e) {
      setAllMenus((prev) =>
        prev.map((m) =>
          m.id === menuId ? { ...m, isFavorite: currentStatus } : m
        )
      );
      toast.error("Network error updating favorite.");
    }
  };

  const handleAddToCart = (menu: DatabaseMenu) => {
    setAddingDishId(menu.id);

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
      openDrawer();
      toast.success(`Dispatched ${menu.name} ($${menu.price}) to cart.`);
    } catch (e) {
      toast.error("Could not add item to cart.");
    } finally {
      setTimeout(() => setAddingDishId(null), 1200);
    }
  };

  const filteredMenus = useMemo(() => {
    return allMenus.filter((menu) => {
      if (activeTab === "saved" && !menu.isSaved) return false;
      if (activeTab === "favorites" && !menu.isFavorite) return false;
      if (cuisineFilter !== "all" && menu.cuisineCategory !== cuisineFilter)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text =
          `${menu.name} ${menu.restaurantName} ${menu.description}`.toLowerCase();
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

  const savedCount = useMemo(
    () => allMenus.filter((m) => m.isSaved).length,
    [allMenus]
  );
  const favoriteCount = useMemo(
    () => allMenus.filter((m) => m.isFavorite).length,
    [allMenus]
  );

  if (!isLoaded) {
    return (
      <div className="bg-[#f8f9f6] min-h-screen text-[#1b3b2b] flex flex-col antialiased">
        <CustomerHeader
          userName={realUserName}
          userRole={profile.roleBadge}
          avatarUrl={profile.avatarUrl}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <div className="flex pt-20 flex-1">
          <CustomerSidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            onToggle={toggleSidebar}
            loyaltyPoints={points}
            activeOrdersCount={totalOrdersCount}
            activeOrderCount={activeOrdersCount}
            upcomingReservationsCount={activeBookingsCount}
          />
          <main
            className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"
              }`}
          >
            <DashboardLoader />
          </main>
        </div>
      </div>
    );
  }

  const cleanFirstName = profile.fullName.split(" ")[0] || "Diner";

  return (
    <div className="bg-[#f8f9f6] font-body-md text-[#1b3b2b] antialiased min-h-screen selection:bg-[#1b3b2b] selection:text-white">
      <CustomerHeader
        userName={realUserName}
        userRole={profile.roleBadge}
        avatarUrl={profile.avatarUrl}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <CustomerSidebar
        userName={cleanFirstName}
        memberSince={profile.memberSince}
        avatarUrl={profile.avatarUrl}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
        activeOrderCount={activeOrdersCount}
        activeOrdersCount={totalOrdersCount}
        upcomingReservationsCount={activeBookingsCount}
        loyaltyPoints={points}
      />

      <div
        className={`transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"
          }`}
      >
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
                    Welcome back, {cleanFirstName}
                  </h1>
                  <p className="text-xs font-medium text-[#1b3b2b]/70 mt-0.5">
                    {realUserEmail} {profile.phone && `• ${profile.phone}`}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">
                      Saved Menus
                    </span>
                    <span className="font-heading font-black text-xl text-[#1b3b2b] mt-0.5 block">
                      {savedCount}
                    </span>
                  </div>
                  <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">
                      Favorites
                    </span>
                    <span className="font-heading font-black text-xl text-[#C05621] mt-0.5 block">
                      {favoriteCount}
                    </span>
                  </div>
                  <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">
                      Loyalty Pts
                    </span>
                    <span className="font-heading font-black text-xl text-[#C05621] mt-0.5 block">
                      {points.toLocaleString()}
                    </span>
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
                      Browse and manage your curated culinary selections
                      synchronized from live database inventories (
                      {allMenus.length} total available).
                    </p>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-2 self-start md:self-auto bg-white/80 p-1.5 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                    <button
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === "all"
                          ? "bg-[#1b3b2b] text-white shadow-md"
                          : "text-[#1b3b2b]/70 hover:text-[#1b3b2b]"
                        }`}
                      onClick={() => {
                        setActiveTab("all");
                        setCurrentPage(1);
                      }}
                      type="button"
                    >
                      All ({allMenus.length})
                    </button>
                    <button
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === "saved"
                          ? "bg-[#1b3b2b] text-white shadow-md"
                          : "text-[#1b3b2b]/70 hover:text-[#1b3b2b]"
                        }`}
                      onClick={() => {
                        setActiveTab("saved");
                        setCurrentPage(1);
                      }}
                      type="button"
                    >
                      Saved Menus ({savedCount})
                    </button>
                    <button
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === "favorites"
                          ? "bg-[#1b3b2b] text-white shadow-md"
                          : "text-[#1b3b2b]/70 hover:text-[#1b3b2b]"
                        }`}
                      onClick={() => {
                        setActiveTab("favorites");
                        setCurrentPage(1);
                      }}
                      type="button"
                    >
                      Favorites ({favoriteCount})
                    </button>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10">
                  <div className="lg:col-span-8 relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1b3b2b]/50 text-lg">
                      search
                    </span>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-white/90 text-[#1b3b2b] text-xs font-medium rounded-2xl placeholder:text-[#1b3b2b]/50 shadow-sm border border-[#1b3b2b]/15 focus:outline-none focus:border-[#1b3b2b] transition-all"
                      placeholder="Search database menus..."
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>

                  <div className="lg:col-span-4 relative">
                    <select
                      className="w-full appearance-none pl-4 pr-10 py-3 bg-white/90 text-xs font-bold text-[#1b3b2b] rounded-2xl shadow-sm border border-[#1b3b2b]/15 focus:outline-none focus:border-[#1b3b2b] cursor-pointer"
                      value={cuisineFilter}
                      onChange={(e) => {
                        setCuisineFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="all">All Cuisines (Global)</option>
                      <option value="italian">Italian &amp; Pizza</option>
                      <option value="burger">Burgers &amp; Grills</option>
                      <option value="sushi">Japanese &amp; Sushi</option>
                      <option value="desi">Desi &amp; Traditional</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1b3b2b]/50 pointer-events-none text-base">
                      expand_more
                    </span>
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
                                  (
                                    e.currentTarget as HTMLImageElement
                                  ).src =
                                    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80";
                                }}
                              />

                              <div className="absolute top-3 right-3 flex items-center gap-2">
                                <button
                                  aria-label="Save Menu"
                                  className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-transform shadow-md cursor-pointer border ${menu.isSaved
                                      ? "bg-[#1b3b2b] text-white border-[#1b3b2b]"
                                      : "bg-white/90 text-[#1b3b2b] border-[#1b3b2b]/15"
                                    }`}
                                  onClick={() =>
                                    handleToggleSave(
                                      menu.id,
                                      menu.name,
                                      Boolean(menu.isSaved)
                                    )
                                  }
                                  type="button"
                                  title="Save Menu"
                                >
                                  <span
                                    className="material-symbols-outlined text-base"
                                    style={{
                                      fontVariationSettings: menu.isSaved
                                        ? "'FILL' 1"
                                        : "'FILL' 0",
                                    }}
                                  >
                                    bookmark
                                  </span>
                                </button>

                                <button
                                  aria-label="Favorite Menu"
                                  className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-transform shadow-md cursor-pointer border ${menu.isFavorite
                                      ? "bg-red-600 text-white border-red-600"
                                      : "bg-white/90 text-red-600 border-[#1b3b2b]/15"
                                    }`}
                                  onClick={() =>
                                    handleToggleFavorite(
                                      menu.id,
                                      menu.name,
                                      Boolean(menu.isFavorite)
                                    )
                                  }
                                  type="button"
                                  title="Favorite Menu"
                                >
                                  <span
                                    className="material-symbols-outlined text-base"
                                    style={{
                                      fontVariationSettings: menu.isFavorite
                                        ? "'FILL' 1"
                                        : "'FILL' 0",
                                    }}
                                  >
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
                              className={`w-full py-2.5 px-4 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${isAdding
                                  ? "bg-[#1b3b2b] text-white scale-98"
                                  : "bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white"
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
                    <span className="material-symbols-outlined text-5xl text-[#1b3b2b]/30 mb-3">
                      restaurant_menu
                    </span>
                    <h3 className="font-heading font-black text-xl text-[#1b3b2b]">
                      No Menus Found
                    </h3>
                    <p className="text-xs font-medium text-[#1b3b2b]/70 max-w-md mt-1">
                      {activeTab === "saved"
                        ? "You haven't saved any items yet. Click the bookmark icon on any dish to save it."
                        : activeTab === "favorites"
                          ? "You haven't favorited any items yet. Click the heart icon on any dish to favorite it."
                          : "No matching records found for this category or filter."}
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
                      Page {currentPage} of {totalPages} ({filteredMenus.length}{" "}
                      Menus)
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
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