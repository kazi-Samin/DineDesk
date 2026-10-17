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

export default function CustomerReviewsPage() {
  // Sidebar responsive drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Profile data
  const [profile, setProfile] = useState(INITIAL_CUSTOMER_PROFILE);
  const [savedSpotsCount, setSavedSpotsCount] = useState(14);

  // Reviews state
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filter & sort states
  const [activeFilter, setActiveFilter] = useState<ReviewFilterType>("all");
  const [sortBy, setSortBy] = useState<ReviewSortType>("recent");

  // Modal states
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [deletingReview, setDeletingReview] = useState<CustomerReview | null>(null);

  // Cookie notice & TableMate AI state
  const [showCookieNotice, setShowCookieNotice] = useState(true);
  const [aiGreetingToast, setAiGreetingToast] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3000);
  };

  // Load reviews and profile on client mount
  useEffect(() => {
    const loadedProfile = getCustomerProfile();
    const loadedReviews = getCustomerReviews();
    const savedRest = getSavedRestaurants();
    const savedDish = getSavedDishes();

    setProfile(loadedProfile);
    setReviews(loadedReviews);
    setSavedSpotsCount(savedRest.length + savedDish.length || 14);
    setIsLoaded(true);
  }, []);

  // Derived counts for filters
  const counts = useMemo(() => {
    const all = reviews.length;
    const fiveStar = reviews.filter((r) => Math.round(r.rating) === 5).length;
    const fourStar = reviews.filter((r) => Math.round(r.rating) === 4).length;
    const withPhotos = reviews.filter((r) => r.photos && r.photos.length > 0).length;
    return { all, fiveStar, fourStar, withPhotos };
  }, [reviews]);

  // Derived total helpful upvotes
  const totalHelpfulUpvotes = useMemo(() => {
    return reviews.reduce((sum, r) => sum + (r.helpfulVotes || 0), 0);
  }, [reviews]);

  // Filtered and sorted reviews
  const displayedReviews = useMemo(() => {
    let list = [...reviews];

    // Filter
    if (activeFilter === "5-star") {
      list = list.filter((r) => Math.round(r.rating) === 5);
    } else if (activeFilter === "4-star") {
      list = list.filter((r) => Math.round(r.rating) === 4);
    } else if (activeFilter === "with-photos") {
      list = list.filter((r) => r.photos && r.photos.length > 0);
    }

    // Sort
    if (sortBy === "recent") {
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } else if (sortBy === "highest-rated") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "most-helpful") {
      list.sort((a, b) => (b.helpfulVotes || 0) - (a.helpfulVotes || 0));
    }

    return list;
  }, [reviews, activeFilter, sortBy]);

  // Handle Edit Save
  const handleSaveEdit = (updatedReview: CustomerReview) => {
    const updated = updateCustomerReview(reviews, updatedReview);
    setReviews(updated);
    setEditingReview(null);
    showToast(`Review for "${updatedReview.restaurantName}" updated successfully.`);
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = () => {
    if (!deletingReview) return;
    const restName = deletingReview.restaurantName;
    const updated = deleteCustomerReview(reviews, deletingReview.id);
    setReviews(updated);
    setDeletingReview(null);
    setEditingReview(null);
    showToast(`Review for "${restName}" removed.`);
  };

  // Handle Upvote Toggle
  const handleToggleUpvote = (reviewId: string) => {
    const updated = toggleHelpfulVote(reviews, reviewId);
    setReviews(updated);
  };

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md antialiased">
      {/* Customer Header */}
      <CustomerHeader
        userName={profile.fullName || "Tahmid Rahman"}
        userRole="Verified Foodie"
        avatarUrl={profile.avatarUrl}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex pt-16 flex-1">
        {/* Customer Sidebar */}
        <CustomerSidebar
          userName={`${profile.fullName.split(" ")[0]}'s Account`}
          memberSince="Patron since 2023"
          avatarUrl={profile.avatarUrl}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeOrderCount={1}
          loyaltyPoints={1450}
        />

        {/* Main Content Area */}
        <main className="pl-0 lg:pl-72 flex-1 flex flex-col min-h-screen w-full">
          {/* Customer Welcome & Patron Stats */}
          <section className="w-full px-space-xl py-space-lg bg-surface-container-low shadow-[0_1px_4px_rgba(0,0,0,0.02)] border-b border-outline-variant/30">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
              <div className="flex flex-col gap-1">
                <span className="font-display-mobile md:font-headline-lg text-headline-lg text-on-surface font-medium">
                  Welcome back, {profile.fullName.split(" ")[0] || "Tahmid"}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {profile.email} • {profile.phone}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block font-medium">
                    Total Orders
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    28
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block font-medium">
                    Active Bookings
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                    1
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block font-medium">
                    Saved Spots
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    {savedSpotsCount}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block font-medium">
                    Loyalty Points
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary-container font-bold">
                    1,450 pts
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Reviews Core Section */}
          <div className="w-full px-space-xl py-space-lg max-w-7xl mx-auto flex-1">
            <div className="flex flex-col w-full">
              {/* Header: Patron Chronicles & Counts */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-space-sm">
                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold">
                      Patron Chronicles
                    </span>
                    <span className="text-on-surface-variant/40">•</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      Verified Submissions
                    </span>
                  </div>
                  <h1 className="font-display text-display text-primary tracking-tight font-medium">
                    My Reviews & Dining Chronicles
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-2xl">
                    Reflecting your personal tasting notes, ambient assessments, and culinary bookmarks across Bangladesh.
                  </p>
                </div>

                <div className="flex items-center gap-space-md shrink-0">
                  <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-2 rounded-xl border border-outline-variant/20 shadow-xs">
                    <span
                      className="material-symbols-outlined text-primary text-xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      rate_review
                    </span>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-body-lg text-primary leading-none font-bold">
                        {reviews.length}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Verified Reviews
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-2 rounded-xl border border-outline-variant/20 shadow-xs">
                    <span className="material-symbols-outlined text-secondary text-xl">
                      thumb_up
                    </span>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-body-lg text-secondary leading-none font-bold">
                        {totalHelpfulUpvotes}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Helpful Upvotes
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Filters & Sorting Bar */}
              <ReviewFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                counts={counts}
              />

              {/* Reviews List */}
              {displayedReviews.length > 0 ? (
                <div className="grid grid-cols-1 gap-space-lg mb-space-xl">
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
                /* Filter Empty State */
                <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/30 my-6 shadow-xs flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-space-md">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                      filter_alt_off
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-primary font-medium">
                    No Reviews Match This Filter
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-md">
                    You don&apos;t have any reviews under the{" "}
                    <strong>{activeFilter.replace("-", " ")}</strong> category.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("all")}
                    className="mt-space-lg px-space-lg py-2.5 bg-primary-container text-on-primary rounded-xl font-label-md text-label-md shadow-sm hover:bg-primary transition-colors font-semibold cursor-pointer"
                  >
                    View All Reviews
                  </button>
                </div>
              ) : (
                /* Total Empty State */
                <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/30 my-6 shadow-xs flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-space-md">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                      rate_review
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-primary font-medium">
                    No Dining Reviews Yet
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-md">
                    Share your genuine critiques and photos of kitchens you have visited or ordered from across Dhaka.
                  </p>
                  <Link
                    href="/explore"
                    className="mt-space-lg px-space-lg py-2.5 bg-primary-container text-on-primary rounded-xl font-label-md text-label-md shadow-sm hover:bg-primary transition-colors font-semibold"
                  >
                    Explore Restaurants
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Customer Footer */}
          <CustomerFooter />
        </main>
      </div>

      {/* Edit Review Modal */}
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

      {/* Delete Confirmation Modal */}
      <DeleteReviewModal
        isOpen={Boolean(deletingReview)}
        review={deletingReview}
        onCancel={() => setDeletingReview(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Floating Minimal Cookie Notice */}
      {showCookieNotice && (
        <div className="fixed bottom-space-lg left-space-lg z-50 max-w-sm bg-surface-container-lowest p-space-md rounded-xl shadow-[0_4px_20px_rgba(30,27,22,0.08)] flex items-start gap-space-md border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-secondary text-xl shrink-0 mt-0.5">
            cookie
          </span>
          <div className="flex-1">
            <p className="font-body-sm text-body-sm text-on-surface leading-snug">
              We use minimal cookies to refine your culinary suggestions and secure table holds.
            </p>
            <div className="flex items-center gap-space-md mt-space-sm">
              <button
                type="button"
                onClick={() => setShowCookieNotice(false)}
                className="font-label-sm text-label-sm px-space-md py-1 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors font-medium cursor-pointer"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => setShowCookieNotice(false)}
                className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating TableMate AI Concierge Button */}
      <div className="fixed bottom-space-lg right-space-lg z-50 flex flex-col items-end gap-2">
        {aiGreetingToast && (
          <div className="bg-surface-container-lowest border border-outline-variant/30 text-on-surface px-4 py-2.5 rounded-xl shadow-xl font-body-sm text-xs max-w-xs animate-in fade-in slide-in-from-bottom-2">
            <p className="font-semibold text-primary">TableMate AI Concierge</p>
            <p className="text-on-surface-variant mt-0.5">
              I can summarize your dining sentiments or draft your next restaurant critique!
            </p>
          </div>
        )}
        <button
          aria-label="TableMate AI Concierge"
          type="button"
          onClick={() => setAiGreetingToast(!aiGreetingToast)}
          className="flex items-center gap-space-sm px-space-lg py-3 bg-primary-container text-on-primary rounded-full shadow-[0_4px_16px_rgba(31,61,43,0.25)] hover:bg-primary transition-all cursor-pointer font-label-lg text-label-lg font-semibold"
        >
          <span className="material-symbols-outlined text-xl">smart_toy</span>
          <span>TableMate AI</span>
        </button>
      </div>

      {/* Floating Action Feedback Toast */}
      {toastMessage && (
        <div
          className="fixed bottom-24 right-10 z-50 bg-primary text-on-primary px-space-lg py-space-sm rounded-xl shadow-xl border border-outline-variant/30 flex items-center gap-space-sm animate-in fade-in slide-in-from-bottom-4"
        >
          <span className="material-symbols-outlined text-secondary-fixed text-lg">
            check_circle
          </span>
          <span className="font-label-md text-label-md">
            {toastMessage}
          </span>
        </div>
      )}
    </div>
  );
}
