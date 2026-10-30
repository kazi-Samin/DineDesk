"use client";

import { OrderConfirmation } from "@/types/order";

interface OrderReceiptProps {
  order: OrderConfirmation | any;
}

export default function OrderReceipt({ order }: OrderReceiptProps) {
  if (!order) return null;

  // Safe numeric fallbacks ensuring no undefined runtime crashes
  const subtotal = Number(order.subtotal ?? order.pricing?.subtotal ?? 0);
  const discount = Number(order.discount ?? order.pricing?.discount ?? 0);
  const deliveryFee = Number(order.deliveryFee ?? order.pricing?.deliveryFee ?? 0);
  const packagingFee = Number(order.packagingFee ?? order.pricing?.serviceFee ?? 2.0);
  const tax = Number(order.tax ?? order.pricing?.tax ?? 0);
  const total = Number(
    order.total ??
    order.pricing?.total ??
    Math.max(0, subtotal + deliveryFee + packagingFee + tax - discount)
  );

  const normalizedMethod = String(order.paymentMethod || "").toLowerCase();
  const normalizedPaymentStatus = String(order.paymentStatus || "").toLowerCase();

  const getPaymentDetails = () => {
    if (normalizedMethod === "cod") {
      return {
        label: "Cash on Delivery",
        statusText: "Pay upon courier arrival",
        icon: "payments",
        badge: "Due on Delivery",
        badgeColor: "text-secondary",
      };
    }
    if (normalizedMethod === "mfs") {
      return {
        label: "bKash / Nagad Direct Checkout",
        statusText: "Mobile wallet transaction confirmed",
        icon: "account_balance_wallet",
        badge: "Settled",
        badgeColor: "text-primary-container",
      };
    }
    return {
      label: "Visa / Mastercard via Stripe",
      statusText:
        normalizedPaymentStatus === "paid"
          ? "Authorized & Settled Online"
          : "Payment Verification In Progress",
      icon: "credit_card",
      badge: normalizedPaymentStatus === "paid" ? "Settled" : "Pending",
      badgeColor:
        normalizedPaymentStatus === "paid"
          ? "text-primary-container"
          : "text-secondary",
    };
  };

  const payment = getPaymentDetails();

  return (
    <div className="flex flex-col gap-space-md">
      {/* Billing Breakdown */}
      <div className="flex flex-col gap-space-xs bg-surface-container rounded-lg p-space-md border border-outline-variant/30">
        <div className="flex justify-between items-center font-body-sm text-body-sm text-on-surface-variant">
          <span>Item Subtotal</span>
          <span className="font-medium text-on-surface">
            ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between items-center font-body-sm text-body-sm text-primary">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">loyalty</span>
              Promo Code ({order.appliedCoupon || "FIRSTDINE"})
            </span>
            <span className="font-semibold">
              -${discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
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
            {deliveryFee > 0
              ? `$${deliveryFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : "$0 (Free)"}
          </span>
        </div>

        <div className="flex justify-between items-center font-body-sm text-body-sm text-on-surface-variant">
          <span>Eco Thermal Packaging &amp; State Sales Tax (6%)</span>
          <span className="font-medium text-on-surface">
            ${(packagingFee + tax).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="pt-space-sm mt-space-xs flex justify-between items-baseline border-t border-outline-variant/60">
          <div className="flex flex-col">
            <span className="font-label-lg text-label-lg font-bold text-on-surface">
              {normalizedMethod === "cod" ? "Total Payable" : "Total Paid"}
            </span>
            <span className="font-body-sm text-[12px] text-on-surface-variant">
              Includes all taxes, packaging &amp; service
            </span>
          </div>
          <span className="font-headline-lg text-2xl sm:text-3xl text-primary font-display font-medium">
            ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
          {normalizedPaymentStatus === "failed" ? "cancel" : "check_circle"}
        </span>
      </div>
    </div>
  );
}