import {
  FavoriteRestaurant,
  FavoriteDish,
} from "@/types/customerFavorites";

const DEFAULT_RESTAURANTS_KEY = "dinedesk_saved_restaurants";
const DEFAULT_DISHES_KEY = "dinedesk_saved_dishes";

function isClient(): boolean {
  return typeof window !== "undefined";
}

function getAuthUserId(): string | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem("dinedesk_auth_user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.id || null;
  } catch {
    return null;
  }
}

function getRestaurantsKey(): string {
  const uid = getAuthUserId();
  return uid ? `dinedesk_saved_restaurants_${uid}` : DEFAULT_RESTAURANTS_KEY;
}

function getDishesKey(): string {
  const uid = getAuthUserId();
  return uid ? `dinedesk_saved_dishes_${uid}` : DEFAULT_DISHES_KEY;
}

export function getSavedRestaurants(): FavoriteRestaurant[] {
  if (!isClient()) return [];
  try {
    const key = getRestaurantsKey();
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRestaurants(restaurants: FavoriteRestaurant[]): void {
  if (isClient()) {
    try {
      const key = getRestaurantsKey();
      localStorage.setItem(key, JSON.stringify(restaurants));
    } catch {
      // ignore
    }
  }
}

export function getSavedDishes(): FavoriteDish[] {
  if (!isClient()) return [];
  try {
    const key = getDishesKey();
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDishes(dishes: FavoriteDish[]): void {
  if (isClient()) {
    try {
      const key = getDishesKey();
      localStorage.setItem(key, JSON.stringify(dishes));
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
