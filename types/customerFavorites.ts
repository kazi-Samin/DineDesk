export type FavoriteCategory = "restaurant" | "dish";

export type CuisineFilterType =
  | "all"
  | "mughlai"
  | "japanese"
  | "artisan"
  | "dhakaiya"
  | "american"
  | "smokehouse"
  | "indian";

export type AreaFilterType =
  | "all"
  | "banani"
  | "gulshan"
  | "old-dhaka"
  | "corktown"
  | "midtown"
  | "downtown";

export interface FavoriteRestaurant {
  id: string;
  type: "restaurant";
  name: string;
  neighborhood: string;
  areaKey: "banani" | "gulshan" | "old-dhaka" | "corktown" | "midtown" | "downtown";
  areaBadge: string;
  cuisine: string;
  cuisineKey:
    | "mughlai"
    | "japanese"
    | "artisan"
    | "dhakaiya"
    | "american"
    | "smokehouse"
    | "indian";
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
  cuisineKey:
    | "mughlai"
    | "japanese"
    | "artisan"
    | "dhakaiya"
    | "american"
    | "smokehouse"
    | "indian";
  areaKey: "banani" | "gulshan" | "old-dhaka" | "corktown" | "midtown" | "downtown";
}

export type ActiveFavoritesTab = "all" | "restaurants" | "dishes";
