import {
  MenuItem,
  MenuItemFormInput,
  MenuSummaryStats,
} from "@/types/menu";
import { SEED_MENU_ITEMS } from "@/data/mockMenuItems";

const MENU_STORAGE_KEY = "dinedesk_vendor_menu";

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function getMenuItems(): MenuItem[] {
  if (!isClient()) return SEED_MENU_ITEMS;
  try {
    const raw = localStorage.getItem(MENU_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(SEED_MENU_ITEMS));
      return SEED_MENU_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(SEED_MENU_ITEMS));
      return SEED_MENU_ITEMS;
    }
    return parsed;
  } catch (err) {
    console.error("Error reading vendor menu from storage:", err);
    return SEED_MENU_ITEMS;
  }
}

export function saveMenuItems(items: MenuItem[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Error saving vendor menu to storage:", err);
  }
}

export function resetMenuData(): MenuItem[] {
  if (isClient()) {
    try {
      localStorage.removeItem(MENU_STORAGE_KEY);
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(SEED_MENU_ITEMS));
    } catch (e) {
      console.error("Reset error:", e);
    }
  }
  return SEED_MENU_ITEMS;
}

export function addMenuItem(input: MenuItemFormInput): MenuItem[] {
  const items = getMenuItems();
  const newItem: MenuItem = {
    id: `item-${Date.now()}`,
    restaurantId: "the-maple-and-vine",
    name: input.name,
    description: input.description,
    category: input.category,
    price: Number(input.price),
    image:
      input.image ||
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAnJqvvt5EBgy4uJqz-HLn3H7c9Tly3PZYiCMVF8Jhfym9_phUBe7AiCQOpS3zFaR0YJxosB1D5X4FAVajRn-BgNUDoPfuRVIaEZRAXu_HGbnkYcMmqp89wStKLIEoyOjxwd_i53pPEVpOve-casivoYnEcs3WBo-EnPV8noYbjjjxKZZ_Qm47-y-Qx5WoqUHqsvduaAP7Yy4jGG5E9CE-9VKGQczjyh2OrpO2dLfWtjoGYiC1eP_j1BQ",
    imageAlt: input.name,
    isAvailable: input.isAvailable,
    prepTime: input.prepTime || "20 mins",
    dailySales: 0,
    marginPercent: 68.0,
    badge: input.badge,
    tags: input.tags || ["Halal"],
    dietary: input.dietary,
    isFeatured: input.dietary.chefRecommended,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newItem, ...items];
  saveMenuItems(updated);
  return updated;
}

export function updateMenuItem(
  id: string,
  input: MenuItemFormInput
): MenuItem[] {
  const items = getMenuItems();
  const updated = items.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        name: input.name,
        description: input.description,
        category: input.category,
        price: Number(input.price),
        prepTime: input.prepTime || item.prepTime,
        image: input.image || item.image,
        isAvailable: input.isAvailable,
        badge: input.badge !== undefined ? input.badge : item.badge,
        tags: input.tags || item.tags,
        dietary: input.dietary,
        isFeatured: input.dietary.chefRecommended,
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });

  saveMenuItems(updated);
  return updated;
}

export function deleteMenuItem(id: string): MenuItem[] {
  const items = getMenuItems();
  const updated = items.filter((item) => item.id !== id);
  saveMenuItems(updated);
  return updated;
}

export function toggleItemAvailability(id: string): MenuItem[] {
  const items = getMenuItems();
  const updated = items.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        isAvailable: !item.isAvailable,
        badge: !item.isAvailable ? undefined : item.badge === "Sold Out" ? undefined : item.badge,
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });

  saveMenuItems(updated);
  return updated;
}

export function bulkUpdateAvailability(isAvailable: boolean): MenuItem[] {
  const items = getMenuItems();
  const updated = items.map((item) => ({
    ...item,
    isAvailable,
    badge: isAvailable ? (item.badge === "Sold Out" ? undefined : item.badge) : "Sold Out",
    updatedAt: new Date().toISOString(),
  }));

  saveMenuItems(updated);
  return updated;
}

export function getMenuSummaryStats(items: MenuItem[]): MenuSummaryStats {
  const totalDishes = items.length;
  const featuredDishesCount = items.filter(
    (i) => i.isFeatured || i.dietary.chefRecommended || i.badge?.includes("Signature")
  ).length;
  const liveInKitchenCount = items.filter((i) => i.isAvailable).length;
  const soldOutTonightCount = items.filter((i) => !i.isAvailable).length;
  const availabilityPercent =
    totalDishes > 0 ? Math.round((liveInKitchenCount / totalDishes) * 100) : 0;

  // Average margin calculation
  const totalMargin = items.reduce((acc, i) => acc + (i.marginPercent || 68), 0);
  const avgDishMargin =
    totalDishes > 0 ? Number((totalMargin / totalDishes).toFixed(1)) : 68.4;

  // Top selling dish
  const sortedBySales = [...items].sort((a, b) => b.dailySales - a.dailySales);
  const topSellingDish = sortedBySales[0]?.name
    ? sortedBySales[0].name.split("(")[0].trim()
    : "Kacchi Biryani";

  return {
    totalDishes,
    featuredDishesCount,
    liveInKitchenCount,
    availabilityPercent,
    soldOutTonightCount,
    avgDishMargin,
    topSellingDish,
  };
}
