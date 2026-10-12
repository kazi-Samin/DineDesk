import { OrderPayload, OrderConfirmation, OrderStatus, PaymentStatus } from "@/types/order";

const STORAGE_KEY = "dinedesk_orders";

// Default courier mock info
export const MOCK_COURIER = {
  name: "Kabir Hossain",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuATj-5bVpB67KqXwRJDHpOF-tOKDVAizyDorsdPffwl_Xjw-R7SZAbgsdymkx90d5OalmiW-ir8JfCJVOOTA2zrriohTjINKBIeK0a12SWLMOtlCkYQWtw48YdQPb_fIMHbeZ37HB2maP4LrP2Yw3FP0ytPlWzkTuT2XeHGpoRyUcDXObLkwxNYEKOM3MJMDvbwB1Ks4xTuu3z3aEzOtjc9_i-LlBaoSsmJSx2CNst06Oo5ga2QQd2k2Q",
  rating: 4.9,
  badge: "DineDesk Premier Courier • 1,200+ deliveries",
  vehicle: "Hero Glamour (Dhaka Metro-H 4821)",
  phone: "+880 1842-889921",
};

// Seed sample orders for immediate demo verification
const SEED_ORDERS: OrderConfirmation[] = [
  {
    orderId: "DD-84920",
    fulfillmentMode: "delivery",
    restaurantId: "sultans-heritage",
    restaurantName: "Sultan’s Heritage Kitchen",
    restaurantAddress: "House 67, Road 11, Block D, Banani, Dhaka",
    restaurantPhone: "+880 1712-490211",
    restaurantImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAynW47GxjfwGapFKKcsY7IuW4kqHfCXUe7TiLX200KTAEtDwDlSZIcenq9-NqhRY35p_T8Yb5-OACxT5MBxecujPwMRSdQt_kpCY8JfgaXQ0X08WEk5TlLafJqxmaZc79Dys1jgger7AyfwAFr7bDnJSFpG4DuIoHL2Bh-kgu8PhDo_YTITymqVIjmJAv4sdbubdPl3PhUejLyMmYiOfZjgRkpttoKmrKuAvyRgFUUJu19y4XX9NCZg",
    items: [
      {
        id: "item-kacchi",
        name: "Special Mutton Kacchi Biryani",
        description: "Full Portion • Chinigura aromatic rice, spiced tender goat, boiled egg, aloo bokhara",
        price: 650,
        quantity: 2,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBJq_BIGeRh7asvUEwulDsgwYADl4ReFd7wVPOHCkC6WfPynWNgRKObHdkcFhYKERWIIGoYTaVeKeZ2muyJS8Z-d9FTj8iGJ6752xAa5Y7gczu6VrnDbMUjtxJYNA6cuoozomIMSdrWOE1HD7gsqFiPimXyPa_h4NZykLThvxvWamPfRyUKpoh017W8JLPgfodsAlhPUphXBQ7cDUtA-9K-1W4LO_A1zbdiuAtshihfNDe4VzuIjHlQow",
        category: "Mains",
      },
      {
        id: "item-reshmi",
        name: "Shahi Reshmi Kebab",
        description: "4 skewers • Marinated in cashew cream, green chilies, mint yogurt dip",
        price: 420,
        quantity: 1,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBiAGBrLH5ajusIu7MHAoby2pk5Jg418M6J-Cu78oi9qx2qQNV5BYEXCeJ0hsH8X2IKSXO0xfl4XYHK79Jsn5QPMfA42-LID3nUIbxgR2AE_KRQQv-npk7IODpra2R_UsvgQMVVSEJF1OYGeuMJozAdr2lEpT0rHR31pllAG-hN7PGVjX6KSzv8WysfPBAs7P8WiqeM59l5lHd95zIiLQBMP_QrKLqwwNqnwX0UdOW6FPem6vSbJ_mQvQ",
        category: "Sides",
      },
      {
        id: "item-borhani",
        name: "Shahi Borhani",
        description: "500ml chilled bottles • Spiced yogurt, roasted mustard seeds, fresh mint",
        price: 110,
        quantity: 2,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB2eDk3yqZ8nml6Rop4T2g9B10VpLm86T_f88qgZ7mK8oP0Q21v0a=w400-h400-c",
        category: "Beverages",
      },
    ],
    address: {
      id: "addr-home",
      type: "home",
      label: "Home (Banani)",
      street: "House 18, Road 11",
      apartment: "Apartment 4B",
      floor: "4th Floor / Lift 02",
      instructions:
        "Please leave the package with reception security if lift card is unavailable, or dial intercom 402.",
      isDefault: true,
    },
    contact: {
      fullName: "Tahmid Rahman",
      phone: "+880 1712-345678",
      email: "tahmid.rahman@example.com",
    },
    paymentMethod: "card",
    paymentStatus: "paid",
    appliedCoupon: "FIRSTDINE",
    subtotal: 1940,
    discount: 200,
    deliveryFee: 60,
    packagingFee: 30,
    tax: 97,
    total: 1927,
    status: "preparing",
    estimatedDeliveryTime: "8:15 – 8:30 PM",
    remainingMinutes: 35,
    courier: MOCK_COURIER,
    createdAt: new Date().toISOString(),
    timeline: {
      placedAt: "7:42 PM",
      confirmedAt: "7:45 PM",
      preparingAt: "7:45 PM",
    },
  },
];

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
