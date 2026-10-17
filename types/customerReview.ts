export type VerificationType = "dine-in" | "delivery";

export interface ReviewPhoto {
  id: string;
  url: string;
  caption?: string;
  alt?: string;
}

export interface CustomerReview {
  id: string;
  restaurantName: string;
  restaurantImage: string;
  restaurantLocation: string;
  verificationType: VerificationType;
  visitDate: string;
  visitMealType?: string;
  reviewDate: string;
  rating: number;
  headline: string;
  content: string;
  dishes: string[];
  availableDishes: string[];
  photos: ReviewPhoto[];
  helpfulVotes: number;
  hasUpvoted?: boolean;
  timestamp?: number;
}

export type ReviewFilterType = "all" | "5-star" | "4-star" | "with-photos";

export type ReviewSortType = "recent" | "highest-rated" | "most-helpful";
