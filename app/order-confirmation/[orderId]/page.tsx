"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getMockOrder,
  updateMockOrderStatus,
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
import DevMockTrackingBar from "@/components/orders/DevMockTrackingBar";

interface OrderConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://dine-desk-backend.vercel.app"
).replace(/\/+$/, "");

const getAuthToken = () => {
  if (typeof window === "undefined") return "";

  const match = document.cookie.match(
    /(?:^|;\s*)(?:token|dinedesk_auth_token|better-auth\.session_token|auth_token|accessToken)=([^;]+)/
  );
  if (match && match[1]) return match[1].trim();

  const storedToken =
    localStorage.getItem("token") ||
    localStorage.getItem("dinedesk_auth_token") ||
    localStorage.getItem("accessToken") ||
    "";

  return storedToken.trim();
};

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;
  const router = useRouter();

  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function resolveOrder() {
      try {
        // 1. Try local mock order first (for demo / dev mode)
        const mockFound = getMockOrder(orderId);
        if (mockFound) {
          if (isMounted) {
            setOrder(mockFound);
            setLoading(false);
          }
          return;
        }

        // 2. Fetch live order from PostgreSQL backend
        const token = getAuthToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        let dbOrder: any = null;

        const singleRes = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}`, {
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
              (o: any) => o.id === orderId || o.orderId === orderId
            );
          }
        }

        if (dbOrder && isMounted) {
          // Normalize status
          const rawStatus = String(dbOrder.status || "PENDING").toLowerCase();
          let normalizedStatus: OrderStatus = "confirmed" as OrderStatus;

          if (rawStatus === "delivered") {
            normalizedStatus = "delivered" as OrderStatus;
          } else if (rawStatus === "out_for_delivery") {
            normalizedStatus = "out_for_delivery" as OrderStatus;
          } else if (rawStatus === "preparing") {
            normalizedStatus = "preparing" as OrderStatus;
          } else if (rawStatus === "cancelled" || rawStatus === "rejected") {
            normalizedStatus = "cancelled" as OrderStatus;
          } else if (rawStatus === "pending" || rawStatus === "placed") {
            normalizedStatus = "confirmed" as OrderStatus;
          }

          const rawPaymentStatus = String(dbOrder.paymentStatus || "UNPAID").toLowerCase();
          const normalizedPayment: PaymentStatus =
            rawPaymentStatus === "paid" ? "paid" : "pending";

          const subtotalNum = Number(dbOrder.subtotal || dbOrder.total || 0);
          const deliveryFeeNum = Number(dbOrder.deliveryFee || 0);
          const discountNum = Number(dbOrder.discount || 0);
          const totalNum = Number(dbOrder.total || subtotalNum + deliveryFeeNum - discountNum);

          const mappedItems =
            Array.isArray(dbOrder.items) && dbOrder.items.length > 0
              ? dbOrder.items.map((item: any, idx: number) => ({
                id: item.id || `item-${idx}`,
                name: item.name || item.menuItem?.name || item.menuName || "Culinary Item",
                quantity: Number(item.quantity || 1),
                price: Number(item.price || 0),
                customizations: item.customizations || [],
              }))
              : [
                {
                  id: "item-default",
                  name: "DineDesk Specialty Selection",
                  quantity: 1,
                  price: subtotalNum > 0 ? subtotalNum : totalNum,
                },
              ];

          const formattedConfirmation = {
            orderId: dbOrder.id || orderId,
            restaurantName:
              dbOrder.restaurant?.name ||
              dbOrder.restaurantName ||
              "DineDesk Central Kitchen",
            restaurantAddress:
              dbOrder.restaurant?.address ||
              dbOrder.restaurantAddress ||
              "Central Kitchen, DineDesk Hub",
            restaurantPhone:
              dbOrder.restaurant?.phone ||
              dbOrder.restaurantPhone ||
              "+880 1712-490211",
            createdAt: dbOrder.createdAt || new Date().toISOString(),
            status: normalizedStatus,
            paymentStatus: normalizedPayment,
            paymentMethod: dbOrder.paymentMethod || "STRIPE",
            fulfillmentMode: (dbOrder.orderType?.toLowerCase() === "pickup"
              ? "pickup"
              : "delivery") as any,

            // Direct root pricing fields expected by OrderReceipt.tsx
            subtotal: subtotalNum,
            discount: discountNum,
            deliveryFee: deliveryFeeNum,
            serviceFee: 2.0,
            tax: 0,
            total: totalNum,
            pointsEarned: dbOrder.pointsEarned || 20,

            // Nested pricing object for components expecting pricing.*
            pricing: {
              subtotal: subtotalNum,
              deliveryFee: deliveryFeeNum,
              serviceFee: 2.0,
              tax: 0,
              discount: discountNum,
              total: totalNum,
              pointsEarned: dbOrder.pointsEarned || 20,
            },

            // Contact properties required by OrderConfirmationHero.tsx
            contact: {
              fullName: dbOrder.user?.name || "FOURKAN",
              email: dbOrder.user?.email || "pinonfurkan1@gmail.com",
              phone: dbOrder.user?.phone || "+880 1680224284",
            },

            // Delivery & address properties required by DeliveryTrackingCard & maps
            deliveryAddress:
              dbOrder.deliveryAddress || "FOURKAN's Default Address",
            delivery: {
              address: dbOrder.deliveryAddress || "FOURKAN's Default Address",
              lat: dbOrder.deliveryLat || 22.3384,
              lng: dbOrder.deliveryLng || 91.8317,
              instructions: "Deliver to front entrance",
            },
            customer: {
              name: dbOrder.user?.name || "FOURKAN",
              email: dbOrder.user?.email || "pinonfurkan1@gmail.com",
              phone: dbOrder.user?.phone || "+880 1680224284",
            },

            estimatedDeliveryTime:
              dbOrder.estimatedDeliveryAt || "25-35 mins",
            items: mappedItems,
            courier: {
              ...MOCK_COURIER,
              name: "DineDesk Priority Fleet",
            },
          };

          setOrder(formattedConfirmation as unknown as OrderConfirmation);
        }
      } catch (err) {
        console.error("Failed to load order tracker data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    resolveOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  // Dev status switcher
  const handleDevStatusChange = (newStatus: OrderStatus, paymentStatus?: PaymentStatus) => {
    if (!order) return;
    const updated = updateMockOrderStatus(order.orderId, newStatus, paymentStatus);
    if (updated) {
      setOrder(updated);
    } else {
      setOrder((prev) =>
        prev
          ? {
            ...prev,
            status: newStatus,
            paymentStatus: paymentStatus || prev.paymentStatus,
          }
          : null
      );
    }
  };

  // Order cancellation
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
      <main className="w-full pt-28 pb-20 bg-surface min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary-container animate-spin">
            progress_activity
          </span>
          <p className="font-body-md text-on-surface-variant font-medium">
            Fetching order details...
          </p>
        </div>
      </main>
    );
  }

  // 404 / Order Not Found State
  if (!order) {
    return (
      <main className="w-full pt-28 pb-20 bg-surface min-h-screen">
        <div className="max-w-xl mx-auto px-margin text-center">
          <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-md border border-outline-variant flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center mb-space-md">
              <span className="material-symbols-outlined text-4xl">search_off</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary">Order Not Found</h1>
            <p className="font-body-md text-on-surface-variant mt-2 max-w-md">
              We couldn&apos;t find an order with reference{" "}
              <strong className="text-on-surface font-mono">#{orderId}</strong> in your current session records.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-space-lg">
              <Link
                href="/explore"
                className="px-space-lg py-space-sm bg-primary-container text-on-primary rounded font-label-md font-semibold hover:bg-primary transition-colors"
              >
                Browse Restaurants
              </Link>
              <Link
                href="/dashboard/customer"
                className="px-space-lg py-space-sm bg-surface-container-high text-on-surface rounded font-label-md font-semibold hover:bg-surface-container-highest transition-colors"
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

  return (
    <main className="w-full pt-20 bg-surface min-h-screen">
      <style jsx global>{`
        @media print {
          header,
          footer,
          aside,
          #dev-mock-bar,
          #floating-tablemate-btn,
          #post-order-actions,
          #cancel-order-btn,
          #live-transit-map-wrapper,
          #cookie-banner {
            display: none !important;
          }
          body,
          main {
            padding-top: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .print-receipt-header {
            display: block !important;
            margin-bottom: 20px;
          }
        }
      `}</style>

      <div className="flex flex-col w-full">
        <div className="w-full max-w-[1280px] mx-auto px-margin py-space-lg flex flex-col gap-space-lg">
          {/* Dev Mock Tracking Controls */}
          <div id="dev-mock-bar">
            <DevMockTrackingBar order={order} onStatusChange={handleDevStatusChange} />
          </div>

          {/* Top Context & Live Signal */}
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="inline-flex items-center gap-1.5 px-space-md py-1 bg-surface-container-high rounded text-primary-container font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                Live Order Tracking
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Updated real-time via DineDesk Fleet
              </span>
            </div>

            <div className="flex items-center gap-space-sm">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Order ref:</span>
              <span className="font-label-md text-label-md font-semibold text-primary px-2.5 py-1 bg-surface-container-lowest rounded shadow-sm border border-outline-variant/30">
                #{order.orderId}
              </span>
              {canCancel && (
                <button
                  id="cancel-order-btn"
                  onClick={() => setCancelModalOpen(true)}
                  className="px-2.5 py-1 text-[11px] font-label-sm uppercase tracking-wider text-error hover:bg-error/10 rounded transition-colors cursor-pointer font-bold border border-error/30 ml-2"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Celebration & Status Hero */}
          <div className="flex flex-col">
            <OrderConfirmationHero order={order} />
            <OrderStatusTracker order={order} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            {/* LEFT COLUMN: Map & Logistics */}
            <div className="lg:col-span-7 flex flex-col gap-space-lg">
              <div id="live-transit-map-wrapper">
                <DeliveryTrackingCard order={order} />
              </div>

              {isDelivery && order.status !== "cancelled" && (
                <CourierCard
                  courier={courierData}
                  isOutForDelivery={order.status === "out_for_delivery"}
                />
              )}

              <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col sm:flex-row gap-space-lg items-center border border-outline-variant/40">
                <div className="w-full sm:w-44 h-32 rounded-lg overflow-hidden shrink-0 shadow-inner">
                  <img
                    className="w-full h-full object-cover"
                    alt="Kitchen preparation"
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                    Kitchen Preparation
                  </span>
                  <h4 className="font-headline-sm text-headline-sm text-primary">
                    Freshly Prepared Order
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {order.restaurantName} prepares each dish fresh to order and packs it in insulated packaging to keep your food hot and fresh during transit.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Order Items & Receipt Breakdown */}
            <div className="lg:col-span-5 flex flex-col gap-space-lg">
              <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-lg border border-outline-variant/40">
                <div className="flex items-start justify-between gap-space-sm pb-space-sm border-b border-outline-variant/30">
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                      Restaurant Details
                    </span>
                    <h2 className="font-headline-sm text-headline-sm text-primary font-display">
                      <Link href="/explore" className="hover:underline">
                        {order.restaurantName}
                      </Link>
                    </h2>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {order.restaurantAddress} • {order.restaurantPhone}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined">restaurant</span>
                  </div>
                </div>

                <OrderItemsSummary order={order} />
                <OrderReceipt order={order} />

                <div id="post-order-actions" className="flex flex-col gap-space-sm pt-space-xs">
                  <Link
                    href="/dashboard/customer"
                    className="w-full py-3 px-space-md bg-primary text-on-primary hover:bg-primary-container rounded-lg font-label-md text-label-md font-semibold text-center transition-all shadow-sm"
                  >
                    Back to Dashboard
                  </Link>

                  <button
                    onClick={() => window.print()}
                    className="w-full py-3 px-space-md bg-surface-container-lowest text-primary hover:bg-surface-container rounded-lg font-label-md text-label-md font-semibold text-center transition-all shadow-sm flex items-center justify-center gap-2 border border-outline-variant/40 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-base">print</span>
                    Print / Download PDF Receipt
                  </button>
                </div>

                <div className="text-center pt-space-xs">
                  <button
                    onClick={() => setSupportModalOpen(true)}
                    className="font-body-sm text-body-sm text-primary hover:underline underline-offset-4 inline-flex items-center gap-1.5 font-medium cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-sm">support_agent</span>
                    Need Help with this Order? Contact Support
                  </button>
                </div>
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