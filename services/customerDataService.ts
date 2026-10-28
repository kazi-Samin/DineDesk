import { apiClient } from "./apiClient";
import { OrderConfirmation, OrderStatus, PaymentStatus } from "@/types/order";
import { CustomerReservation, CustomerReservationStatus } from "@/types/customerReservation";
import { getStoredToken } from "./authService";

export interface BackendOrder {
  id: string;
  userId: string;
  restaurantId: string;
  orderType: "DELIVERY" | "PICKUP";
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number | string;
  discount?: number | string;
  deliveryFee?: number | string;
  total: number | string;
  deliveryAddress?: string;
  createdAt: string;
  updatedAt?: string;
  restaurant?: {
    id: string;
    name: string;
    coverUrl?: string;
    address?: string;
  };
  items?: Array<{
    id: string;
    menuItemId?: string;
    name: string;
    price: number | string;
    quantity: number;
    image?: string;
  }>;
}

export interface BackendReservation {
  id: string;
  userId: string;
  restaurantId: string;
  reservedFor: string;
  partySize: number;
  note?: string | null;
  status: string;
  createdAt: string;
  restaurant?: {
    id: string;
    name: string;
    address?: string;
    coverUrl?: string;
  };
}

export function mapBackendStatusToOrderStatus(status: string): OrderStatus {
  switch (status?.toUpperCase()) {
    case "PLACED":
      return "pending";
    case "CONFIRMED":
      return "confirmed";
    case "PREPARING":
      return "preparing";
    case "READY":
      return "ready";
    case "OUT_FOR_DELIVERY":
      return "out_for_delivery";
    case "DELIVERED":
      return "delivered";
    case "CANCELLED":
      return "cancelled";
    case "REJECTED":
      return "rejected";
    default:
      return "pending";
  }
}

export function mapBackendPaymentStatus(status: string): PaymentStatus {
  switch (status?.toUpperCase()) {
    case "PAID":
      return "paid";
    case "FAILED":
      return "failed";
    case "CASH_ON_DELIVERY":
    case "UNPAID":
      return "cash_on_delivery";
    default:
      return "pending";
  }
}

export function mapBackendOrderToConfirmation(bo: BackendOrder): OrderConfirmation {
  const items = (bo.items || []).map((it) => ({
    id: it.id || it.menuItemId || "",
    name: it.name || "Item",
    price: Number(it.price) || 0,
    quantity: it.quantity || 1,
    image: it.image || bo.restaurant?.coverUrl || "/images/restaurant-cover-placeholder.svg",
  }));

  const subtotal = Number(bo.subtotal) || 0;
  const deliveryFee = Number(bo.deliveryFee) || 0;
  const discount = Number(bo.discount) || 0;
  const total = Number(bo.total) || subtotal + deliveryFee - discount;

  const dateObj = new Date(bo.createdAt);
  const timeStr = isNaN(dateObj.getTime())
    ? ""
    : dateObj.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const status = mapBackendStatusToOrderStatus(bo.status);
  const paymentStatus = mapBackendPaymentStatus(bo.paymentStatus);

  return {
    orderId: bo.id.length > 10 ? `DD-${bo.id.slice(-5).toUpperCase()}` : bo.id,
    fulfillmentMode: bo.orderType === "PICKUP" ? "takeaway" : "delivery",
    restaurantId: bo.restaurantId,
    restaurantName: bo.restaurant?.name || "Restaurant",
    restaurantAddress: bo.restaurant?.address || "",
    restaurantImage: bo.restaurant?.coverUrl || "/images/restaurant-cover-placeholder.svg",
    items,
    contact: {
      fullName: "",
      phone: "",
      email: "",
    },
    paymentMethod: bo.paymentMethod === "STRIPE" ? "card" : "cod",
    paymentStatus,
    subtotal,
    deliveryFee,
    packagingFee: 0,
    tax: 0,
    discount,
    total,
    status,
    estimatedDeliveryTime: status === "delivered" ? "Delivered" : "30–45 mins",
    createdAt: bo.createdAt,
    timeline: {
      placedAt: timeStr,
      deliveredAt: status === "delivered" ? timeStr : undefined,
    },
  };
}

export function mapBackendReservationToCustomer(br: BackendReservation): CustomerReservation {
  const resDate = new Date(br.reservedFor);
  const isValidDate = !isNaN(resDate.getTime());

  const dateStr = isValidDate ? resDate.toISOString().split("T")[0] : "";
  const displayDate = isValidDate
    ? resDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "";

  const timeStr = isValidDate
    ? resDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : "";

  let status: CustomerReservationStatus = "pending";
  let statusDisplay: "Confirmed" | "Pending Venue" | "Completed" | "Fully Booked" | "Cancelled" =
    "Pending Venue";

  const upperStatus = br.status?.toUpperCase();
  if (upperStatus === "CONFIRMED") {
    status = "confirmed";
    statusDisplay = "Confirmed";
  } else if (upperStatus === "CANCELLED") {
    status = "cancelled";
    statusDisplay = "Cancelled";
  } else if (upperStatus === "COMPLETED") {
    status = "completed";
    statusDisplay = "Completed";
  } else {
    status = "pending";
    statusDisplay = "Pending Venue";
  }

  const hours = isValidDate ? resDate.getHours() : 19;
  const mealPeriod = hours < 16 ? "Lunch" : "Dinner";

  return {
    id: br.id.length > 10 ? `RES-${br.id.slice(-4).toUpperCase()}` : br.id,
    restaurantId: br.restaurantId,
    restaurantName: br.restaurant?.name || "Restaurant",
    restaurantImage: br.restaurant?.coverUrl || "/images/restaurant-cover-placeholder.svg",
    neighborhood: br.restaurant?.address || "",
    fullAddress: br.restaurant?.address || "",
    cuisine: "Dining",
    date: dateStr,
    displayDate,
    time: timeStr,
    mealPeriod,
    partySize: br.partySize || 1,
    seatingArea: "Main Dining",
    tableNumber: status === "confirmed" ? "Table Reserved" : undefined,
    specialNotes: br.note || undefined,
    status,
    statusDisplay,
    isFeaturedUpcoming: status === "confirmed",
    createdAt: br.createdAt,
  };
}

/**
 * Helper to get active session token with cookie fallback
 */
function resolveSessionToken(): string {
  const token = getStoredToken();
  if (token && token.trim() !== "") return token.trim();

  if (typeof document !== "undefined") {
    const match = document.cookie.match(
      /(?:^|;\s*)(?:dinedesk_auth_token|better-auth\.session_token|token|auth_token|accessToken)=([^;]+)/
    );
    if (match && match[1]) return match[1].trim();
  }
  return "";
}

/**
 * Fetches real authenticated customer orders directly from the backend API.
 * Returns empty array [] if unauthenticated or on error.
 */
export async function fetchCustomerOrders(_userId?: string): Promise<OrderConfirmation[]> {
  const token = resolveSessionToken();
  if (!token) {
    return [];
  }

  try {
    const res = await apiClient<{ success: boolean; data: BackendOrder[] }>("/orders/my", {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-session-token": token,
        "better-auth-session-token": token,
      },
    });

    if (res && res.success && Array.isArray(res.data)) {
      return res.data.map(mapBackendOrderToConfirmation);
    }
    return [];
  } catch (err) {
    console.error("fetchCustomerOrders failed:", err);
    return [];
  }
}

/**
 * Fetches real authenticated customer reservations directly from the backend API.
 * Returns empty array [] if unauthenticated or on error.
 */
export async function fetchCustomerReservations(_userId?: string): Promise<CustomerReservation[]> {
  const token = resolveSessionToken();
  if (!token) {
    return [];
  }

  try {
    const res = await apiClient<{ success: boolean; data: BackendReservation[] }>("/reservations/my", {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-session-token": token,
        "better-auth-session-token": token,
      },
    });

    if (res && res.success && Array.isArray(res.data)) {
      return res.data.map(mapBackendReservationToCustomer);
    }
    return [];
  } catch (err) {
    console.error("fetchCustomerReservations failed:", err);
    return [];
  }
}

/**
 * Creates a real reservation in the backend API.
 */
export async function createReservationApi(data: {
  restaurantId: string;
  reservedFor: string;
  partySize: number;
  note?: string;
}): Promise<BackendReservation> {
  const token = resolveSessionToken();
  const res = await apiClient<{ success: boolean; data: BackendReservation }>("/reservations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-session-token": token,
      "better-auth-session-token": token,
    },
    body: JSON.stringify(data),
  });
  return res.data;
}