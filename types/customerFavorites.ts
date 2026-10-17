export type FavoriteCategory = "restaurant" | "dish";

export type CuisineFilterType =
  | "all"
  | "mughlai"
  | "japanese"
  | "artisan"
  | "dhakaiya";

export type AreaFilterType = "all" | "banani" | "gulshan" | "old-dhaka";

export interface FavoriteRestaurant {
  id: string;
  type: "restaurant";
  name: string;
  neighborhood: string;
  areaKey: "banani" | "gulshan" | "old-dhaka";
  areaBadge: string;
  cuisine: string;
  cuisineKey: "mughlai" | "japanese" | "artisan" | "dhakaiya";
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
  imageAlt: string;
  isOpen: boolean;
  statusLabel: string;
  statusVariant: "live" | "secondary";
  restaurantId: string;
}

export interface FavoriteDish {
  id: string;
  type: "dish";
  restaurantId: string;
  restaurantName: string;
  name: string;
  price: number;
  description: string;
  image: string;
  imageAlt: string;
  cuisineKey: "mughlai" | "japanese" | "artisan" | "dhakaiya";
  areaKey: "banani" | "gulshan" | "old-dhaka";
}

export type ActiveFavoritesTab = "all" | "restaurants" | "dishes";
