"use client";

import { OrderConfirmation } from "@/types/order";

interface OrderItemsSummaryProps {
  order: OrderConfirmation;
}

export default function OrderItemsSummary({ order }: OrderItemsSummaryProps) {
  return (
    <div className="flex flex-col gap-space-md">
      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
        Ordered Dishes ({order.items.reduce((acc, i) => acc + i.quantity, 0)} items)
      </span>

      <div className="flex flex-col gap-space-sm">
        {order.items.map((item) => {
          const lineTotal = item.price * item.quantity;
          return (
            <div
              key={item.id}
              className="flex items-start justify-between gap-space-sm bg-surface-container-low p-space-sm rounded-lg border border-outline-variant/30"
            >
              <div className="flex items-start gap-space-sm">
                <span className="w-7 h-7 rounded bg-surface-container-highest text-primary font-label-md text-label-md font-bold flex items-center justify-center shrink-0">
                  {item.quantity}×
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-sm text-sm sm:text-base text-on-surface font-semibold">
                    {item.name}
                  </span>
                  {item.description && (
                    <span className="font-body-sm text-[12px] text-on-surface-variant line-clamp-2">
                      {item.description}
                    </span>
                  )}
                  <span className="text-[11px] text-outline mt-0.5">
                    ৳{item.price.toLocaleString()} each
                  </span>
                </div>
              </div>

              <span className="font-label-lg text-label-lg font-semibold text-primary whitespace-nowrap ml-2">
                ৳{lineTotal.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
