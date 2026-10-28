"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import ReviewCard from "@/components/customer/reviews/ReviewCard";
import ReviewFilters from "@/components/customer/reviews/ReviewFilters";
import EditReviewModal from "@/components/customer/reviews/EditReviewModal";
import DeleteReviewModal from "@/components/customer/reviews/DeleteReviewModal";
import DashboardLoader from "@/components/ui/DashboardLoader";

import {
  CustomerReview,
  ReviewFilterType,
  ReviewSortType,
} from "@/types/customerReview";
import { CustomerProfileData } from "@/types/customerProfile";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

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

export default function CustomerReviewsPage() {
  const { user } = useAuth();
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle(
    "dinedesk_customer_sidebar"
  );

  const [profile, setProfile] = useState<CustomerProfileData>(EMPTY_PROFILE);
  const [savedSpotsCount, setSavedSpotsCount] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);

  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [activeFilter, setActiveFilter] = useState<ReviewFilterType>("all");
  const [sortBy, setSortBy] = useState<ReviewSortType>("recent");
  const [isLoaded, setIsLoaded] = useState(false);

  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [deletingReview, setDeletingReview] = useState<CustomerReview | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const realUserName = user?.name || profile.fullName || "Diner";
  const realUserEmail = user?.email || profile.email || "";

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3200);
  };

  const syncDatabaseData = useCallback(async () => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const [profileRes, ordersRes, resApi, favsRes, reviewsRes] =
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

          fetch(`${API_BASE_URL}/api/v1/reviews/my`, {
            method: "GET",
            headers,
            credentials: "include",
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

      // 4. Process Live Favorites (Robust key fallback matching backend)
      let liveFavoritesCount = 0;
      if (favsRes && favsRes.ok) {
        const favsData = await favsRes.json();
        const favList =
          favsData.data || favsData.menus || favsData.favorites || [];
        liveFavoritesCount = Array.isArray(favList) ? favList.length : 0;
      }

      // 5. Process Live Reviews
      if (reviewsRes && reviewsRes.ok) {
        const revData = await reviewsRes.json();
        const rawReviews = revData.data || revData.reviews || revData || [];
        if (Array.isArray(rawReviews)) {
          setReviews(
            rawReviews.map(
              (item: any) =>
              ({
                id: String(item.id || item._id),
                restaurantId: String(
                  item.restaurantId || item.restaurant?.id || ""
                ),
                restaurantName:
                  item.restaurantName ||
                  item.restaurant?.name ||
                  "Restaurant",
                restaurantImage:
                  item.restaurantImage ||
                  item.restaurant?.coverUrl ||
                  item.restaurant?.image ||
                  "",
                neighborhood:
                  item.neighborhood ||
                  item.restaurant?.neighborhood ||
                  item.restaurant?.address ||
                  "",
                rating: Number(item.rating || 5),
                comment: item.comment || item.reviewText || "",
                photos: item.photos || [],
                date:
                  item.date ||
                  item.visitDate ||
                  item.createdAt ||
                  new Date().toLocaleDateString(),
                visitDate:
                  item.visitDate ||
                  item.createdAt ||
                  new Date().toISOString(),
                timestamp:
                  item.timestamp ||
                  new Date(item.createdAt || Date.now()).getTime(),
                helpfulVotes: Number(
                  item.helpfulVotes || item.helpfulCount || 0
                ),
                hasUpvoted: Boolean(item.hasUpvoted),
                orderItems: item.orderItems || [],
                ...(item || {}),
              } as CustomerReview)
            )
          );
        }
      }

      const calculatedLoyalty =
        dbLoyaltyPoints > 0 ? dbLoyaltyPoints : totalValidOrders * 20;

      setProfile({
        ...EMPTY_PROFILE,
        fullName: currentFullName,
        email: currentEmail,
        phone: currentPhone,
        avatarUrl: currentAvatar,
        stats: {
          totalOrders: totalValidOrders,
          activeBookings,
          savedSpots: liveFavoritesCount,
          loyaltyPoints: calculatedLoyalty,
        },
      });

      setTotalOrdersCount(totalValidOrders);
      setActiveOrdersCount(activeOrders);
      setActiveBookingsCount(activeBookings);
      setSavedSpotsCount(liveFavoritesCount);
      setLoyaltyPoints(calculatedLoyalty);
    } catch (err) {
      console.error("Failed to sync customer reviews & telemetry:", err);
    } finally {
      setIsLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    syncDatabaseData();

    const handleSync = () => syncDatabaseData();
    window.addEventListener("profile-updated", handleSync);
    window.addEventListener("booking-updated", handleSync);
    window.addEventListener("order-updated", handleSync);
    window.addEventListener("dinedesk-points-updated", handleSync);

    return () => {
      window.removeEventListener("profile-updated", handleSync);
      window.removeEventListener("booking-updated", handleSync);
      window.removeEventListener("order-updated", handleSync);
      window.removeEventListener("dinedesk-points-updated", handleSync);
    };
  }, [syncDatabaseData]);

  const counts = useMemo(() => {
    const all = reviews.length;
    const fiveStar = reviews.filter((r) => Math.round(r.rating) === 5).length;
    const fourStar = reviews.filter((r) => Math.round(r.rating) === 4).length;
    const withPhotos = reviews.filter((r) => r.photos && r.photos.length > 0).length;
    return { all, fiveStar, fourStar, withPhotos };
  }, [reviews]);

  const totalHelpfulUpvotes = useMemo(() => {
    return reviews.reduce((sum, r) => sum + (r.helpfulVotes || 0), 0);
  }, [reviews]);

  const displayedReviews = useMemo(() => {
    let list = [...reviews];

    if (activeFilter === "5-star") {
      list = list.filter((r) => Math.round(r.rating) === 5);
    } else if (activeFilter === "4-star") {
      list = list.filter((r) => Math.round(r.rating) === 4);
    } else if (activeFilter === "with-photos") {
      list = list.filter((r) => r.photos && r.photos.length > 0);
    }

    if (sortBy === "recent") {
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } else if (sortBy === "highest-rated") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "most-helpful") {
      list.sort((a, b) => (b.helpfulVotes || 0) - (a.helpfulVotes || 0));
    }

    return list;
  }, [reviews, activeFilter, sortBy]);

  const handleSaveEdit = async (updatedReview: CustomerReview) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/reviews/${updatedReview.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updatedReview),
        credentials: "include",
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === updatedReview.id ? { ...r, ...updatedReview } : r))
        );
        setEditingReview(null);
        showToast(`Your review for ${updatedReview.restaurantName} was updated successfully.`);
      } else {
        showToast("Failed to update review in database.");
      }
    } catch (err) {
      showToast("Network error while updating review.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingReview) return;
    const restName = deletingReview.restaurantName;
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/reviews/${deletingReview.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== deletingReview.id));
        setDeletingReview(null);
        setEditingReview(null);
        showToast(`Review for ${restName} was removed.`);
      } else {
        showToast("Failed to delete review from database.");
      }
    } catch (err) {
      showToast("Network error while deleting review.");
    }
  };

  const handleToggleUpvote = async (reviewId: string) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/reviews/${reviewId}/helpful`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => {
            if (r.id === reviewId) {
              const hasUpvoted = !r.hasUpvoted;
              const helpfulVotes = hasUpvoted
                ? (r.helpfulVotes || 0) + 1
                : Math.max(0, (r.helpfulVotes || 0) - 1);
              return { ...r, hasUpvoted, helpfulVotes };
            }
            return r;
          })
        );
      }
    } catch (err) {
      // Silently fail on network toggle
    }
  };

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
            loyaltyPoints={loyaltyPoints}
            upcomingReservationsCount={activeBookingsCount}
            activeOrdersCount={totalOrdersCount}
            activeOrderCount={activeOrdersCount}
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
    <div className="bg-[#f8f9f6] min-h-screen text-[#1b3b2b] flex flex-col font-body-md antialiased selection:bg-[#1b3b2b] selection:text-white relative">
      <CustomerHeader
        userName={realUserName}
        userRole={profile.roleBadge}
        avatarUrl={profile.avatarUrl}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex pt-20 flex-1">
        <CustomerSidebar
          userName={cleanFirstName}
          memberSince={profile.memberSince || "Member since 2026"}
          avatarUrl={profile.avatarUrl}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
          activeOrderCount={activeOrdersCount}
          activeOrdersCount={totalOrdersCount}
          upcomingReservationsCount={activeBookingsCount}
          loyaltyPoints={loyaltyPoints}
        />

        <main
          className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"
            }`}
        >
          {/* Top Quick Stats Banner */}
          <section className="w-full px-6 sm:px-10 py-6 bg-gradient-to-r from-white via-[#f8f9f6] to-white border-b border-[#1b3b2b]/10 shadow-xs">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div>
                <h1 className="font-heading font-extrabold text-xl text-[#1b3b2b]">
                  Welcome back, {cleanFirstName}
                </h1>
                <p className="text-xs font-medium text-[#1b3b2b]/70 mt-0.5">
                  {realUserEmail} {profile.phone && `• ${profile.phone}`}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">
                    Total Orders
                  </span>
                  <span className="font-heading font-black text-xl text-[#1b3b2b] mt-0.5 block">
                    {totalOrdersCount}
                  </span>
                </div>
                <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">
                    Bookings
                  </span>
                  <span className="font-heading font-black text-xl text-[#C05621] mt-0.5 block">
                    {activeBookingsCount}
                  </span>
                </div>
                <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">
                    Saved Spots
                  </span>
                  <span className="font-heading font-black text-xl text-[#1b3b2b] mt-0.5 block">
                    {savedSpotsCount}
                  </span>
                </div>
                <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">
                    Loyalty Pts
                  </span>
                  <span className="font-heading font-black text-xl text-[#C05621] mt-0.5 block">
                    {loyaltyPoints.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Main Content Area */}
          <div className="w-full px-6 sm:px-10 py-10 max-w-7xl mx-auto flex-1 flex flex-col gap-8">
            <div className="flex flex-col w-full">
              {/* Header Title & Metrics */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#1b3b2b] tracking-tight">
                    My Reviews
                  </h1>
                  <p className="text-xs font-medium text-[#1b3b2b]/70 mt-1 max-w-xl">
                    Manage and view all your verified reviews for culinary destinations.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                    <span
                      className="material-symbols-outlined text-[#1b3b2b] text-lg"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      rate_review
                    </span>
                    <span className="text-xs font-extrabold text-[#1b3b2b]">
                      {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                    <span className="material-symbols-outlined text-[#C05621] text-lg">
                      thumb_up
                    </span>
                    <span className="text-xs font-extrabold text-[#C05621]">
                      {totalHelpfulUpvotes} Helpful
                    </span>
                  </div>
                </div>
              </div>

              {/* Filters & Sorting */}
              <ReviewFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                counts={counts}
              />

              {/* Reviews List */}
              {displayedReviews.length > 0 ? (
                <div className="flex flex-col gap-6 mb-10">
                  {displayedReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onEdit={(rev) => setEditingReview(rev)}
                      onRemove={(rev) => setDeletingReview(rev)}
                      onToggleUpvote={handleToggleUpvote}
                    />
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-12 text-center border border-[#1b3b2b]/15 shadow-xl my-6 flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-[#1b3b2b]/40 mb-3">
                    filter_alt_off
                  </span>
                  <h3 className="font-heading font-extrabold text-base text-[#1b3b2b]">
                    No reviews in this category
                  </h3>
                  <p className="text-xs font-medium text-[#1b3b2b]/70 mt-1">
                    Try selecting a different filter above.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("all")}
                    className="mt-5 px-5 py-2.5 bg-[#1b3b2b] text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider hover:bg-[#1b3b2b]/90 transition-all shadow-md cursor-pointer"
                  >
                    Show All Reviews
                  </button>
                </div>
              ) : (
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-16 text-center border border-[#1b3b2b]/15 shadow-xl my-6 flex flex-col items-center">
                  <span className="material-symbols-outlined text-5xl text-[#1b3b2b]/30 mb-4">
                    rate_review
                  </span>
                  <h3 className="font-heading font-black text-xl text-[#1b3b2b]">
                    No reviews written yet
                  </h3>
                  <p className="text-xs font-medium text-[#1b3b2b]/70 mt-2 max-w-sm leading-relaxed">
                    Leave reviews on restaurants and dishes you have ordered from to help fellow foodies in the community.
                  </p>
                  <Link
                    href="/explore"
                    className="mt-6 px-6 py-3 bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg"
                  >
                    Browse Restaurants
                  </Link>
                </div>
              )}
            </div>
          </div>

          <CustomerFooter />
        </main>
      </div>

      <EditReviewModal
        isOpen={Boolean(editingReview)}
        review={editingReview}
        onClose={() => setEditingReview(null)}
        onSave={handleSaveEdit}
        onDeleteRequest={(rev) => {
          setEditingReview(null);
          setDeletingReview(rev);
        }}
      />

      <DeleteReviewModal
        isOpen={Boolean(deletingReview)}
        review={deletingReview}
        onCancel={() => setDeletingReview(null)}
        onConfirm={handleConfirmDelete}
      />

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-50 bg-[#1b3b2b] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 text-xs font-extrabold tracking-wide"
          >
            <span className="material-symbols-outlined text-amber-400 text-lg">
              check_circle
            </span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}