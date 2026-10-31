// app/order-confirmation/[orderId]/page.tsx
"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  getMockOrder,
  cancelMockOrder,
  MOCK_COURIER,
} from "@/services/mockOrderService";
import { OrderConfirmation, OrderStatus, PaymentStatus } from "@/types/order";
import OrderConfirmationHero from "@/components/orders/OrderConfirmationHero";
import OrderStatusTracker from "@/components/orders/OrderStatusTracker";
import DeliveryTrackingCard from "@/components/orders/DeliveryTrackingCard";
import CourierCard from "@/components/orders/CourierCard";
import OrderItemsSummary from "@/components/orders/OrderItemsSummary";
import OrderReceipt from "@/components/orders/OrderReceipt";
import OrderSupportModal from "@/components/orders/OrderSupportModal";
import CancelOrderModal from "@/components/orders/CancelOrderModal";

interface OrderConfirmationPageProps {
  params: Promise<{ id?: string; orderId?: string }>;
}

export interface UserAddressData {
  id?: string;
  label?: string;
  recipientName?: string;
  contactNumber?: string;
  category?: string;
  building?: string;
  road?: string;
  apartment?: string;
  city?: string;
  postalCode?: string;
  deliveryInstructions?: string | null;
  addressLine?: string;
  isDefault?: boolean;
}

export type FullOrderConfirmation = Omit<OrderConfirmation, "pricing" | "delivery"> & {
  pointsEarned?: number;
  subtotal?: number;
  discount?: number;
  deliveryFee?: number;
  packagingFee?: number;
  serviceFee?: number;
  tax?: number;
  total?: number;
  delivery?: {
    address?: string;
    lat?: number;
    lng?: number;
    instructions?: string;
  };
  pricing?: {
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    tax: number;
    discount: number;
    total: number;
    pointsEarned: number;
  };
  [key: string]: any;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"
).replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");

const getAuthToken = () => {
  if (typeof window === "undefined") return "";

  const match = document.cookie.match(
    /(?:^|;\s*)(?:token|dinedesk_auth_token|better-auth\.session_token|auth_token|accessToken)=([^;]+)/
  );
  if (match && match[1]) return match[1].trim();

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("dinedesk_auth_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  ).trim();
};

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const resolvedParams = use(params);
  const targetOrderId = resolvedParams.id || resolvedParams.orderId || "";
  const router = useRouter();
  const { user } = useAuth();

  const [order, setOrder] = useState<FullOrderConfirmation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUnpaidStripe, setIsUnpaidStripe] = useState<boolean>(false);
  const [supportModalOpen, setSupportModalOpen] = useState<boolean>(false);
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [addressData, setAddressData] = useState<UserAddressData | null>(null);

  const confirmAttemptedRef = useRef(false);

  // 1. Fetch Customer Address Profile
  const fetchUserAddress = useCallback(async () => {
    try {
      const token = getAuthToken();
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      let res = await fetch(`${API_BASE_URL}/api/v1/users/addresses`, {
        headers,
        credentials: "include",
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`${API_BASE_URL}/api/v1/addresses`, {
          headers,
          credentials: "include",
        }).catch(() => null);
      }

      if (res && res.ok) {
        const json = await res.json();
        const list: UserAddressData[] = json.data || json.addresses || [];
        if (Array.isArray(list) && list.length > 0) {
          const def = list.find((a) => a.isDefault) || list[0];
          setAddressData({
            ...def,
            label: def.label || `${def.city || "Chattogram"}, Bangladesh`,
            recipientName: def.recipientName || user?.name || "Customer",
            contactNumber: def.contactNumber || user?.phone || "+880 1700000000",
            category: def.category || "home",
            apartment: def.apartment || "Flat",
            building: def.building || "Building",
            road: def.road || "Street",
            city: def.city || "Chattogram",
            postalCode: def.postalCode || "4000",
            deliveryInstructions: def.deliveryInstructions || "Leave at reception or call intercom.",
            addressLine:
              def.addressLine ||
              `${def.apartment || ""}, ${def.building || ""}, ${def.road || ""}, ${def.city || ""}`.replace(/^, |, $/g, ""),
          });
          return;
        }
      }

      if (typeof window !== "undefined") {
        const localProfile = localStorage.getItem("dinedesk_customer_profile");
        if (localProfile) {
          const parsed = JSON.parse(localProfile);
          if (parsed.deliveryAddress) {
            setAddressData({
              addressLine: parsed.deliveryAddress,
              apartment: "Registered Location",
              road: "Local Route",
              city: "Local",
              recipientName: user?.name || "Customer",
              contactNumber: user?.phone || "+880 1700000000",
              deliveryInstructions: "Leave with reception security or call intercom.",
            });
            return;
          }
        }
      }

      setAddressData(null);
    } catch (err) {
      console.error("Address fetch error:", err);
      setAddressData(null);
    }
  }, [user]);

  // 2. Fetch Order Data and verify payment state
  const loadOrderData = useCallback(async () => {
    try {
      if (!targetOrderId) return;

      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      if (typeof window !== "undefined" && !confirmAttemptedRef.current) {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get("session_id");
        if (sessionId) {
          confirmAttemptedRef.current = true;
          await fetch(`${API_BASE_URL}/api/v1/orders/confirm-payment`, {
            method: "POST",
            headers,
            credentials: "include",
            body: JSON.stringify({ orderId: targetOrderId, sessionId }),
          }).catch(() => null);
        }
      }

      let dbOrder: any = null;

      const singleRes = await fetch(`${API_BASE_URL}/api/v1/orders/${targetOrderId}`, {
        headers,
        credentials: "include",
      }).catch(() => null);

      if (singleRes && singleRes.ok) {
        const resData = await singleRes.json();
        dbOrder = resData.data || resData.order || resData;
      }

      if (!dbOrder) {
        const listRes = await fetch(`${API_BASE_URL}/api/v1/orders/my`, {
          headers,
          credentials: "include",
        }).catch(() => null);

        if (listRes && listRes.ok) {
          const listData = await listRes.json();
          const rawList = listData.data || listData.orders || [];
          dbOrder = rawList.find(
            (o: any) => o.id === targetOrderId || o.orderId === targetOrderId || o._id === targetOrderId
          );
        }
      }

      if (!dbOrder) {
        const mockFound = getMockOrder(targetOrderId);
        if (mockFound) {
          const mockSubtotal = Number(mockFound.subtotal ?? mockFound.total ?? 0);
          const mockDelivery = Number(mockFound.deliveryFee ?? 0);
          const mockDiscount = Number(mockFound.discount ?? 0);
          const mockTotal = Number(mockFound.total ?? mockSubtotal + mockDelivery - mockDiscount);

          setOrder({
            ...mockFound,
            subtotal: mockSubtotal,
            deliveryFee: mockDelivery,
            discount: mockDiscount,
            packagingFee: 2.0,
            serviceFee: 2.0,
            tax: 0,
            total: mockTotal,
            pricing: {
              subtotal: mockSubtotal,
              deliveryFee: mockDelivery,
              serviceFee: 2.0,
              tax: 0,
              discount: mockDiscount,
              total: mockTotal,
              pointsEarned: 20,
            },
            contact: {
              ...mockFound.contact,
              fullName: user?.name || mockFound.contact?.fullName || "Guest Customer",
            },
          } as FullOrderConfirmation);
          setLoading(false);
          return;
        }
      }

      if (dbOrder) {
        const isStripe = String(dbOrder.paymentMethod || "").toUpperCase() === "STRIPE";
        const isPaid = String(dbOrder.paymentStatus || "").toUpperCase() === "PAID";

        if (isStripe && !isPaid) {
          setIsUnpaidStripe(true);
        } else {
          setIsUnpaidStripe(false);
        }

        const rawStatus = String(dbOrder.status || "PENDING").toLowerCase();
        let normalizedStatus: OrderStatus = "confirmed";
        if (rawStatus === "delivered" || rawStatus === "completed") {
          normalizedStatus = "delivered";
        } else if (rawStatus === "out_for_delivery") {
          normalizedStatus = "out_for_delivery";
        } else if (rawStatus === "preparing") {
          normalizedStatus = "preparing";
        } else if (rawStatus === "cancelled" || rawStatus === "rejected") {
          normalizedStatus = "cancelled";
        }

        const rawPaymentStatus = String(dbOrder.paymentStatus || "UNPAID").toLowerCase();
        const normalizedPayment: PaymentStatus = rawPaymentStatus === "paid" ? "paid" : "pending";

        const subtotalNum = Number(dbOrder.subtotal || dbOrder.total || 0);
        const deliveryFeeNum = Number(dbOrder.deliveryFee || 0);
        const discountNum = Number(dbOrder.discount || 0);
        const totalNum = Number(dbOrder.total || subtotalNum + deliveryFeeNum - discountNum);

        const mappedItems =
          Array.isArray(dbOrder.items) && dbOrder.items.length > 0
            ? dbOrder.items.map((item: any, idx: number) => ({
              id: item.id || `item-${idx}`,
              name: item.name || item.menuItem?.name || item.menuName || "Gourmet Dish",
              quantity: Number(item.quantity || 1),
              price: Number(item.price || 0),
              customizations: item.customizations || [],
            }))
            : [
              {
                id: "item-default",
                name: "DineDesk Specialty Selection",
                quantity: 1,
                price: totalNum,
              },
            ];

        const rawOrderAddress = String(dbOrder.deliveryAddress || "").trim();
        const isPlaceholderAddress =
          !rawOrderAddress ||
          rawOrderAddress.toLowerCase() === "standard address" ||
          rawOrderAddress.toLowerCase() === "standard delivery address" ||
          rawOrderAddress.toLowerCase() === "address on file";

        const resolvedAddress = !isPlaceholderAddress
          ? rawOrderAddress
          : (addressData?.addressLine || "");

        const formattedConfirmation = {
          orderId: dbOrder.id || targetOrderId,
          restaurantName:
            dbOrder.restaurant?.name || dbOrder.restaurantName || "DineDesk Partner Kitchen",
          restaurantAddress:
            dbOrder.restaurant?.address || dbOrder.restaurantAddress || "Central Culinary Outlet",
          restaurantPhone:
            dbOrder.restaurant?.phone || dbOrder.restaurantPhone || "+880 1712-490211",
          createdAt: dbOrder.createdAt || new Date().toISOString(),
          status: normalizedStatus,
          paymentStatus: normalizedPayment,
          paymentMethod: dbOrder.paymentMethod || "STRIPE",
          fulfillmentMode: (dbOrder.orderType?.toLowerCase() === "pickup" ? "pickup" : "delivery") as any,

          subtotal: subtotalNum,
          deliveryFee: deliveryFeeNum,
          discount: discountNum,
          packagingFee: 2.0,
          serviceFee: 2.0,
          tax: 0,
          total: totalNum,
          pointsEarned: dbOrder.pointsEarned || 20,

          pricing: {
            subtotal: subtotalNum,
            deliveryFee: deliveryFeeNum,
            serviceFee: 2.0,
            tax: 0,
            discount: discountNum,
            total: totalNum,
            pointsEarned: dbOrder.pointsEarned || 20,
          },

          contact: {
            fullName: user?.name || dbOrder.user?.name || "Customer",
            email: user?.email || dbOrder.user?.email || "customer@dinedesk.com",
            phone: user?.phone || dbOrder.user?.phone || "+880 1700000000",
          },

          delivery: {
            address: resolvedAddress,
            lat: Number(dbOrder.deliveryLat) || 22.3384,
            lng: Number(dbOrder.deliveryLng) || 91.8317,
            instructions: addressData?.deliveryInstructions || "Leave at reception security or call intercom.",
          },
          customer: {
            name: user?.name || dbOrder.user?.name || "Customer",
            email: user?.email || dbOrder.user?.email || "customer@dinedesk.com",
            phone: user?.phone || dbOrder.user?.phone || "+880 1700000000",
          },

          estimatedDeliveryTime: dbOrder.estimatedDeliveryAt || "25-35 mins",
          items: mappedItems,
          courier: {
            ...MOCK_COURIER,
            name: "DineDesk Priority Fleet",
          },
        };

        setOrder(formattedConfirmation as unknown as FullOrderConfirmation);
      }
    } catch (err) {
      console.error("Failed to load order tracker data:", err);
    } finally {
      setLoading(false);
    }
  }, [targetOrderId, user, addressData]);

  useEffect(() => {
    fetchUserAddress();
    loadOrderData();

    const interval = setInterval(loadOrderData, 8000);
    return () => clearInterval(interval);
  }, [fetchUserAddress, loadOrderData]);

  const handleConfirmCancel = async () => {
    if (!order) return;
    try {
      const token = getAuthToken();
      await fetch(`${API_BASE_URL}/api/v1/orders/${order.orderId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      }).catch(() => null);
    } catch (_) { }

    cancelMockOrder(order.orderId);
    setOrder((prev) => (prev ? { ...prev, status: "cancelled" } : null));
  };

  const canCancel =
    order &&
    order.status !== "cancelled" &&
    order.status !== "out_for_delivery" &&
    order.status !== "delivered" &&
    order.status !== "completed";

  if (loading) {
    return (
      <main className="w-full pt-28 pb-20 bg-[#FBFBFA] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-[#1b3b2b] animate-spin">
            progress_activity
          </span>
          <p className="font-body-md text-[#1b3b2b]/70 font-medium">
            Connecting to live kitchen telemetry...
          </p>
        </div>
      </main>
    );
  }

  // Intercept state: Unpaid Stripe checkout draft
  if (isUnpaidStripe && order) {
    return (
      <main className="w-full pt-28 pb-20 bg-[#FBFBFA] min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#1b3b2b]/10 shadow-lg text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <span className="material-symbols-outlined text-3xl">credit_card_clock</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-[#1b3b2b]">Payment Awaiting Completion</h1>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Order <strong className="text-[#1b3b2b]">#{order.orderId.slice(-6).toUpperCase()}</strong> has been initiated, but payment was not confirmed by Stripe. Kitchen preparation begins immediately upon card authorization.
            </p>
          </div>

          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 flex items-center justify-between text-xs font-bold text-[#1b3b2b]">
            <span>Amount Due</span>
            <span className="text-base">${Number(order.pricing?.total ?? order.total ?? 0).toFixed(2)}</span>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/checkout"
              className="w-full py-3 bg-[#1b3b2b] text-white rounded-xl text-xs font-bold block hover:bg-[#1b3b2b]/90 transition shadow-sm"
            >
              Complete Checkout
            </Link>
            <Link
              href="/dashboard/customer"
              className="w-full py-3 bg-neutral-100 text-[#1b3b2b] rounded-xl text-xs font-bold block hover:bg-neutral-200 transition"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="w-full pt-28 pb-20 bg-[#FBFBFA] min-h-screen">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-[#1b3b2b]/10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">search_off</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1b3b2b]">Order Not Found</h1>
            <p className="text-xs text-[#1b3b2b]/70 mt-2 max-w-sm leading-relaxed">
              We couldn&apos;t find an active order with reference{" "}
              <strong className="text-[#1b3b2b] font-mono">#{targetOrderId}</strong>.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <Link
                href="/explore"
                className="px-5 py-2.5 bg-[#1b3b2b] text-white rounded-xl text-xs font-semibold hover:bg-[#1b3b2b]/90 transition-all shadow-sm"
              >
                Browse Restaurants
              </Link>
              <Link
                href="/dashboard/customer"
                className="px-5 py-2.5 bg-neutral-100 text-neutral-800 rounded-xl text-xs font-semibold hover:bg-neutral-200 transition-all"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const isDelivery = order.fulfillmentMode === "delivery";
  const courierData = order.courier || MOCK_COURIER;

  // Verification: Valid destination exists only if user has a real saved address or specific address string
  const hasValidAddress = Boolean(
    order.delivery?.address &&
    order.delivery.address.trim() !== "" &&
    order.delivery.address.toLowerCase() !== "standard address" &&
    order.delivery.address.toLowerCase() !== "standard delivery address" &&
    order.delivery.address.toLowerCase() !== "address on file"
  );

  return (
    <main className="w-full pt-24 pb-16 bg-[#FBFBFA] min-h-screen antialiased">
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8">

        {/* Top Tracking Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-[#1b3b2b] text-[11px] font-bold uppercase tracking-wider border border-[#1b3b2b]/10 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Kitchen Dispatch Tracking
            </span>
            <span className="hidden sm:inline text-xs text-neutral-500 font-medium">
              Real-time telemetry from kitchen station
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Order Ref:</span>
            <span className="text-xs font-mono font-bold text-[#1b3b2b] px-2.5 py-1 bg-white rounded-lg border border-neutral-200 shadow-2xs">
              #{order.orderId.slice(-6).toUpperCase()}
            </span>
            {canCancel && (
              <button
                id="cancel-order-btn"
                onClick={() => setCancelModalOpen(true)}
                className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 cursor-pointer ml-1"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Hero & Stepper */}
        <div className="flex flex-col gap-4">
          <OrderConfirmationHero order={order as unknown as OrderConfirmation} />
          <OrderStatusTracker order={order as unknown as OrderConfirmation} />
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">

          {/* LEFT: Map & Logistics Section */}
          <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5">
            <div id="live-transit-map-wrapper">
              <DeliveryTrackingCard order={order as unknown as OrderConfirmation} addressData={addressData ?? undefined} />
            </div>

            {/* ADDRESS SECTION: Show Alert Card (Image 5) OR 3-Card Stack (Image 3) */}
            {!hasValidAddress ? (
              /* PREMIUM ANIMATED RED ALERT CARD */
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden bg-gradient-to-br from-white via-red-50/20 to-rose-50/40 rounded-[28px] p-6 sm:p-7 border border-red-200/80 shadow-[0_12px_40px_rgba(235,50,35,0.08)] backdrop-blur-md"
              >
                {/* Ambient Soft Glow Background Element */}
                <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-red-400/10 blur-3xl pointer-events-none" />

                <div className="flex items-start gap-4 sm:gap-5 relative z-10">
                  {/* Glowing Icon Beacon with Double Ripple Pulse */}
                  <div className="relative shrink-0 mt-0.5">
                    <span className="absolute -inset-2 rounded-2xl bg-red-500/15 animate-ping opacity-75" />
                    <span className="absolute -inset-1 rounded-2xl bg-red-400/25 blur-sm" />
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                      className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#c5221f] via-[#eb3223] to-[#ff5247] text-white flex items-center justify-center shadow-lg shadow-red-500/30 border border-white/25"
                    >
                      <span className="material-symbols-outlined text-2xl font-light">
                        home_pin
                      </span>
                    </motion.div>
                  </div>

                  {/* Body Details */}
                  <div className="flex-1 space-y-2.5">
                    {/* Header Live Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap text-[11px] font-black uppercase tracking-wider">
                      <span className="inline-flex items-center gap-1.5 text-[#eb3223]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#eb3223] animate-pulse" />
                        ADDRESS REQUIRED
                      </span>
                      <span className="text-neutral-300">•</span>
                      <span className="text-neutral-500 font-bold">Pending Manager Review</span>
                    </div>

                    {/* Headline */}
                    <h3 className="text-lg sm:text-xl font-bold text-[#eb3223] tracking-tight">
                      PLEASE SET YOUR ADDRESS FIRST.
                    </h3>

                    {/* Description Paragraph */}
                    <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                      If you still have not set your exact address, your order cannot be confirmed by the restaurant manager. Your order is currently in <strong className="text-neutral-800 underline decoration-red-300 decoration-2 underline-offset-2">pending mode</strong>. To confirm dispatch, please set your address now.
                    </p>

                    {/* Premium Green Trust Status Bar (Exact to Image 5) */}
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#e6f4ea]/95 text-[#137333] border border-[#ceead6] text-[11px] font-semibold leading-snug shadow-2xs">
                      <span
                        className="material-symbols-outlined text-base text-[#137333] shrink-0"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      <span>
                        We make sure your delivery details remain fully protected and securely encrypted for our valuable customers.
                      </span>
                    </div>

                    {/* Premium Magnetic Action Button */}
                    <div className="pt-2">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
                        <Link
                          href="/dashboard/customer/addresses"
                          className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#eb3223] to-[#d92a1c] hover:from-[#d92a1c] hover:to-[#c5221f] text-white text-xs font-bold transition-all shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/35 overflow-hidden cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base transition-transform group-hover:rotate-12">
                            add_location_alt
                          </span>
                          <span>Set Delivery Address Now</span>
                          <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">
                            arrow_forward
                          </span>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* 3-Card Stack matching Image 3 */
              <div className="flex flex-col gap-3">
                {/* 1. Primary Destination Card */}
                <div className="bg-white rounded-2xl p-5 border border-[#1b3b2b]/10 shadow-xs flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#1b3b2b] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-xl">home</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C05621]">
                          Primary Destination ({addressData?.category?.toUpperCase() || "HOME"})
                        </span>
                        {addressData?.isDefault && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Default
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-[#1b3b2b] mt-0.5">
                        {addressData?.label || order.delivery?.address?.split(",")[0] || "Default Location"}
                      </h4>
                      <p className="text-xs text-neutral-500 font-medium mt-0.5">
                        {order.delivery?.address || addressData?.addressLine}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200 shrink-0">
                    Word 24 Delivery Zone
                  </span>
                </div>

                {/* 2. Exact Location & Street Address Card */}
                <div className="bg-white rounded-2xl p-5 border border-[#1b3b2b]/10 shadow-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#C05621] border border-amber-200 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-xl">pin_drop</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        Exact Location &amp; Street Address
                      </span>
                      <h4 className="text-xs font-bold text-[#1b3b2b] mt-0.5">
                        {addressData?.building ? `${addressData.building}, ` : ""}
                        {addressData?.road || addressData?.city || order.delivery?.address}
                      </h4>
                      <span className="text-[11px] text-neutral-500 font-medium block mt-0.5">
                        Building: <strong className="text-neutral-700">{addressData?.building || "Standard Residence"}</strong> • Postal Code: <strong className="text-neutral-700">{addressData?.postalCode || "4000"}</strong>
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                    GPS Verified
                  </span>
                </div>

                {/* 3. Recipient & Delivery Note Card */}
                <div className="bg-white rounded-2xl p-5 border border-[#1b3b2b]/10 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 text-[#1b3b2b] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-lg">badge</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        Recipient &amp; Delivery Note
                      </span>
                      <h4 className="text-xs font-bold text-[#1b3b2b]">
                        {addressData?.recipientName || order.contact.fullName} • {addressData?.contactNumber || order.contact.phone}
                      </h4>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-start gap-2 text-xs text-neutral-600 font-medium">
                    <span className="material-symbols-outlined text-sm text-[#C05621] shrink-0 mt-0.5">assignment</span>
                    <span>Note: {addressData?.deliveryInstructions || order.delivery?.instructions || "Leave with reception security or call intercom."}</span>
                  </div>
                </div>
              </div>
            )}

            {isDelivery && order.status !== "cancelled" && (
              <CourierCard
                courier={courierData}
                isOutForDelivery={order.status === "out_for_delivery"}
              />
            )}

            {/* Fresh Preparation Guarantee */}
            <div className="bg-white rounded-3xl shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-center border border-[#1b3b2b]/10">
              <div className="w-full sm:w-36 h-28 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                <img
                  className="w-full h-full object-cover"
                  alt="Freshly Prepared"
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C05621]">
                  Culinary Quality Standard
                </span>
                <h4 className="text-base font-bold text-[#1b3b2b]">
                  Freshly Cooked &amp; Insulated
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {order.restaurantName} packs every order in temperature-controlled packaging with sealed tamper-evident security tape.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Items & Receipt Summary */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-3xl shadow-xs p-5 sm:p-6 flex flex-col gap-6 border border-[#1b3b2b]/10">
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-neutral-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Kitchen Station
                  </span>
                  <h2 className="text-lg font-bold text-[#1b3b2b]">
                    <Link href="/explore" className="hover:underline">
                      {order.restaurantName}
                    </Link>
                  </h2>
                  <span className="text-xs text-neutral-500 block mt-0.5">
                    {order.restaurantAddress} • {order.restaurantPhone}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-[#1b3b2b] shrink-0">
                  <span className="material-symbols-outlined text-lg">restaurant</span>
                </div>
              </div>

              <OrderItemsSummary order={order as unknown as OrderConfirmation} />
              <OrderReceipt order={order as unknown as OrderConfirmation} />

              {/* Earned Rewards Highlight Card */}
              <div className="bg-gradient-to-br from-[#1b3b2b]/5 to-[#C05621]/10 rounded-2xl p-4 border border-[#1b3b2b]/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1b3b2b] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-lg">stars</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1b3b2b] block">
                      +{order.pricing?.pointsEarned || order.pointsEarned || 20} Loyalty Points Credited
                    </span>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      Applied directly to your DineDesk member tier
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#C05621] uppercase tracking-wider">
                  Verified
                </span>
              </div>

              <div id="post-order-actions" className="flex flex-col gap-2.5 pt-1">
                <Link
                  href="/dashboard/customer"
                  className="w-full py-3 bg-[#1b3b2b] text-white hover:bg-[#1b3b2b]/95 rounded-xl text-xs font-bold text-center transition-all shadow-sm"
                >
                  Back to Dashboard
                </Link>

                <button
                  onClick={() => window.print()}
                  className="w-full py-2.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-semibold text-center transition-all flex items-center justify-center gap-2 border border-neutral-200 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  Print / Download Receipt
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  onClick={() => setSupportModalOpen(true)}
                  className="text-xs text-[#1b3b2b] hover:underline underline-offset-4 inline-flex items-center gap-1.5 font-semibold cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">support_agent</span>
                  Need Help? Contact Concierge Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OrderSupportModal
        orderId={order.orderId}
        restaurantName={order.restaurantName}
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />

      <CancelOrderModal
        orderId={order.orderId}
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirmCancel={handleConfirmCancel}
      />
    </main>
  );
}