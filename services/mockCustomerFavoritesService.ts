import {
  FavoriteRestaurant,
  FavoriteDish,
} from "@/types/customerFavorites";
import {
  INITIAL_FAVORITE_RESTAURANTS,
  INITIAL_FAVORITE_DISHES,
} from "@/data/mockCustomerFavorites";

const RESTAURANTS_KEY = "dinedesk_saved_restaurants";
const DISHES_KEY = "dinedesk_saved_dishes";

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function getSavedRestaurants(): FavoriteRestaurant[] {
  if (!isClient()) return INITIAL_FAVORITE_RESTAURANTS;
  try {
    const raw = localStorage.getItem(RESTAURANTS_KEY);
    if (!raw) {
      localStorage.setItem(
        RESTAURANTS_KEY,
        JSON.stringify(INITIAL_FAVORITE_RESTAURANTS)
      );
      return INITIAL_FAVORITE_RESTAURANTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_FAVORITE_RESTAURANTS;
  } catch {
    return INITIAL_FAVORITE_RESTAURANTS;
  }
}

export function saveRestaurants(restaurants: FavoriteRestaurant[]): void {
  if (isClient()) {
    try {
      localStorage.setItem(RESTAURANTS_KEY, JSON.stringify(restaurants));
    } catch {
      // ignore
    }
  }
}

export function getSavedDishes(): FavoriteDish[] {
  if (!isClient()) return INITIAL_FAVORITE_DISHES;
  try {
    const raw = localStorage.getItem(DISHES_KEY);
    if (!raw) {
      localStorage.setItem(
        DISHES_KEY,
        JSON.stringify(INITIAL_FAVORITE_DISHES)
      );
      return INITIAL_FAVORITE_DISHES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_FAVORITE_DISHES;
  } catch {
    return INITIAL_FAVORITE_DISHES;
  }
}

export function saveDishes(dishes: FavoriteDish[]): void {
  if (isClient()) {
    try {
      localStorage.setItem(DISHES_KEY, JSON.stringify(dishes));
    } catch {
      // ignore
    }
  }
}

export function removeFavoriteRestaurant(
  restaurants: FavoriteRestaurant[],
  id: string
): FavoriteRestaurant[] {
  const updated = restaurants.filter((r) => r.id !== id);
  saveRestaurants(updated);
  return updated;
}

export function removeFavoriteDish(
  dishes: FavoriteDish[],
  id: string
): FavoriteDish[] {
  const updated = dishes.filter((d) => d.id !== id);
  saveDishes(updated);
  return updated;
}
