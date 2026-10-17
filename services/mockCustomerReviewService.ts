import { CustomerReview } from "@/types/customerReview";
import { INITIAL_CUSTOMER_REVIEWS } from "@/data/mockCustomerReviews";

const STORAGE_KEY = "dinedesk_customer_reviews";

export function getCustomerReviews(): CustomerReview[] {
  if (typeof window === "undefined") {
    return INITIAL_CUSTOMER_REVIEWS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CUSTOMER_REVIEWS));
      return INITIAL_CUSTOMER_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 0) {
      return parsed;
    }
    return INITIAL_CUSTOMER_REVIEWS;
  } catch (e) {
    console.error("Error reading customer reviews from localStorage:", e);
    return INITIAL_CUSTOMER_REVIEWS;
  }
}

export function saveCustomerReviews(reviews: CustomerReview[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.error("Error saving customer reviews to localStorage:", e);
  }
}

export function updateCustomerReview(
  reviews: CustomerReview[],
  updatedReview: CustomerReview
): CustomerReview[] {
  const updated = reviews.map((r) =>
    r.id === updatedReview.id ? updatedReview : r
  );
  saveCustomerReviews(updated);
  return updated;
}

export function deleteCustomerReview(
  reviews: CustomerReview[],
  reviewId: string
): CustomerReview[] {
  const updated = reviews.filter((r) => r.id !== reviewId);
  saveCustomerReviews(updated);
  return updated;
}

export function toggleHelpfulVote(
  reviews: CustomerReview[],
  reviewId: string
): CustomerReview[] {
  const updated = reviews.map((r) => {
    if (r.id !== reviewId) return r;
    const hasUpvoted = !r.hasUpvoted;
    const helpfulVotes = hasUpvoted
      ? r.helpfulVotes + 1
      : Math.max(0, r.helpfulVotes - 1);
    return {
      ...r,
      hasUpvoted,
      helpfulVotes,
    };
  });
  saveCustomerReviews(updated);
  return updated;
}

export function resetCustomerReviews(): CustomerReview[] {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
  return INITIAL_CUSTOMER_REVIEWS;
}
