import { CustomerOrder } from "@/types/customerOrder";

export const MOCK_CUSTOMER_ORDERS: CustomerOrder[] = [
  // 1. Preparing (Active)
  {
    id: "DD-2026-1042",
    restaurantName: "The Maple & Vine",
    restaurantImage:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1400&auto=format&fit=crop",
    restaurantNeighborhood: "Corktown, Detroit",
    items: [
      { id: "i1", name: "Heritage Dry-Aged Ribeye", quantity: 1, unitPrice: 48, total: 48 },
      { id: "i2", name: "Wood-Fired Hearth Chicken", quantity: 1, unitPrice: 28, total: 28 },
      { id: "i3", name: "Artisanal Michigan Cider (Bottle)", quantity: 2, unitPrice: 14, total: 28 },
    ],
    subtotal: 104,
    deliveryFee: 5,
    discount: 10,
    total: 99,
    status: "preparing",
    fulfillment: "delivery",
    paymentMethod: "card",
    paymentStatus: "paid",
    placedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    estimatedDelivery: "Within 20 mins",
    deliveryAddress: "2100 Michigan Ave, Apt 4B, Detroit, MI 48216",
    loyaltyPointsEarned: 99,
    canCancel: false,
    hasBeenReviewed: false,
    timeline: {
      placedAt: "7:42 PM",
      confirmedAt: "7:44 PM",
      preparingAt: "7:47 PM",
    },
  },

  // 2. Out for Delivery (Active)
  {
    id: "DD-2026-1038",
    restaurantName: "Detroit Burger Co",
    restaurantImage:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop",
    restaurantNeighborhood: "Midtown, Detroit",
    items: [
      { id: "i4", name: "Classic Beef Smash Burger", quantity: 1, unitPrice: 16, total: 16 },
      { id: "i5", name: "Truffle Crinkle Cut Fries", quantity: 1, unitPrice: 8, total: 8 },
    ],
    subtotal: 24,
    deliveryFee: 4,
    discount: 4,
    total: 24,
    status: "out_for_delivery",
    fulfillment: "delivery",
    paymentMethod: "card",
    paymentStatus: "paid",
    placedAt: new Date(Date.now() - 68 * 60 * 1000).toISOString(),
    estimatedDelivery: "~8 mins away",
    deliveryAddress: "450 Cass Ave, Loft 3B, Detroit, MI 48201",
    loyaltyPointsEarned: 24,
    canCancel: false,
    hasBeenReviewed: false,
    timeline: {
      placedAt: "6:38 PM",
      confirmedAt: "6:40 PM",
      preparingAt: "6:44 PM",
      outForDeliveryAt: "7:15 PM",
    },
  },

  // 3. Delivered
  {
    id: "DD-2026-1025",
    restaurantName: "Midtown Grille",
    restaurantImage:
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
    restaurantNeighborhood: "Downtown Detroit",
    items: [
      { id: "i6", name: "Smoked Texas Prime Brisket", quantity: 1, unitPrice: 32, total: 32 },
      { id: "i7", name: "Heirloom Apple Cider", quantity: 1, unitPrice: 6, total: 6 },
    ],
    subtotal: 38,
    deliveryFee: 5,
    discount: 5,
    total: 38,
    status: "delivered",
    fulfillment: "delivery",
    paymentMethod: "card",
    paymentStatus: "paid",
    placedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryAddress: "2100 Michigan Ave, Apt 4B, Detroit, MI 48216",
    loyaltyPointsEarned: 38,
    canCancel: false,
    hasBeenReviewed: true,
    timeline: {
      placedAt: "1:10 PM",
      confirmedAt: "1:12 PM",
      preparingAt: "1:15 PM",
      outForDeliveryAt: "1:48 PM",
      deliveredAt: "2:09 PM",
    },
  },

  // 4. Cancelled
  {
    id: "DD-2026-1019",
    restaurantName: "Corktown Smokehouse",
    restaurantImage:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop",
    restaurantNeighborhood: "Corktown, Detroit",
    items: [
      { id: "i8", name: "Slow-Smoked Baby Back Ribs", quantity: 1, unitPrice: 28, total: 28 },
      { id: "i9", name: "Skillet Cornbread with Honey Butter", quantity: 1, unitPrice: 8, total: 8 },
    ],
    subtotal: 36,
    deliveryFee: 5,
    discount: 0,
    total: 41,
    status: "cancelled",
    fulfillment: "delivery",
    paymentMethod: "card",
    paymentStatus: "refunded",
    placedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryAddress: "2100 Michigan Ave, Apt 4B, Detroit, MI 48216",
    loyaltyPointsEarned: 0,
    canCancel: false,
    hasBeenReviewed: false,
    timeline: {
      placedAt: "8:05 PM",
      cancelledAt: "8:09 PM",
    },
  },

  // 5. Delivered
  {
    id: "DD-2026-1011",
    restaurantName: "SmashCraft Studio",
    restaurantImage:
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=600&auto=format&fit=crop",
    restaurantNeighborhood: "Midtown, Detroit",
    items: [
      { id: "i10", name: "Double Smashed Truffle Burger", quantity: 2, unitPrice: 18, total: 36 },
      { id: "i11", name: "Hand-cut Seasoned Fries", quantity: 1, unitPrice: 7, total: 7 },
    ],
    subtotal: 43,
    deliveryFee: 5,
    discount: 5,
    total: 43,
    status: "delivered",
    fulfillment: "delivery",
    paymentMethod: "card",
    paymentStatus: "paid",
    placedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryAddress: "2100 Michigan Ave, Apt 4B, Detroit, MI 48216",
    loyaltyPointsEarned: 43,
    canCancel: false,
    hasBeenReviewed: false,
    timeline: {
      placedAt: "8:15 PM",
      confirmedAt: "8:16 PM",
      preparingAt: "8:20 PM",
      outForDeliveryAt: "8:50 PM",
      deliveredAt: "9:08 PM",
    },
  },

  // 6. Delivered (Pickup)
  {
    id: "DD-2026-0998",
    restaurantName: "Eastern Market Deli",
    restaurantImage:
      "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=600&auto=format&fit=crop",
    restaurantNeighborhood: "Eastern Market, Detroit",
    items: [
      { id: "i12", name: "Hot Pastrami on Rye Sandwich", quantity: 2, unitPrice: 16, total: 32 },
      { id: "i13", name: "Cold-Brew Craft Soda", quantity: 2, unitPrice: 4, total: 8 },
    ],
    subtotal: 40,
    deliveryFee: 0,
    discount: 0,
    total: 40,
    status: "delivered",
    fulfillment: "pickup",
    paymentMethod: "card",
    paymentStatus: "paid",
    placedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    loyaltyPointsEarned: 40,
    canCancel: false,
    hasBeenReviewed: true,
    timeline: {
      placedAt: "1:20 PM",
      confirmedAt: "1:22 PM",
      preparingAt: "1:26 PM",
      deliveredAt: "2:05 PM",
    },
  },

  // 7. Delivered
  {
    id: "DD-2026-0972",
    restaurantName: "Osteria Bella",
    restaurantImage:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop",
    restaurantNeighborhood: "Riverfront, Detroit",
    items: [
      { id: "i14", name: "Woodfired Margherita Pizza", quantity: 1, unitPrice: 22, total: 22 },
      { id: "i15", name: "Porcini Tagliatelle", quantity: 1, unitPrice: 26, total: 26 },
    ],
    subtotal: 48,
    deliveryFee: 5,
    discount: 5,
    total: 48,
    status: "delivered",
    fulfillment: "delivery",
    paymentMethod: "card",
    paymentStatus: "paid",
    placedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryAddress: "2100 Michigan Ave, Apt 4B, Detroit, MI 48216",
    loyaltyPointsEarned: 48,
    canCancel: false,
    hasBeenReviewed: false,
    timeline: {
      placedAt: "9:00 PM",
      confirmedAt: "9:02 PM",
      preparingAt: "9:06 PM",
      outForDeliveryAt: "9:45 PM",
      deliveredAt: "10:14 PM",
    },
  },

  // 8. Cancelled
  {
    id: "DD-2026-0941",
    restaurantName: "Mori Artisan Sushi",
    restaurantImage:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop",
    restaurantNeighborhood: "Downtown Detroit",
    items: [
      { id: "i16", name: "Salmon Nigiri Set (8 pcs)", quantity: 1, unitPrice: 32, total: 32 },
      { id: "i17", name: "Prawn Tempura Roll", quantity: 1, unitPrice: 18, total: 18 },
    ],
    subtotal: 50,
    deliveryFee: 5,
    discount: 0,
    total: 55,
    status: "cancelled",
    fulfillment: "delivery",
    paymentMethod: "card",
    paymentStatus: "refunded",
    placedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryAddress: "450 Cass Ave, Loft 3B, Detroit, MI 48201",
    loyaltyPointsEarned: 0,
    canCancel: false,
    hasBeenReviewed: false,
    timeline: {
      placedAt: "8:30 PM",
      cancelledAt: "8:33 PM",
    },
  },
];

// Placed (just submitted, cancellable)
MOCK_CUSTOMER_ORDERS.unshift({
  id: "DD-2026-1047",
  restaurantName: "Detroit Flame Grille",
  restaurantImage:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop",
  restaurantNeighborhood: "Downtown Detroit",
  items: [
    { id: "i18", name: "Flame Grilled Whole Chicken", quantity: 1, unitPrice: 24, total: 24 },
    { id: "i19", name: "Loaded Truffle Fries", quantity: 1, unitPrice: 8, total: 8 },
    { id: "i20", name: "Artisanal Gelato (Double Scoop)", quantity: 1, unitPrice: 7, total: 7 },
  ],
  subtotal: 39,
  deliveryFee: 5,
  discount: 0,
  total: 44,
  status: "placed",
  fulfillment: "delivery",
  paymentMethod: "card",
  paymentStatus: "paid",
  placedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  estimatedDelivery: "Est. 35 mins",
  deliveryAddress: "2100 Michigan Ave, Apt 4B, Detroit, MI 48216",
  loyaltyPointsEarned: 44,
  canCancel: true,
  hasBeenReviewed: false,
  timeline: {
    placedAt: new Date(Date.now() - 4 * 60 * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
});

export function getCustomerOrders(): CustomerOrder[] {
  if (typeof window === "undefined") return MOCK_CUSTOMER_ORDERS;
  try {
    const raw = localStorage.getItem("dinedesk_customer_orders");
    if (!raw) {
      localStorage.setItem("dinedesk_customer_orders", JSON.stringify(MOCK_CUSTOMER_ORDERS));
      return MOCK_CUSTOMER_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_CUSTOMER_ORDERS;
  } catch {
    return MOCK_CUSTOMER_ORDERS;
  }
}

export function saveCustomerOrders(orders: CustomerOrder[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("dinedesk_customer_orders", JSON.stringify(orders));
    } catch {
      // storage unavailable
    }
  }
}

export function cancelCustomerOrder(orders: CustomerOrder[], orderId: string): CustomerOrder[] {
  const updated = orders.map((o) => {
    if (o.id === orderId && o.canCancel) {
      return {
        ...o,
        status: "cancelled" as const,
        canCancel: false,
        paymentStatus: o.paymentMethod === "cod" ? o.paymentStatus : ("refunded" as const),
        loyaltyPointsEarned: 0,
        timeline: {
          ...o.timeline,
          cancelledAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      };
    }
    return o;
  });
  saveCustomerOrders(updated);
  return updated;
}
