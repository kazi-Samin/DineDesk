export interface CustomerOrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type CustomerOrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type CustomerOrderFulfillment = "delivery" | "pickup";
export type CustomerPaymentMethod = "card" | "cod" | "bkash" | "nagad";
export type CustomerPaymentStatus = "paid" | "pending" | "cash_on_delivery" | "refunded";

export interface CustomerOrder {
  id: string;
  restaurantName: string;
  restaurantImage: string;
  restaurantNeighborhood: string;
  items: CustomerOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: CustomerOrderStatus;
  fulfillment: CustomerOrderFulfillment;
  paymentMethod: CustomerPaymentMethod;
  paymentStatus: CustomerPaymentStatus;
  placedAt: string; // ISO date string
  estimatedDelivery?: string;
  deliveryAddress?: string;
  customerNote?: string;
  loyaltyPointsEarned: number;
  canCancel: boolean;
  hasBeenReviewed?: boolean;
  timeline: {
    placedAt: string;
    confirmedAt?: string;
    preparingAt?: string;
    outForDeliveryAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
  };
}
