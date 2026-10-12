"use client";

import { OrderConfirmation } from "@/types/order";

interface OrderReceiptProps {
  order: OrderConfirmation;
}

export default function OrderReceipt({ order }: OrderReceiptProps) {
  const getPaymentDetails = () => {
    if (order.paymentMethod === "cod") {
      return {
        label: "Cash on Delivery",
        statusText: "Pay upon courier arrival",
        icon: "payments",
        badge: "Due on Delivery",
        badgeColor: "text-secondary",
      };
    }
    if (order.paymentMethod === "mfs") {
      return {
        label: "bKash / Nagad Direct Checkout",
        statusText: "Demo MFS transaction confirmed",
        icon: "account_balance_wallet",
        badge: "Settled",
        badgeColor: "text-primary-container",
      };
    }
    return {
      label: "Visa / Mastercard Demo Card",
      statusText: "Authorized & Settled",
      icon: "credit_card",
      badge: "Settled",
      badgeColor: "text-primary-container",
    };
  };

  const payment = getPaymentDetails();

  return (
    <div className="flex flex-col gap-space-md">
      {/* Billing Breakdown */}
      <div className="flex flex-col gap-space-xs bg-surface-container rounded-lg p-space-md border border-outline-variant/30">
        <div className="flex justify-between items-center font-body-sm text-body-sm text-on-surface-variant">
          <span>Item Subtotal</span>
          <span className="font-medium text-on-surface">৳{order.subtotal.toLocaleString()}</span>
        </div>

        {order.discount > 0 && (
          <div className="flex justify-between items-center font-body-sm text-body-sm text-primary">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">loyalty</span>
              Promo Code ({order.appliedCoupon || "FIRSTDINE"})
            </span>
            <span className="font-semibold">-৳{order.discount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between items-center font-body-sm text-body-sm text-on-surface-variant">
          <span>
            {order.fulfillmentMode === "delivery"
              ? "Dedicated Fleet Delivery Fee"
              : order.fulfillmentMode === "takeaway"
              ? "Express Takeaway Packing"
              : "Table Reservation Service"}
          </span>
          <span className="font-medium text-on-surface">
            {order.deliveryFee > 0 ? `৳${order.deliveryFee.toLocaleString()}` : "৳0 (Free)"}
          </span>
        </div>

        <div className="flex justify-between items-center font-body-sm text-body-sm text-on-surface-variant">
          <span>Eco Thermal Packaging &amp; Gov VAT (5%)</span>
          <span className="font-medium text-on-surface">
            ৳{(order.packagingFee + order.tax).toLocaleString()}
          </span>
        </div>

        <div className="pt-space-sm mt-space-xs flex justify-between items-baseline border-t border-outline-variant/60">
          <div className="flex flex-col">
            <span className="font-label-lg text-label-lg font-bold text-on-surface">
              {order.paymentMethod === "cod" ? "Total Payable" : "Total Paid"}
            </span>
            <span className="font-body-sm text-[12px] text-on-surface-variant">
              Includes all taxes, thermal packaging &amp; service
            </span>
          </div>
          <span className="font-headline-lg text-2xl sm:text-3xl text-primary font-display font-medium">
            ৳{order.total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Payment Verification Card */}
      <div className="flex items-center justify-between bg-surface-container-low p-space-md rounded-lg border border-outline-variant/30">
        <div className="flex items-center gap-space-sm">
          <div className="w-9 h-9 rounded bg-surface-container-highest flex items-center justify-center text-primary-container">
            <span className="material-symbols-outlined">{payment.icon}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              {payment.label}
            </span>
            <span className="font-body-sm text-[12px] text-on-surface-variant">
              {payment.statusText}
            </span>
          </div>
        </div>

        <span
          className={`material-symbols-outlined text-xl ${payment.badgeColor}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {order.paymentStatus === "failed" ? "cancel" : "check_circle"}
        </span>
      </div>
    </div>
  );
}
