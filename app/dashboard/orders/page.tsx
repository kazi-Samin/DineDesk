"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMockOrders } from "@/services/mockOrderService";
import { OrderConfirmation } from "@/types/order";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderConfirmation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOrders(getMockOrders());
    setLoading(false);
  }, []);

  return (
    <main className="w-full pt-28 pb-20 bg-surface min-h-screen">
      <div className="max-w-[1000px] mx-auto px-margin">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/40">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
              Account Orders
            </span>
            <h1 className="font-headline-lg text-headline-lg text-primary mt-1">
              My Dining &amp; Delivery Orders
            </h1>
            <p className="font-body-sm text-on-surface-variant">
              Complete chronological audit of your simulated DineDesk orders.
            </p>
          </div>

          <Link
            href="/explore"
            className="px-space-lg py-space-sm bg-primary-container text-on-primary hover:bg-primary rounded font-label-md font-semibold text-center transition-colors"
          >
            Order New Meal
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <span className="material-symbols-outlined text-3xl animate-spin text-primary">
              progress_activity
            </span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-surface-container-lowest p-12 rounded-xl text-center mt-6 border border-outline-variant">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
              receipt_long
            </span>
            <h3 className="font-headline-sm text-primary">No Orders Found</h3>
            <p className="text-body-sm text-on-surface-variant mt-1">
              You haven&apos;t placed any orders yet in this browser session.
            </p>
            <Link
              href="/explore"
              className="inline-block mt-4 px-6 py-2.5 bg-primary-container text-on-primary rounded font-semibold text-sm"
            >
              Discover Restaurants
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-6">
            {orders.map((order) => {
              const statusColor =
                order.status === "delivered" || order.status === "completed"
                  ? "bg-primary-container/10 text-primary-container"
                  : order.status === "cancelled"
                  ? "bg-error/10 text-error"
                  : "bg-secondary/10 text-secondary";

              return (
                <div
                  key={order.orderId}
                  className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary-container/40 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center shrink-0 text-primary-container">
                      <span className="material-symbols-outlined text-2xl">
                        {order.fulfillmentMode === "delivery"
                          ? "two_wheeler"
                          : order.fulfillmentMode === "takeaway"
                          ? "takeout_dining"
                          : "table_restaurant"}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-headline-sm text-base md:text-lg text-primary font-bold">
                          {order.restaurantName}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${statusColor}`}
                        >
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      <p className="text-body-sm text-on-surface-variant mt-0.5">
                        Order #{order.orderId} • {order.items.reduce((s, i) => s + i.quantity, 0)} items •{" "}
                        {order.items.map((i) => i.name).slice(0, 2).join(", ")}
                        {order.items.length > 2 ? "..." : ""}
                      </p>

                      <p className="text-[12px] text-outline mt-1">
                        Mode: <span className="capitalize font-medium text-on-surface">{order.fulfillmentMode}</span> • Placed {order.timeline?.placedAt || "recently"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-outline-variant/30">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-on-surface-variant block">Total Bill</span>
                      <span className="font-headline-sm text-lg font-bold text-primary">
                        ৳{order.total.toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/order-confirmation/${order.orderId}`}
                      className="px-4 py-2 bg-primary text-on-primary hover:bg-primary-container rounded font-label-sm font-semibold text-xs tracking-wider uppercase transition-colors"
                    >
                      Track / View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
