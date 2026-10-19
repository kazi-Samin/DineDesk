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
    menuItemId: string;
    name: string;
    price: number | string;
    quantity: number;
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
    id: it.id || it.menuItemId,
    name: it.name,
    price: Number(it.price) || 0,
    quantity: it.quantity || 1,
    image: "/images/kacchi-biryani.png",
  }));

  const subtotal = Number(bo.subtotal) || 0;
  const deliveryFee = Number(bo.deliveryFee) || 0;
  const discount = Number(bo.discount) || 0;
  const total = Number(bo.total) || subtotal + deliveryFee - discount;

  const dateObj = new Date(bo.createdAt);
  const timeStr = isNaN(dateObj.getTime())
    ? "Recently"
    : dateObj.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const status = mapBackendStatusToOrderStatus(bo.status);
  const paymentStatus = mapBackendPaymentStatus(bo.paymentStatus);

  return {
    orderId: bo.id.length > 10 ? `DD-${bo.id.slice(-5).toUpperCase()}` : bo.id,
    fulfillmentMode: bo.orderType === "PICKUP" ? "takeaway" : "delivery",
    restaurantId: bo.restaurantId,
    restaurantName: bo.restaurant?.name || "Curated Dine Partner",
    restaurantAddress: bo.restaurant?.address,
    restaurantImage: bo.restaurant?.coverUrl || "/images/restaurant-cover-placeholder.svg",
    items,
    contact: {
      fullName: "DineDesk Patron",
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

  const dateStr = isValidDate ? resDate.toISOString().split("T")[0] : "2026-10-25";
  const displayDate = isValidDate
    ? resDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Upcoming Seating";

  const timeStr = isValidDate
    ? resDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : "7:30 PM";

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
    restaurantName: br.restaurant?.name || "The Maple & Vine",
    restaurantImage: br.restaurant?.coverUrl || "/images/restaurant-cover-placeholder.svg",
    neighborhood: br.restaurant?.address || "Corktown, Detroit",
    fullAddress: br.restaurant?.address || "1420 Michigan Avenue, Detroit, MI 48216",
    cuisine: "Fine Dining",
    date: dateStr,
    displayDate,
    time: timeStr,
    mealPeriod,
    partySize: br.partySize || 2,
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
 * Fetches real authenticated customer orders from the backend API.
 * If user has no orders, returns an empty array [].
 */
export async function fetchCustomerOrders(userId?: string): Promise<OrderConfirmation[]> {
  const token = getStoredToken();
  if (!token) {
    return [];
  }

  try {
    const res = await apiClient<{ success: boolean; data: BackendOrder[] }>("/orders/my");
    if (res && res.success && Array.isArray(res.data)) {
      const mappedOrders = res.data.map(mapBackendOrderToConfirmation);
      
      // Also check user-scoped local orders placed during current session
      if (typeof window !== "undefined" && userId) {
        const localRaw = localStorage.getItem(`dinedesk_orders_${userId}`);
        if (localRaw) {
          try {
            const localOrders: OrderConfirmation[] = JSON.parse(localRaw);
            const combined = [...localOrders, ...mappedOrders.filter(
              (mo) => !localOrders.some((lo) => lo.orderId === mo.orderId)
            )];
            return combined;
          } catch {
            // ignore
          }
        }
      }
      return mappedOrders;
    }
    return [];
  } catch (err) {
    // If backend endpoint failed or token expired, check user-scoped storage only
    if (typeof window !== "undefined" && userId) {
      const localRaw = localStorage.getItem(`dinedesk_orders_${userId}`);
      if (localRaw) {
        try {
          return JSON.parse(localRaw);
        } catch {
          return [];
        }
      }
    }
    return [];
  }
}

/**
 * Fetches real authenticated customer reservations from the backend API.
 * If user has no reservations, returns an empty array [].
 */
export async function fetchCustomerReservations(userId?: string): Promise<CustomerReservation[]> {
  const token = getStoredToken();
  if (!token) {
    return [];
  }

  try {
    const res = await apiClient<{ success: boolean; data: BackendReservation[] }>("/reservations/my");
    if (res && res.success && Array.isArray(res.data)) {
      const mappedReservations = res.data.map(mapBackendReservationToCustomer);

      // Check user-scoped local reservations
      if (typeof window !== "undefined" && userId) {
        const localRaw = localStorage.getItem(`dinedesk_reservations_${userId}`);
        if (localRaw) {
          try {
            const localRes: CustomerReservation[] = JSON.parse(localRaw);
            const combined = [...localRes, ...mappedReservations.filter(
              (mr) => !localRes.some((lr) => lr.id === mr.id)
            )];
            return combined;
          } catch {
            // ignore
          }
        }
      }
      return mappedReservations;
    }
    return [];
  } catch (err) {
    if (typeof window !== "undefined" && userId) {
      const localRaw = localStorage.getItem(`dinedesk_reservations_${userId}`);
      if (localRaw) {
        try {
          return JSON.parse(localRaw);
        } catch {
          return [];
        }
      }
    }
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
  const res = await apiClient<{ success: boolean; data: BackendReservation }>("/reservations", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}
