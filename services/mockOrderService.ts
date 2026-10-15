import { OrderPayload, OrderConfirmation, OrderStatus, PaymentStatus } from "@/types/order";
import { VENDOR_SEED_ORDERS, MOCK_COURIER } from "@/data/mockVendorOrders";

const STORAGE_KEY = "dinedesk_orders";

export { MOCK_COURIER };

const SEED_ORDERS: OrderConfirmation[] = VENDOR_SEED_ORDERS;

// Helper to safely load orders from storage
export function getMockOrders(): OrderConfirmation[] {
  if (typeof window === "undefined") return SEED_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ORDERS));
      return SEED_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_ORDERS;
  } catch {
    return SEED_ORDERS;
  }
}

// Save all orders to localStorage
function saveOrders(orders: OrderConfirmation[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
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
export function getVendorOrders(restaurantId = "sultans-heritage"): OrderConfirmation[] {
  const allOrders = getMockOrders();
  return allOrders.filter((o) => o.restaurantId === restaurantId);
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

export function getOrderStatistics(restaurantId = "sultans-heritage"): VendorOrderStats {
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
export function simulateNewOrder(restaurantId = "sultans-heritage"): OrderConfirmation {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const demoCustomers = [
    { name: "Rafeeq Chowdhury", phone: "+880 1711-229988", area: "Gulshan 1, Road 28" },
    { name: "Mehnaz Parveen", phone: "+880 1819-334411", area: "Banani DOHS, House 14" },
    { name: "Shakib Al Amin", phone: "+880 1922-887766", area: "Dhanmondi 27, Apt 6A" },
    { name: "Tanzeem Akhtar", phone: "+880 1688-441122", area: "Uttara Sector 4, Road 7" },
  ];
  const selectedCust = demoCustomers[Math.floor(Math.random() * demoCustomers.length)];

  const demoItems = [
    {
      id: `item-${Date.now()}-1`,
      name: "Special Mutton Kacchi Biryani",
      description: "Full Portion with aloo and egg",
      price: 650,
      quantity: 2,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBJq_BIGeRh7asvUEwulDsgwYADl4ReFd7wVPOHCkC6WfPynWNgRKObHdkcFhYKERWIIGoYTaVeKeZ2muyJS8Z-d9FTj8iGJ6752xAa5Y7gczu6VrnDbMUjtxJYNA6cuoozomIMSdrWOE1HD7gsqFiPimXyPa_h4NZykLThvxvWamPfRyUKpoh017W8JLPgfodsAlhPUphXBQ7cDUtA-9K-1W4LO_A1zbdiuAtshihfNDe4VzuIjHlQow",
      category: "Mains",
    },
    {
      id: `item-${Date.now()}-2`,
      name: "Shahi Borhani Glass Bottles",
      description: "500ml chilled bottles",
      price: 110,
      quantity: 2,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB2eDk3yqZ8nml6Rop4T2g9B10VpLm86T_f88qgZ7mK8oP0Q21v0a=w400-h400-c",
      category: "Beverages",
    },
  ];

  const subtotal = 1520;
  const deliveryFee = 60;
  const packagingFee = 30;
  const tax = 76;
  const total = subtotal + deliveryFee + packagingFee + tax;

  const newOrder: OrderConfirmation = {
    orderId: `DD-${randomNum}`,
    fulfillmentMode: "delivery",
    restaurantId,
    restaurantName: "Sultan’s Heritage Kitchen",
    restaurantAddress: "House 67, Road 11, Block D, Banani, Dhaka",
    restaurantPhone: "+880 1712-490211",
    restaurantImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAynW47GxjfwGapFKKcsY7IuW4kqHfCXUe7TiLX200KTAEtDwDlSZIcenq9-NqhRY35p_T8Yb5-OACxT5MBxecujPwMRSdQt_kpCY8JfgaXQ0X08WEk5TlLafJqxmaZc79Dys1jgger7AyfwAFr7bDnJSFpG4DuIoHL2Bh-kgu8PhDo_YTITymqVIjmJAv4sdbubdPl3PhUejLyMmYiOfZjgRkpttoKmrKuAvyRgFUUJu19y4XX9NCZg",
    items: demoItems,
    address: {
      id: `addr-${Date.now()}`,
      type: "home",
      label: "Home",
      street: selectedCust.area,
      apartment: "Apartment 4B",
      floor: "4th Floor",
      instructions: "Ring door buzzer twice upon arrival.",
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
