import { OrderPayload, OrderConfirmation, OrderStatus, PaymentStatus } from "@/types/order";
import { VENDOR_SEED_ORDERS, MOCK_COURIER } from "@/data/mockVendorOrders";

const STORAGE_KEY = "dinedesk_orders";

export { MOCK_COURIER };

const SEED_ORDERS: OrderConfirmation[] = VENDOR_SEED_ORDERS;

function getAuthUser(): { id?: string; role?: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("dinedesk_auth_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getOrdersStorageKey(): string {
  const user = getAuthUser();
  if (user?.role === "USER" && user?.id) {
    return `dinedesk_orders_${user.id}`;
  }
  return STORAGE_KEY;
}

// Helper to safely load orders from storage
export function getMockOrders(): OrderConfirmation[] {
  if (typeof window === "undefined") return [];
  const user = getAuthUser();
  const key = getOrdersStorageKey();
  
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (user?.role === "USER") {
        return [];
      }
      localStorage.setItem(key, JSON.stringify(SEED_ORDERS));
      return SEED_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : (user?.role === "USER" ? [] : SEED_ORDERS);
  } catch {
    return user?.role === "USER" ? [] : SEED_ORDERS;
  }
}

// Save all orders to localStorage
function saveOrders(orders: OrderConfirmation[]) {
  if (typeof window !== "undefined") {
    try {
      const key = getOrdersStorageKey();
      localStorage.setItem(key, JSON.stringify(orders));
    } catch {
      // storage unavailable
    }
  }
}

// Get order by ID
export function getMockOrder(orderId: string): OrderConfirmation | null {
  const orders = getMockOrders();
  const found = orders.find((o) => o.orderId.toLowerCase() === orderId.toLowerCase());
  return found || null;
}

// Alias for vendor requirements
export function getOrderById(orderId: string): OrderConfirmation | null {
  return getMockOrder(orderId);
}

// Place a new mock order
export async function placeOrder(payload: OrderPayload): Promise<OrderConfirmation> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const orderId = `DD-${randomNum}`;

  // Initial payment status
  const paymentStatus: PaymentStatus =
    payload.paymentMethod === "cod" ? "cash_on_delivery" : "paid";

  const newOrder: OrderConfirmation = {
    ...payload,
    orderId,
    status: "pending",
    paymentStatus,
    estimatedDeliveryTime:
      payload.fulfillmentMode === "delivery"
        ? "30–45 mins"
        : payload.fulfillmentMode === "takeaway"
        ? "20–25 mins"
        : "15–20 mins",
    remainingMinutes: payload.fulfillmentMode === "delivery" ? 35 : 20,
    courier: payload.fulfillmentMode === "delivery" ? MOCK_COURIER : undefined,
    createdAt: now.toISOString(),
    timeline: {
      placedAt: timeStr,
    },
  };

  const existing = getMockOrders();
  const updated = [newOrder, ...existing.filter((o) => o.orderId !== orderId)];
  saveOrders(updated);

  return newOrder;
}

// Update mock order status (for Dev mock controls)
export function updateMockOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  paymentStatus?: PaymentStatus
): OrderConfirmation | null {
  const orders = getMockOrders();
  const idx = orders.findIndex((o) => o.orderId.toLowerCase() === orderId.toLowerCase());
  if (idx === -1) return null;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const target = orders[idx];
  const updatedTimeline = {
    placedAt: target.timeline?.placedAt || timeStr,
    ...target.timeline,
  };

  if (newStatus === "confirmed") updatedTimeline.confirmedAt = timeStr;
  if (newStatus === "preparing") updatedTimeline.preparingAt = timeStr;
  if (newStatus === "ready") updatedTimeline.readyAt = timeStr;
  if (newStatus === "out_for_delivery") updatedTimeline.outForDeliveryAt = timeStr;
  if (newStatus === "delivered" || newStatus === "completed") updatedTimeline.deliveredAt = timeStr;
  if (newStatus === "cancelled") updatedTimeline.cancelledAt = timeStr;
  if (newStatus === "rejected") updatedTimeline.rejectedAt = timeStr;

  const updatedOrder: OrderConfirmation = {
    ...target,
    status: newStatus,
    paymentStatus: paymentStatus || target.paymentStatus,
    updatedAt: now.toISOString(),
    timeline: updatedTimeline,
  };

  orders[idx] = updatedOrder;
  saveOrders(orders);
  return updatedOrder;
}

// Cancel mock order
export function cancelMockOrder(orderId: string): OrderConfirmation | null {
  return updateMockOrderStatus(orderId, "cancelled");
}

// Vendor: Get orders filtered by restaurantId
export function getVendorOrders(restaurantId = "the-maple-and-vine"): OrderConfirmation[] {
  const allOrders = getMockOrders();
  return allOrders.filter(
    (o) =>
      o.restaurantId === restaurantId ||
      o.restaurantId === "the-maple-and-vine" ||
      (restaurantId === "sultans-heritage" && o.restaurantId === "sultans-heritage")
  );
}

// Vendor: Accept order
export function acceptOrder(orderId: string): OrderConfirmation | null {
  return updateMockOrderStatus(orderId, "confirmed");
}

// Vendor: Reject order with reason
export function rejectOrder(orderId: string, reason?: string): OrderConfirmation | null {
  const orders = getMockOrders();
  const idx = orders.findIndex((o) => o.orderId.toLowerCase() === orderId.toLowerCase());
  if (idx === -1) return null;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const target = orders[idx];

  const updatedOrder: OrderConfirmation = {
    ...target,
    status: "rejected",
    rejectionReason: reason || "Kitchen at maximum banquet capacity",
    updatedAt: now.toISOString(),
    timeline: {
      placedAt: target.timeline?.placedAt || timeStr,
      ...target.timeline,
      rejectedAt: timeStr,
    },
  };

  orders[idx] = updatedOrder;
  saveOrders(orders);
  return updatedOrder;
}

// Vendor: Mark order delivered with optional COD payment collection flag
export function markOrderDelivered(
  orderId: string,
  paymentCollected = false
): OrderConfirmation | null {
  const orders = getMockOrders();
  const idx = orders.findIndex((o) => o.orderId.toLowerCase() === orderId.toLowerCase());
  if (idx === -1) return null;

  const target = orders[idx];
  const nextPaymentStatus =
    target.paymentMethod === "cod" && paymentCollected
      ? "paid"
      : target.paymentStatus;

  return updateMockOrderStatus(orderId, "delivered", nextPaymentStatus);
}

// Vendor: Get order statistics
export interface VendorOrderStats {
  newOrders: number;
  preparing: number;
  outForDelivery: number;
  completedToday: number;
  todayRevenue: number;
  totalOrders: number;
}

export function getOrderStatistics(restaurantId = "the-maple-and-vine"): VendorOrderStats {
  const orders = getVendorOrders(restaurantId);

  const newOrders = orders.filter((o) => o.status === "pending").length;
  const preparing = orders.filter((o) => o.status === "preparing").length;
  const outForDelivery = orders.filter(
    (o) => o.status === "out_for_delivery" || o.status === "ready"
  ).length;
  const completedToday = orders.filter(
    (o) => o.status === "delivered" || o.status === "completed"
  ).length;

  const todayRevenue = orders
    .filter((o) => o.status !== "rejected" && o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  return {
    newOrders,
    preparing,
    outForDelivery,
    completedToday,
    todayRevenue,
    totalOrders: orders.length,
  };
}

// Vendor: Simulate a new incoming demo order
export function simulateNewOrder(restaurantId = "the-maple-and-vine"): OrderConfirmation {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const demoCustomers = [
    { name: "Sarah Jenkins", phone: "(313) 555-0143", area: "Midtown Detroit, Cass Ave" },
    { name: "Marcus Vance", phone: "(313) 555-0142", area: "Corktown, Michigan Ave" },
    { name: "Jordan Smith", phone: "(313) 555-0100", area: "Downtown Detroit, Woodward Ave" },
    { name: "Elena Rostova", phone: "(313) 555-0199", area: "Riverfront Towers, Suite 12B" },
  ];
  const selectedCust = demoCustomers[Math.floor(Math.random() * demoCustomers.length)];

  const demoItems = [
    {
      id: `item-${Date.now()}-1`,
      name: "Heritage Dry-Aged Ribeye",
      description: "14oz Prime Cut • Rosemary-infused tallow butter, roasted garlic",
      price: 48,
      quantity: 2,
      image:
        "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&auto=format&fit=crop",
      category: "Mains",
    },
    {
      id: `item-${Date.now()}-2`,
      name: "Artisanal Michigan Cider",
      description: "Chilled 750ml bottle • Crisp heirloom apple blend",
      price: 14,
      quantity: 2,
      image:
        "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=400&auto=format&fit=crop",
      category: "Beverages",
    },
  ];

  const subtotal = 124;
  const deliveryFee = 5;
  const packagingFee = 3;
  const tax = 8;
  const total = subtotal + deliveryFee + packagingFee + tax;

  const newOrder: OrderConfirmation = {
    orderId: `DD-${randomNum}`,
    fulfillmentMode: "delivery",
    restaurantId,
    restaurantName: "The Maple & Vine",
    restaurantAddress: "1420 Michigan Avenue, Detroit, MI 48216",
    restaurantPhone: "(313) 555-0142",
    restaurantImage:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1400&auto=format&fit=crop",
    items: demoItems,
    address: {
      id: `addr-${Date.now()}`,
      type: "home",
      label: "Home",
      street: selectedCust.area,
      apartment: "Apartment 4B",
      floor: "4th Floor",
      instructions: "Ring front door buzzer upon arrival.",
    },
    contact: {
      fullName: selectedCust.name,
      phone: selectedCust.phone,
      email: `${selectedCust.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    },
    paymentMethod: "cod",
    paymentStatus: "cash_on_delivery",
    subtotal,
    discount: 0,
    deliveryFee,
    packagingFee,
    tax,
    total,
    status: "pending",
    estimatedDeliveryTime: "30–45 mins",
    remainingMinutes: 35,
    specialInstructions: "Newly placed simulated order via DineDesk Fleet",
    courier: MOCK_COURIER,
    createdAt: now.toISOString(),
    timeline: {
      placedAt: timeStr,
    },
  };

  const existing = getMockOrders();
  const updated = [newOrder, ...existing.filter((o) => o.orderId !== newOrder.orderId)];
  saveOrders(updated);

  return newOrder;
}

// Calculate totals helper
export function calculateOrderTotals(order: OrderConfirmation) {
  return {
    subtotal: order.subtotal,
    discount: order.discount,
    deliveryFee: order.deliveryFee,
    packagingFee: order.packagingFee,
    tax: order.tax,
    total: order.total,
  };
}
