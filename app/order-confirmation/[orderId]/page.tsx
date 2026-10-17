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

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;
  const router = useRouter();

  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  useEffect(() => {
    // Load order by orderId
    const found = getMockOrder(orderId);
    if (found) {
      setOrder(found);
    }
    setLoading(false);
  }, [orderId]);

  // Dev state switcher
  const handleDevStatusChange = (newStatus: OrderStatus, paymentStatus?: PaymentStatus) => {
    if (!order) return;
    const updated = updateMockOrderStatus(order.orderId, newStatus, paymentStatus);
    if (updated) {
      setOrder(updated);
    }
  };

  // Order cancellation
  const handleConfirmCancel = () => {
    if (!order) return;
    const updated = cancelMockOrder(order.orderId);
    if (updated) {
      setOrder(updated);
    }
  };

  // Check if order can be cancelled (pending or confirmed)
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
                href="/dashboard/orders"
                className="px-space-lg py-space-sm bg-surface-container-high text-on-surface rounded font-label-md font-semibold hover:bg-surface-container-highest transition-colors"
              >
                Order History
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
      {/* Print Specific Stylings */}
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
          {/* Dev Mock Tracking Controls (Development & Prototype Simulation) */}
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

          {/* Celebration & Status Hero with Integrated Stepper */}
          <div className="flex flex-col">
            <OrderConfirmationHero order={order} />
            <OrderStatusTracker order={order} />
          </div>

          {/* Main Content 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            {/* LEFT COLUMN: Map & Logistics (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-space-lg">
              {/* Delivery Tracking / Pickup Location */}
              <div id="live-transit-map-wrapper">
                <DeliveryTrackingCard order={order} />
              </div>

              {/* Courier Card (Shows for delivery when dispatched / out for delivery or preparing) */}
              {isDelivery && order.status !== "cancelled" && (
                <CourierCard
                  courier={courierData}
                  isOutForDelivery={order.status === "out_for_delivery"}
                />
              )}

              {/* Kitchen Visual Chronicle / Preparation Spotlight */}
              <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col sm:flex-row gap-space-lg items-center border border-outline-variant/40">
                <div className="w-full sm:w-44 h-32 rounded-lg overflow-hidden shrink-0 shadow-inner">
                  <img
                    className="w-full h-full object-cover"
                    alt="Traditional Bengali Dum Kacchi Biryani cooked in brass handi"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJq_BIGeRh7asvUEwulDsgwYADl4ReFd7wVPOHCkC6WfPynWNgRKObHdkcFhYKERWIIGoYTaVeKeZ2muyJS8Z-d9FTj8iGJ6752xAa5Y7gczu6VrnDbMUjtxJYNA6cuoozomIMSdrWOE1HD7gsqFiPimXyPa_h4NZykLThvxvWamPfRyUKpoh017W8JLPgfodsAlhPUphXBQ7cDUtA-9K-1W4LO_A1zbdiuAtshihfNDe4VzuIjHlQow"
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

            {/* RIGHT COLUMN: Order Items & Receipt Breakdown (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-space-lg">
              {/* Detailed Order Summary Card */}
              <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-lg border border-outline-variant/40">
                {/* Restaurant Details Header */}
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
                      {order.restaurantAddress || "Banani Road 11, Dhaka"} •{" "}
                      {order.restaurantPhone || "+880 1712-490211"}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined">restaurant</span>
                  </div>
                </div>

                {/* Items List */}
                <OrderItemsSummary order={order} />

                {/* Billing Breakdown */}
                <OrderReceipt order={order} />

                {/* Post-Order Action Row */}
                <div id="post-order-actions" className="flex flex-col gap-space-sm pt-space-xs">
                  <Link
                    href="/dashboard/orders"
                    className="w-full py-3 px-space-md bg-primary text-on-primary hover:bg-primary-container rounded-lg font-label-md text-label-md font-semibold text-center transition-all shadow-sm"
                  >
                    View Order History
                  </Link>

                  <button
                    onClick={() => window.print()}
                    className="w-full py-3 px-space-md bg-surface-container-lowest text-primary hover:bg-surface-container rounded-lg font-label-md text-label-md font-semibold text-center transition-all shadow-sm flex items-center justify-center gap-2 border border-outline-variant/40 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-base">print</span>
                    Print / Download PDF Receipt
                  </button>

                  <Link
                    href="/explore"
                    className="w-full py-2.5 px-space-md bg-surface-container-low text-on-surface hover:bg-surface-container-high rounded-lg font-label-md text-label-md font-medium text-center transition-all"
                  >
                    Continue Browsing Restaurants
                  </Link>
                </div>

                {/* Support & Concierge Link */}
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

              {/* Safe Handling Guarantee Card */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex items-center gap-space-md border border-outline-variant/30">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">verified_user</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    100% Quality &amp; Temperature Guarantee
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Every package is sealed with a tamper-evident DineDesk security band. If the seal is compromised, report immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Modal */}
      <OrderSupportModal
        orderId={order.orderId}
        restaurantName={order.restaurantName}
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />

      {/* Cancel Order Modal */}
      <CancelOrderModal
        orderId={order.orderId}
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirmCancel={handleConfirmCancel}
      />
    </main>
  );
}
