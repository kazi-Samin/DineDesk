export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  description?: string;
  category?: string;
  image: string;
  imageAlt?: string;
}

export interface CartRecommendation {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
}

export interface CartState {
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  tax: number;
  discount: number;
  appliedCoupon?: string;
  total: number;
}
