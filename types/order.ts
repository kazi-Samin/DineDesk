import { CartItem } from "./cart";

export type FulfillmentMode = "delivery" | "takeaway" | "dinein";
export type PaymentMethod = "card" | "cod" | "mfs";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "cash_on_delivery";

export interface DeliveryAddress {
  id: string;
  type: "home" | "office" | "custom";
  label: string;
  street: string;
  apartment: string;
  floor: string;
  instructions: string;
  isDefault?: boolean;
}

export interface CustomerContact {
  fullName: string;
  phone: string;
  email: string;
}

export interface CardDetails {
  cardholderName: string;
  cardNumber: string;
  expDate: string;
  cvc: string;
}

export interface CourierInfo {
  name: string;
  avatar: string;
  rating: number;
  badge: string;
  vehicle: string;
  phone: string;
}

export interface OrderPayload {
  fulfillmentMode: FulfillmentMode;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  restaurantImage?: string;
  items: CartItem[];
  address?: DeliveryAddress;
  contact: CustomerContact;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  cardDetails?: CardDetails;
  appliedCoupon?: string;
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  tax: number;
  discount: number;
  total: number;
}

export interface OrderConfirmation extends OrderPayload {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  estimatedDeliveryTime: string;
  remainingMinutes?: number;
  courier?: CourierInfo;
  createdAt: string;
  updatedAt?: string;
  timeline?: {
    placedAt: string;
    confirmedAt?: string;
    preparingAt?: string;
    readyAt?: string;
    outForDeliveryAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
  };
}
