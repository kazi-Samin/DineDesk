export type MenuCategory =
  | "Starters & Kebabs"
  | "Heritage Mains"
  | "Desserts"
  | "Traditional Refreshers"
  | "Chef's Tasting Sets";

export interface MenuItemDietary {
  halal: boolean;
  chefRecommended: boolean;
  spicy: boolean;
  vegetarian: boolean;
  glutenFree: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  image: string;
  imageAlt?: string;
  isAvailable: boolean;
  prepTime: string;
  dailySales: number;
  marginPercent?: number;
  badge?: string; // e.g. "Chef Signature", "Tandoor Special"
  tags: string[]; // e.g. ["Halal", "100% Khasi Mutton", "Mild Spice"]
  dietary: MenuItemDietary;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemFormInput {
  name: string;
  category: MenuCategory;
  price: number;
  prepTime: string;
  description: string;
  image: string;
  imageFileName?: string;
  imageFileSize?: string;
  isAvailable: boolean;
  badge?: string;
  tags?: string[];
  dietary: MenuItemDietary;
}

export interface MenuSummaryStats {
  totalDishes: number;
  featuredDishesCount: number;
  liveInKitchenCount: number;
  availabilityPercent: number;
  soldOutTonightCount: number;
  avgDishMargin: number;
  topSellingDish: string;
}
