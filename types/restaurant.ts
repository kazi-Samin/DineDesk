export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  cuisineCategory: string; // 'desi' | 'burger' | 'italian' | 'japanese' | 'asian' | 'dessert' | 'continental'
  priceTier: '৳' | '৳৳' | '৳৳৳' | '৳৳৳৳';
  rating: number;
  reviewCount: number;
  deliveryTime: string; // e.g. '30 min', '25-35 min'
  deliveryFee: string; // e.g. '৳60 delivery', 'Free delivery over ৳800'
  image: string;
  imageAlt: string;
  badge?: string;
  neighborhood: string;
  isOpen: boolean;
  isHalal: boolean;
  isVegetarianFriendly: boolean;
  isKidFriendly: boolean;
  isDineIn: boolean;
  isDelivery: boolean;
  closedNotice?: string;
  description?: string;
  flavorScore?: number;
  featured?: boolean;
  topRated?: boolean;
}

export interface FoodCategory {
  id: string;
  title: string;
  tagline: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  categoryFilter: string;
}

export interface ReviewTestimonial {
  id: string;
  quote: string;
  authorName: string;
  authorLocation: string;
  authorInitials: string;
  badgeColorClass: string;
  textColorClass: string;
}
