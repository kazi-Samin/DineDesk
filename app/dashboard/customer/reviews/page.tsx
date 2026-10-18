"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import ReviewCard from "@/components/customer/reviews/ReviewCard";
import ReviewFilters from "@/components/customer/reviews/ReviewFilters";
import EditReviewModal from "@/components/customer/reviews/EditReviewModal";
import DeleteReviewModal from "@/components/customer/reviews/DeleteReviewModal";

import {
  CustomerReview,
  ReviewFilterType,
  ReviewSortType,
} from "@/types/customerReview";
import {
  getCustomerReviews,
  updateCustomerReview,
  deleteCustomerReview,
  toggleHelpfulVote,
} from "@/services/mockCustomerReviewService";
import { getCustomerProfile } from "@/services/mockCustomerProfileService";
import { INITIAL_CUSTOMER_PROFILE } from "@/data/mockCustomerProfile";
import { getSavedRestaurants, getSavedDishes } from "@/services/mockCustomerFavoritesService";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";

export default function CustomerReviewsPage() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_customer_sidebar");
  const [profile, setProfile] = useState(INITIAL_CUSTOMER_PROFILE);
  const [savedSpotsCount, setSavedSpotsCount] = useState(14);

  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [activeFilter, setActiveFilter] = useState<ReviewFilterType>("all");
  const [sortBy, setSortBy] = useState<ReviewSortType>("recent");

  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [deletingReview, setDeletingReview] = useState<CustomerReview | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 2800);
  };

  useEffect(() => {
    const loadedProfile = getCustomerProfile();
    const loadedReviews = getCustomerReviews();
    const savedRest = getSavedRestaurants();
    const savedDish = getSavedDishes();

    setProfile(loadedProfile);
    setReviews(loadedReviews);
    setSavedSpotsCount(savedRest.length + savedDish.length || 14);
  }, []);

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

  const handleSaveEdit = (updatedReview: CustomerReview) => {
    const updated = updateCustomerReview(reviews, updatedReview);
    setReviews(updated);
    setEditingReview(null);
    showToast(`Your review for ${updatedReview.restaurantName} was updated.`);
  };

  const handleConfirmDelete = () => {
    if (!deletingReview) return;
    const restName = deletingReview.restaurantName;
    const updated = deleteCustomerReview(reviews, deletingReview.id);
    setReviews(updated);
    setDeletingReview(null);
    setEditingReview(null);
    showToast(`Review for ${restName} was deleted.`);
  };

  const handleToggleUpvote = (reviewId: string) => {
    const updated = toggleHelpfulVote(reviews, reviewId);
    setReviews(updated);
  };

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md antialiased">
      <CustomerHeader
        userName={profile.fullName || "Tahmid Rahman"}
        userRole="Verified Foodie"
        avatarUrl={profile.avatarUrl}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex pt-16 flex-1">
        <CustomerSidebar
          userName={`${profile.fullName.split(" ")[0]}'s Account`}
          memberSince={profile.memberSince || "Member since 2023"}
          avatarUrl={profile.avatarUrl}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
          activeOrderCount={profile.stats?.activeBookings ?? 1}
          loyaltyPoints={profile.stats?.loyaltyPoints ?? 1450}
        />

        <main className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "pl-0"}`}>
          {/* Top Quick Stats */}
          <section className="w-full px-6 py-5 bg-surface-container-low border-b border-outline-variant">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-on-surface">
                  Welcome back, {profile.fullName.split(" ")[0] || "Tahmid"}
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {profile.email} • {profile.phone}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-surface-container-lowest px-4 py-2.5 rounded-lg border border-outline-variant shadow-2xs">
                  <span className="text-[11px] font-medium text-on-surface-variant block uppercase tracking-wider">
                    Total Orders
                  </span>
                  <span className="text-lg font-bold text-primary mt-0.5 block">
                    {profile.stats?.totalOrders ?? 28}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-4 py-2.5 rounded-lg border border-outline-variant shadow-2xs">
                  <span className="text-[11px] font-medium text-on-surface-variant block uppercase tracking-wider">
                    Bookings
                  </span>
                  <span className="text-lg font-bold text-secondary mt-0.5 block">
                    {profile.stats?.activeBookings ?? 1}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-4 py-2.5 rounded-lg border border-outline-variant shadow-2xs">
                  <span className="text-[11px] font-medium text-on-surface-variant block uppercase tracking-wider">
                    Saved Spots
                  </span>
                  <span className="text-lg font-bold text-primary mt-0.5 block">
                    {savedSpotsCount}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-4 py-2.5 rounded-lg border border-outline-variant shadow-2xs">
                  <span className="text-[11px] font-medium text-on-surface-variant block uppercase tracking-wider">
                    Points
                  </span>
                  <span className="text-lg font-bold text-primary-container mt-0.5 block">
                    {profile.stats?.loyaltyPoints?.toLocaleString() ?? "1,450"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content Area */}
          <div className="w-full px-6 py-8 max-w-6xl mx-auto flex-1">
            <div className="flex flex-col w-full">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                    My Reviews
                  </h1>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Manage and view all your reviews for restaurants across Dhaka.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2 bg-surface-container-lowest px-3.5 py-2 rounded-lg border border-outline-variant shadow-2xs">
                    <span
                      className="material-symbols-outlined text-primary text-lg"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      rate_review
                    </span>
                    <span className="text-xs font-semibold text-primary">
                      {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-surface-container-lowest px-3.5 py-2 rounded-lg border border-outline-variant shadow-2xs">
                    <span className="material-symbols-outlined text-secondary text-lg">
                      thumb_up
                    </span>
                    <span className="text-xs font-semibold text-secondary">
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
                <div className="flex flex-col gap-4 mb-10">
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
                <div className="bg-surface-container-lowest rounded-2xl p-10 text-center border border-outline-variant/30 my-4 shadow-2xs flex flex-col items-center">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant/60 mb-2">
                    filter_alt_off
                  </span>
                  <h3 className="text-base font-semibold text-primary">
                    No reviews in this category
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Try selecting a different filter above.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("all")}
                    className="mt-4 px-4 py-2 bg-primary-container text-on-primary rounded-xl text-xs font-semibold hover:bg-primary transition-colors cursor-pointer"
                  >
                    Show All Reviews
                  </button>
                </div>
              ) : (
                <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-outline-variant/30 my-4 shadow-2xs flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/60 mb-3">
                    rate_review
                  </span>
                  <h3 className="text-lg font-bold text-primary">
                    No reviews written yet
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-1.5 max-w-sm">
                    Leave reviews on restaurants you have visited or ordered from to help other diners.
                  </p>
                  <Link
                    href="/explore"
                    className="mt-5 px-5 py-2.5 bg-primary-container text-on-primary rounded-xl text-xs font-semibold hover:bg-primary transition-colors"
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

      {toastMessage && (
        <div className="fixed bottom-10 right-8 z-50 bg-primary text-on-primary px-4 py-2.5 rounded-xl shadow-lg border border-outline-variant/30 flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-secondary-fixed text-base">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
