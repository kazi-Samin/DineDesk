"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  params: Promise<{ orderId: string }>;
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

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://dine-desk-backend.vercel.app"
).replace(/\/+$/, "");

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
  const orderId = resolvedParams.orderId;
  const router = useRouter();
  const { user } = useAuth();

  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Address state: null when user has never configured a saved address
  const [addressData, setAddressData] = useState<UserAddressData | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchUserRealAddress() {
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
            if (isMounted) {
              setAddressData({
                ...def,
                label: def.label || "Chattogram, Bangladesh",
                recipientName: def.recipientName || user?.name || "FOURKAN BIN ILIAS",
                contactNumber: def.contactNumber || user?.phone || "+880 1680224284",
                category: def.category || "home",
                apartment: def.apartment || "Shofi Villa",
                building: def.building || "House 721, Word 24",
                road: def.road || "Rongipara",
                city: def.city || "Chattogram",
                postalCode: def.postalCode || "4126",
                deliveryInstructions:
                  def.deliveryInstructions || "Leave with reception security or call intercom.",
                addressLine:
                  def.addressLine ||
                  `${def.apartment || ""}, ${def.building || ""}, ${def.road || ""}, ${def.city || ""}`.replace(/^, |, $/g, ""),
              });
              return;
            }
          }
        }

        // Check fallback local profile
        if (typeof window !== "undefined") {
          const localProfile = localStorage.getItem("dinedesk_customer_profile");
          if (localProfile) {
            const parsed = JSON.parse(localProfile);
            if (parsed.deliveryAddress) {
              setAddressData({
                addressLine: parsed.deliveryAddress,
                apartment: "Customer Address",
                road: "Local Route",
                city: "Local",
                recipientName: user?.name || "FOURKAN",
                contactNumber: user?.phone || "+880 1680224284",
              });
              return;
            }
          }
        }

        // If no addresses found anywhere, set to null
        if (isMounted) {
          setAddressData(null);
        }
      } catch (err) {
        console.error("Address fetch error:", err);
        if (isMounted) setAddressData(null);
      }
    }

    async function loadOrderData() {
      try {
        await fetchUserRealAddress();

        const mockFound = getMockOrder(orderId);
        if (mockFound) {
          if (isMounted) {
            setOrder({
              ...mockFound,
              contact: {
                ...mockFound.contact,
                fullName: user?.name || mockFound.contact?.fullName || "FOURKAN",
              },
            });
            setLoading(false);
          }
          return;
        }

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
              (o: any) => o.id === orderId || o.orderId === orderId || o._id === orderId
            );
          }
        }

        if (dbOrder && isMounted) {
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

          const formattedConfirmation = {
            orderId: dbOrder.id || orderId,
            restaurantName:
              dbOrder.restaurant?.name ||
              dbOrder.restaurantName ||
              "DineDesk Central Kitchen",
            restaurantAddress:
              dbOrder.restaurant?.address ||
              dbOrder.restaurantAddress ||
              "Central Kitchen, Agrabad, Chattogram",
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

            subtotal: subtotalNum,
            discount: discountNum,
            deliveryFee: deliveryFeeNum,
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
              fullName: user?.name || dbOrder.user?.name || "FOURKAN",
              email: user?.email || dbOrder.user?.email || "pinonfurkan1@gmail.com",
              phone: user?.phone || dbOrder.user?.phone || "+880 1680224284",
            },

            deliveryAddress: addressData?.addressLine || dbOrder.deliveryAddress || "Awaiting Customer Address",
            delivery: {
              address: addressData?.addressLine || dbOrder.deliveryAddress || "Awaiting Customer Address",
              lat: 22.3384,
              lng: 91.8317,
              instructions: addressData?.deliveryInstructions || "Leave with reception security or call intercom.",
            },
            customer: {
              name: user?.name || "FOURKAN",
              email: user?.email || "pinonfurkan1@gmail.com",
              phone: user?.phone || "+880 1680224284",
            },

            estimatedDeliveryTime: dbOrder.estimatedDeliveryAt || "25-35 mins",
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

    loadOrderData();

    return () => {
      isMounted = false;
    };
  }, [orderId, user]);

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
            Fetching order tracking...
          </p>
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
              We couldn&apos;t find an order with reference{" "}
              <strong className="text-[#1b3b2b] font-mono">#{orderId}</strong>.
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

  return (
    <main className="w-full pt-24 pb-16 bg-[#FBFBFA] min-h-screen antialiased">
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8">

        {/* Top Tracking Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-[#1b3b2b] text-[11px] font-bold uppercase tracking-wider border border-[#1b3b2b]/10 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Order Tracking
            </span>
            <span className="hidden sm:inline text-xs text-neutral-500 font-medium">
              Real-time dispatch updates
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Order Ref:</span>
            <span className="text-xs font-mono font-bold text-[#1b3b2b] px-2.5 py-1 bg-white rounded-lg border border-neutral-200 shadow-2xs">
              #{order.orderId}
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
          <OrderConfirmationHero order={order} />
          <OrderStatusTracker order={order} />
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">

          {/* LEFT: Map & Logistics Section */}
          <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5">
            <div id="live-transit-map-wrapper">
              <DeliveryTrackingCard order={order} addressData={addressData ?? undefined} />
            </div>

            {/* CONDITIONAL ADDRESS PRESENTATION: ALERT IF NULL, 3 CARDS IF SET */}
            {!addressData ? (
              <div className="relative overflow-hidden bg-gradient-to-br from-red-50/90 via-white to-red-50/40 rounded-3xl p-6 sm:p-7 border-2 border-red-300 shadow-sm transition-all animate-in fade-in zoom-in-95 duration-300">
                {/* Background ambient decorative warning glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-200/30 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start gap-5 relative z-10">
                  {/* Animated Alert Beacon Icon */}
                  <div className="relative shrink-0 mt-0.5">
                    <span className="absolute -inset-1 rounded-2xl bg-red-400 opacity-30 animate-ping" />
                    <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-2xl animate-pulse">
                        wrong_location
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-red-100 text-red-700 border border-red-200">
                        Address Required
                      </span>
                      <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        Pending Manager Review
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold text-red-700 tracking-tight mt-1.5">
                      Please Set your address first.
                    </h3>

                    <p className="text-xs sm:text-[13px] text-red-900/90 font-medium leading-relaxed mt-1">
                      If you still have not set your exact address, your order cannot be confirmed by the restaurant manager. Your order is currently in <span className="font-bold underline decoration-red-400 decoration-2">pending mode</span>. To confirm dispatch, please set your address now.
                    </p>

                    {/* Privacy & Security Guarantee Note */}
                    <div className="mt-3.5 p-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-red-200/80 flex items-center gap-2.5 shadow-2xs">
                      <span className="material-symbols-outlined text-base text-emerald-700 shrink-0">
                        verified_user
                      </span>
                      <p className="text-[11px] text-neutral-600 font-medium leading-tight">
                        We make sure your delivery details remain <span className="font-bold text-neutral-900">fully protected and securely encrypted</span> for our valuable customers.
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-1">
                      <Link
                        href="/dashboard/customer/addresses"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-sm shadow-red-200 group"
                      >
                        <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">
                          add_location_alt
                        </span>
                        Set Delivery Address Now
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* CARD 1: PRIMARY DESTINATION */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#1b3b2b]/10 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#1b3b2b] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <span className="material-symbols-outlined text-xl">home</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C05621]">
                          Primary Destination ({addressData.category || "Home"})
                        </span>
                        {addressData.isDefault && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Default
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-extrabold text-[#1b3b2b] mt-0.5">
                        {addressData.apartment}, {addressData.road}
                      </h4>
                      <p className="text-xs text-neutral-500 font-medium">
                        {addressData.label || `${addressData.city}, Bangladesh`}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-neutral-700 bg-[#FBFBFA] px-3 py-1 rounded-xl border border-neutral-200/70 self-start sm:self-auto shrink-0">
                    Word 24 Delivery Zone
                  </span>
                </div>

                {/* CARD 2: EXACT DISPATCH LOCATION */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#1b3b2b]/10 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#C05621]/10 text-[#C05621] flex items-center justify-center shrink-0 border border-[#C05621]/20">
                      <span className="material-symbols-outlined text-xl">pin_drop</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Exact Location &amp; Street Address
                      </span>
                      <h4 className="text-sm font-bold text-[#1b3b2b] mt-0.5 leading-snug">
                        {addressData.addressLine}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-neutral-500 font-medium">
                        <span className="bg-[#FBFBFA] px-2.5 py-0.5 rounded-lg border border-neutral-200/60 font-semibold text-neutral-700">
                          Building: {addressData.building}
                        </span>
                        <span className="bg-[#FBFBFA] px-2.5 py-0.5 rounded-lg border border-neutral-200/60 font-mono font-semibold text-neutral-700">
                          Postal Code: {addressData.postalCode}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 self-start sm:self-auto shrink-0">
                    GPS Verified
                  </span>
                </div>

                {/* CARD 3: RECIPIENT & DELIVERY INSTRUCTIONS */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#1b3b2b]/10 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 w-full">
                    <div className="w-10 h-10 rounded-2xl bg-[#1b3b2b]/5 text-[#1b3b2b] flex items-center justify-center shrink-0 border border-[#1b3b2b]/10">
                      <span className="material-symbols-outlined text-xl">person_pin</span>
                    </div>
                    <div className="flex flex-col w-full">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Recipient &amp; Delivery Note
                      </span>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <h4 className="text-sm font-bold text-[#1b3b2b]">
                          {addressData.recipientName}
                        </h4>
                        <span className="text-xs text-neutral-400">•</span>
                        <span className="text-xs font-mono font-semibold text-[#1b3b2b]">
                          {addressData.contactNumber}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 font-medium mt-2 bg-[#FBFBFA] p-3 rounded-2xl border border-neutral-100 flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-xs text-[#C05621] mt-0.5 shrink-0">
                          sticky_note_2
                        </span>
                        <span>
                          Note: {addressData.deliveryInstructions || "Leave with reception security or call intercom."}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </>
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
                  Freshly Cooked &amp; Sealed
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {order.restaurantName} packs every dish inside temperature-controlled insulated packaging with tamper-proof seal tape.
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
                  <span className="text-xs text-neutral-500">
                    {order.restaurantAddress} • {order.restaurantPhone}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-[#1b3b2b] shrink-0">
                  <span className="material-symbols-outlined text-lg">restaurant</span>
                </div>
              </div>

              <OrderItemsSummary order={order} />
              <OrderReceipt order={order} />

              {/* Earned Rewards Highlight Card */}
              <div className="bg-gradient-to-br from-[#1b3b2b]/5 to-[#C05621]/10 rounded-2xl p-4 border border-[#1b3b2b]/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1b3b2b] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-lg">stars</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1b3b2b] block">
                      +20 Loyalty Points Earned
                    </span>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      Credited directly to your diner rewards tier
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-[#C05621] uppercase tracking-wider">
                  Active
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
                  Print / Download PDF Receipt
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