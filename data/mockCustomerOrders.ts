import { CustomerOrder } from "@/types/customerOrder";

export const MOCK_CUSTOMER_ORDERS: CustomerOrder[] = [
  // 1. Preparing (Active)
  {
    id: "DD-2026-1042",
    restaurantName: "Sultan's Dine",
    restaurantImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCM0A6w013XvP8h7_pd5bZQf5dMwpGju5N_-1Dfm9vPQtCbp3-4X4ZAe6_QSSIXNOf9Yc_hicygalGWu7lJpF5Jz6_NSgn7kCB499yCD2VxwGkxIYDCUCGw6gu56SgRivR9lz07ImqyBkVULde1D7vjj9qAmUbpS8-EPr8nK8F766ziHDiUZtGI1RC2J3QyYr-5t7FabZElQvB0Pi3P0bNhfPaqW0awGdeu60CApPegvQagCed9TEOXrg",
    restaurantNeighborhood: "Banani, Dhaka",
    items: [
      { id: "i1", name: "Kacchi Biryani (Mutton)", quantity: 2, unitPrice: 450, total: 900 },
      { id: "i2", name: "Borhani (Spiced Yogurt Drink)", quantity: 2, unitPrice: 120, total: 240 },
      { id: "i3", name: "Shahi Zarda (Dessert)", quantity: 1, unitPrice: 180, total: 180 },
    ],
    subtotal: 1320,
    deliveryFee: 60,
    discount: 200,
    total: 1180,
    status: "preparing",
    fulfillment: "delivery",
    paymentMethod: "card",
    paymentStatus: "paid",
    placedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    estimatedDelivery: "Within 20 mins",
    deliveryAddress: "House 18, Road 11, Apt 4B, Banani, Dhaka 1213",
    loyaltyPointsEarned: 59,
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
    restaurantName: "Chillox",
    restaurantImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC-Ex8ixEkibuOd0npk5Aeym8LP6IYX6lkMx0BSDsFoogSf5x2-4yUFFy4MsjgE1Z_rcGx8KY-lJC5DZNcqZAibwOwvWadFYocv9dt3l6zZWb6SdvGubnUwPQaPEBuO81mMRnu11Al-oqNrSWCG04EY9fXM9xxwLgxgCAO_PDSqBiJVQO9-FB-3GVjfrndCHYWqr0aD31Z9TxibSe03Khufnwy1JdufE93LSTxrUbUw2iofN4wSzKg-Hg",
    restaurantNeighborhood: "Dhanmondi, Dhaka",
    items: [
      { id: "i4", name: "Classic Beef Smash Burger", quantity: 1, unitPrice: 390, total: 390 },
      { id: "i5", name: "Crinkle Cut Fries (Large)", quantity: 1, unitPrice: 130, total: 130 },
    ],
    subtotal: 520,
    deliveryFee: 60,
    discount: 60,
    total: 520,
    status: "out_for_delivery",
    fulfillment: "delivery",
    paymentMethod: "bkash",
    paymentStatus: "paid",
    placedAt: new Date(Date.now() - 68 * 60 * 1000).toISOString(),
    estimatedDelivery: "~8 mins away",
    deliveryAddress: "Road 9A, Dhanmondi, House 34, Flat 3B, Dhaka 1209",
    loyaltyPointsEarned: 26,
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
    restaurantName: "Panshi Restaurant",
    restaurantImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDj_mLubjAzHDhE_b4-jNfRhxBHf0fgC8R6yksqEfhCkX8UZsVPavj4goeaGvZLWhtrkDrK3vKuEQFhQQCWUjoXHy76JsgjslWgnUAdApFBcVKp1sRx9X4OW2yq7C9DhDhEM8Pd53-IA9TQbiZsswBU9kf73U5jHrARS_dn-2_5br02CN2U8Voggc3Yc00ZXEOYgjGu7-6Jx42Vndf8vIjIr-pV1vBdHzGZYOaOXkpHZ1vzCjLCtDKugw",
    restaurantNeighborhood: "Purana Paltan, Dhaka",
    items: [
      { id: "i6", name: "Beef Tehari (Full Plate)", quantity: 2, unitPrice: 320, total: 640 },
      { id: "i7", name: "Borhani (Chilled)", quantity: 1, unitPrice: 120, total: 120 },
    ],
    subtotal: 760,
    deliveryFee: 60,
    discount: 60,
    total: 760,
    status: "delivered",
    fulfillment: "delivery",
    paymentMethod: "card",
    paymentStatus: "paid",
    placedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryAddress: "House 18, Road 11, Apt 4B, Banani, Dhaka 1213",
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
    restaurantName: "Handi Restaurant",
    restaurantImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCq4XteJO7PQulqsfLml-4jen85ytTy6BhmfBdWMmG8laCGkckQlAOYuCWN2VgeL_7OaKsBjt8kKhNonYQOT70NdyOohuY-EstSZ1q6kiubdZuPH3aMg2gUvwlzhfal5p9mF3tjEsm7m3AcfSRc3X01s9owbV_lC9MnCstCJMNLo16Yhr12QS8YCEY-akyIQK25YEX1UqTdgcFhFpdKnld36AjkThyHDDqCVODqxV59iQBgifvGSZX5_w",
    restaurantNeighborhood: "Gulshan, Dhaka",
    items: [
      { id: "i8", name: "Chicken Roast (Half)", quantity: 1, unitPrice: 390, total: 390 },
      { id: "i9", name: "Polao (Fragrant Rice)", quantity: 1, unitPrice: 250, total: 250 },
    ],
    subtotal: 640,
    deliveryFee: 60,
    discount: 0,
    total: 640,
    status: "cancelled",
    fulfillment: "delivery",
    paymentMethod: "cod",
    paymentStatus: "refunded",
    placedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryAddress: "House 18, Road 11, Apt 4B, Banani, Dhaka 1213",
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
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC-Ex8ixEkibuOd0npk5Aeym8LP6IYX6lkMx0BSDsFoogSf5x2-4yUFFy4MsjgE1Z_rcGx8KY-lJC5DZNcqZAibwOwvWadFYocv9dt3l6zZWb6SdvGubnUwPQaPEBuO81mMRnu11Al-oqNrSWCG04EY9fXM9xxwLgxgCAO_PDSqBiJVQO9-FB-3GVjfrndCHYWqr0aD31Z9TxibSe03Khufnwy1JdufE93LSTxrUbUw2iofN4wSzKg-Hg",
    restaurantNeighborhood: "Banani, Dhaka",
    items: [
      { id: "i10", name: "Double Smashed Truffle Burger", quantity: 2, unitPrice: 490, total: 980 },
      { id: "i11", name: "Hand-cut Seasoned Fries", quantity: 1, unitPrice: 160, total: 160 },
    ],
    subtotal: 1140,
    deliveryFee: 60,
    discount: 60,
    total: 1140,
    status: "delivered",
    fulfillment: "delivery",
    paymentMethod: "nagad",
    paymentStatus: "paid",
    placedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryAddress: "House 18, Road 11, Apt 4B, Banani, Dhaka 1213",
    loyaltyPointsEarned: 57,
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
    restaurantName: "Dacca Tehari Ghar",
    restaurantImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDj_mLubjAzHDhE_b4-jNfRhxBHf0fgC8R6yksqEfhCkX8UZsVPavj4goeaGvZLWhtrkDrK3vKuEQFhQQCWUjoXHy76JsgjslWgnUAdApFBcVKp1sRx9X4OW2yq7C9DhDhEM8Pd53-IA9TQbiZsswBU9kf73U5jHrARS_dn-2_5br02CN2U8Voggc3Yc00ZXEOYgjGu7-6Jx42Vndf8vIjIr-pV1vBdHzGZYOaOXkpHZ1vzCjLCtDKugw",
    restaurantNeighborhood: "Purana Paltan, Dhaka",
    items: [
      { id: "i12", name: "Old Dhaka Beef Tehari (with Boiled Egg)", quantity: 3, unitPrice: 280, total: 840 },
      { id: "i13", name: "Borhani (Chilled Bottle)", quantity: 2, unitPrice: 70, total: 140 },
    ],
    subtotal: 980,
    deliveryFee: 0,
    discount: 0,
    total: 980,
    status: "delivered",
    fulfillment: "pickup",
    paymentMethod: "card",
    paymentStatus: "paid",
    placedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    loyaltyPointsEarned: 49,
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
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCq4XteJO7PQulqsfLml-4jen85ytTy6BhmfBdWMmG8laCGkckQlAOYuCWN2VgeL_7OaKsBjt8kKhNonYQOT70NdyOohuY-EstSZ1q6kiubdZuPH3aMg2gUvwlzhfal5p9mF3tjEsm7m3AcfSRc3X01s9owbV_lC9MnCstCJMNLo16Yhr12QS8YCEY-akyIQK25YEX1UqTdgcFhFpdKnld36AjkThyHDDqCVODqxV59iQBgifvGSZX5_w",
    restaurantNeighborhood: "Gulshan Avenue, Dhaka",
    items: [
      { id: "i14", name: "Woodfired Margherita Pizza", quantity: 1, unitPrice: 990, total: 990 },
      { id: "i15", name: "Porcini Tagliatelle", quantity: 1, unitPrice: 860, total: 860 },
    ],
    subtotal: 1850,
    deliveryFee: 80,
    discount: 80,
    total: 1850,
    status: "delivered",
    fulfillment: "delivery",
    paymentMethod: "card",
    paymentStatus: "paid",
    placedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryAddress: "House 18, Road 11, Apt 4B, Banani, Dhaka 1213",
    loyaltyPointsEarned: 92,
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
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBj7iJJ_k-JqFYCKNNEg2kUVHfBJ20vNYBAegnGRTA6IAn5UQpaCtOKow8y29D2oOgfpWB2nGZkwnLCvypdxS3pAu4H0LD-kxFJ9DxwBmZmP1lz4CabQEr67FND3BljYyx3J3p0oPF87kndbo1DE4CqquA616ECD4tkFgtq2rAPFwLGcgIPBpv1vBWdhOQhxa_TmJCvIK3FQnHPXky7JbuPWHTRebCmOsYbMXYH2udlq6oTaNgn0faWTQ",
    restaurantNeighborhood: "Dhanmondi, Dhaka",
    items: [
      { id: "i16", name: "Salmon Nigiri Set (8 pcs)", quantity: 1, unitPrice: 1480, total: 1480 },
      { id: "i17", name: "Prawn Tempura Maki Roll", quantity: 1, unitPrice: 940, total: 940 },
    ],
    subtotal: 2420,
    deliveryFee: 80,
    discount: 0,
    total: 2420,
    status: "cancelled",
    fulfillment: "delivery",
    paymentMethod: "bkash",
    paymentStatus: "refunded",
    placedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryAddress: "Road 9A, Dhanmondi, House 34, Flat 3B, Dhaka 1209",
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
  restaurantName: "Nando's Dhaka",
  restaurantImage:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCM0A6w013XvP8h7_pd5bZQf5dMwpGju5N_-1Dfm9vPQtCbp3-4X4ZAe6_QSSIXNOf9Yc_hicygalGWu7lJpF5Jz6_NSgn7kCB499yCD2VxwGkxIYDCUCGw6gu56SgRivR9lz07ImqyBkVULde1D7vjj9qAmUbpS8-EPr8nK8F766ziHDiUZtGI1RC2J3QyYr-5t7FabZElQvB0Pi3P0bNhfPaqW0awGdeu60CApPegvQagCed9TEOXrg",
  restaurantNeighborhood: "Uttara, Dhaka",
  items: [
    { id: "i18", name: "Full Flame Grilled Chicken (PERi-PERi)", quantity: 1, unitPrice: 690, total: 690 },
    { id: "i19", name: "Peri-Peri Loaded Fries", quantity: 1, unitPrice: 210, total: 210 },
    { id: "i20", name: "Frozen Yogurt (Mango)", quantity: 2, unitPrice: 160, total: 320 },
  ],
  subtotal: 1220,
  deliveryFee: 70,
  discount: 0,
  total: 1290,
  status: "placed",
  fulfillment: "delivery",
  paymentMethod: "card",
  paymentStatus: "paid",
  placedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  estimatedDelivery: "Est. 45 mins",
  deliveryAddress: "House 18, Road 11, Apt 4B, Banani, Dhaka 1213",
  loyaltyPointsEarned: 64,
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
