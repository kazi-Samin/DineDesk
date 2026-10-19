"use client";

import { OrderConfirmation } from "@/types/order";

interface OrderDetailDrawerProps {
  order: OrderConfirmation | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (orderId: string) => void;
  onRejectPrompt: (orderId: string) => void;
  onStartPrep: (orderId: string) => void;
  onMarkReady: (orderId: string) => void;
  onMarkOutForDelivery: (orderId: string) => void;
  onMarkDeliveredPrompt: (orderId: string) => void;
  onPrintKOT: (orderId: string) => void;
}

export default function OrderDetailDrawer({
  order,
  isOpen,
  onClose,
  onAccept,
  onRejectPrompt,
  onStartPrep,
  onMarkReady,
  onMarkOutForDelivery,
  onMarkDeliveredPrompt,
  onPrintKOT,
}: OrderDetailDrawerProps) {
  if (!isOpen || !order) return null;

  const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  // Status badge styling
  const getBadgeStyle = () => {
    switch (order.status) {
      case "pending":
        return "bg-secondary text-on-secondary animate-pulse";
      case "confirmed":
        return "bg-primary-container text-on-primary";
      case "preparing":
        return "bg-amber-100 text-amber-900 border border-amber-300";
      case "ready":
        return "bg-purple-100 text-purple-900 border border-purple-300";
      case "out_for_delivery":
        return "bg-blue-100 text-blue-900 border border-blue-300";
      case "delivered":
      case "completed":
        return "bg-emerald-100 text-emerald-900 border border-emerald-300";
      case "rejected":
      case "cancelled":
        return "bg-error/10 text-error border border-error/20";
      default:
        return "bg-surface-container text-on-surface";
    }
  };

  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-2xs border border-outline-variant flex flex-col gap-space-md">
      {/* Drawer Header */}
      <div className="flex items-center justify-between pb-space-sm bg-surface-container-low p-space-sm rounded-lg border border-outline-variant">
        <div className="flex flex-col">
          <span className="font-label-sm text-[11px] text-secondary uppercase tracking-widest font-bold">
            Active Live Ticket
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-headline-md text-headline-md font-display text-primary font-bold">
              #{order.orderId}
            </span>
            <span className={`px-2 py-0.5 rounded-md font-label-sm text-[11px] font-semibold uppercase ${getBadgeStyle()}`}>
              {order.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-sm text-[11px] transition-all cursor-pointer font-semibold shadow-xs"
            onClick={() => onPrintKOT(order.orderId)}
            type="button"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            <span>KOT Print</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
            type="button"
            title="Close inspector"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      </div>

      {/* Fulfillment Mode Banner */}
      <div className="flex items-center justify-between px-1 text-on-surface-variant font-label-sm text-[12px]">
        <span className="flex items-center gap-1.5 font-semibold text-primary">
          <span className="material-symbols-outlined text-base">
            {order.fulfillmentMode === "delivery"
              ? "two_wheeler"
              : order.fulfillmentMode === "takeaway"
              ? "takeout_dining"
              : "table_restaurant"}
          </span>
          Mode: <strong className="capitalize">{order.fulfillmentMode}</strong>
        </span>
        <span>Placed {order.timeline?.placedAt || "recently"}</span>
      </div>

      {/* Timeline Stepper */}
      <div className="flex flex-col gap-1 px-space-xs bg-surface-container-low/50 p-space-sm rounded-lg border border-outline-variant/30">
        <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-2 font-semibold">
          Live Fulfillment Progress
        </span>
        <div className="flex items-center justify-between text-center relative">
          <div className="absolute left-6 right-6 top-3 h-0.5 bg-surface-container-high -z-0"></div>

          {/* 1: Received */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-label-sm text-[11px] flex items-center justify-center font-bold">
              ✓
            </div>
            <span className="font-label-sm text-[11px] font-semibold text-primary">Received</span>
            <span className="font-label-sm text-[10px] text-on-surface-variant">
              {order.timeline?.placedAt || "0m"}
            </span>
          </div>

          {/* 2: Kitchen */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div
              className={`w-6 h-6 rounded-full font-label-sm text-[11px] flex items-center justify-center font-bold ${
                order.status === "pending"
                  ? "bg-secondary text-on-secondary animate-pulse"
                  : order.status === "confirmed" || order.status === "preparing"
                  ? "bg-amber-500 text-white"
                  : order.status === "ready" || order.status === "out_for_delivery" || order.status === "delivered"
                  ? "bg-primary-container text-on-primary"
                  : "bg-surface-container-high text-on-surface"
              }`}
            >
              {order.status === "ready" || order.status === "out_for_delivery" || order.status === "delivered"
                ? "✓"
                : "2"}
            </div>
            <span className="font-label-sm text-[11px] font-semibold text-on-surface">Kitchen</span>
            <span className="font-label-sm text-[10px] text-on-surface-variant">
              {order.timeline?.preparingAt || (order.status === "pending" ? "Pending" : "--:--")}
            </span>
          </div>

          {/* 3: Transit / Ready */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div
              className={`w-6 h-6 rounded-full font-label-sm text-[11px] flex items-center justify-center font-bold ${
                order.status === "out_for_delivery" || order.status === "ready"
                  ? "bg-blue-600 text-white animate-pulse"
                  : order.status === "delivered" || order.status === "completed"
                  ? "bg-primary-container text-on-primary"
                  : "bg-surface-container-high text-on-surface opacity-50"
              }`}
            >
              {order.status === "delivered" || order.status === "completed" ? "✓" : "3"}
            </div>
            <span className="font-label-sm text-[11px] font-medium text-on-surface">
              {order.fulfillmentMode === "delivery" ? "Transit" : "Ready"}
            </span>
            <span className="font-label-sm text-[10px] text-on-surface-variant">
              {order.timeline?.outForDeliveryAt || order.timeline?.readyAt || "--:--"}
            </span>
          </div>

          {/* 4: Delivered */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div
              className={`w-6 h-6 rounded-full font-label-sm text-[11px] flex items-center justify-center font-bold ${
                order.status === "delivered" || order.status === "completed"
                  ? "bg-emerald-600 text-white"
                  : "bg-surface-container-high text-on-surface opacity-50"
              }`}
            >
              {order.status === "delivered" || order.status === "completed" ? "✓" : "4"}
            </div>
            <span className="font-label-sm text-[11px] font-medium text-on-surface">Delivered</span>
            <span className="font-label-sm text-[10px] text-on-surface-variant">
              {order.timeline?.deliveredAt || "--:--"}
            </span>
          </div>
        </div>
      </div>

      {/* Special Instructions Note */}
      {order.specialInstructions && (
        <div className="bg-surface-container p-space-sm rounded-lg flex items-start gap-space-xs border border-outline-variant/30">
          <span className="material-symbols-outlined text-secondary text-lg mt-0.5">announcement</span>
          <div className="flex flex-col">
            <span className="font-label-sm text-[11px] font-bold text-on-surface uppercase tracking-wider">
              Chef &amp; Dispatch Note
            </span>
            <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5 italic">
              &ldquo;{order.specialInstructions}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Rejection notice if rejected */}
      {order.status === "rejected" && (
        <div className="bg-error/10 p-space-sm rounded-lg flex items-start gap-space-xs border border-error/30 text-error">
          <span className="material-symbols-outlined text-lg mt-0.5">cancel</span>
          <div className="flex flex-col">
            <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider">
              Order Rejected
            </span>
            <p className="font-body-sm text-[12px] mt-0.5">
              Reason: {order.rejectionReason || "Unavailable for tonight's service"}
            </p>
          </div>
        </div>
      )}

      {/* Items Breakdown List */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex justify-between items-center pb-1 text-on-surface-variant font-label-sm text-[11px] uppercase tracking-wider font-semibold border-b border-outline-variant/20">
          <span>Ticket Items ({totalItemsCount})</span>
          <span>Subtotal</span>
        </div>

        {order.items.map((item) => (
          <div key={item.id} className="flex items-start justify-between py-1.5 border-b border-outline-variant/20 last:border-b-0">
            <div className="flex items-start gap-2">
              <span className="font-label-md text-[11px] font-bold text-primary bg-surface-container px-2 py-0.5 rounded">
                {item.quantity}x
              </span>
              <div className="flex flex-col">
                <span className="font-label-md text-[13px] font-semibold text-on-surface">
                  {item.name}
                </span>
                {item.description && (
                  <span className="font-body-sm text-[11px] text-on-surface-variant line-clamp-1">
                    {item.description}
                  </span>
                )}
              </div>
            </div>
            <span className="font-label-md text-[13px] font-semibold text-primary whitespace-nowrap ml-2">
              $ {(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}

        {/* Financial Breakdown */}
        <div className="flex flex-col gap-1 pt-space-xs mt-space-xs bg-surface-container-low p-space-sm rounded-lg text-on-surface-variant font-body-sm text-[12px] border border-outline-variant/30">
          <div className="flex justify-between">
            <span>Item Subtotal</span>
            <span className="text-on-surface font-medium">$ {order.subtotal.toLocaleString()}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-secondary">
              <span>Promo Code Discount ({order.appliedCoupon || "COUPON"})</span>
              <span className="font-semibold">-$ {order.discount.toLocaleString()}</span>
            </div>
          )}
          {order.deliveryFee > 0 && (
            <div className="flex justify-between">
              <span>Delivery Dispatch Fee</span>
              <span className="text-on-surface font-medium">$ {order.deliveryFee.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Packaging &amp; State Sales Tax (6%)</span>
            <span className="text-on-surface font-medium">
              $ {(order.packagingFee + order.tax).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-outline-variant/40 font-label-lg text-label-lg font-bold text-primary">
            <span>Total Bill</span>
            <span className="font-display text-headline-sm">$ {order.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[11px] pt-0.5 text-on-surface-variant">
            <span>Payment Method</span>
            <span className="font-semibold uppercase text-primary">
              {order.paymentMethod === "cod" ? "Pay at Table / Cash" : order.paymentMethod} (
              {order.paymentStatus.replace(/_/g, " ")})
            </span>
          </div>
        </div>
      </div>

      {/* Customer & Address Details */}
      <div className="flex flex-col gap-2 p-space-sm bg-surface rounded-lg border border-outline-variant/30">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center shrink-0 font-bold text-sm">
            {order.contact.fullName.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md font-semibold text-on-surface truncate">
              {order.contact.fullName}
            </span>
            <span className="font-body-sm text-[12px] text-on-surface-variant truncate">
              {order.contact.phone} • {order.contact.email}
            </span>
          </div>
        </div>

        {order.address && (
          <p className="text-[12px] text-on-surface-variant bg-surface-container-lowest p-2 rounded border border-outline-variant/20">
            <strong>Delivery Address:</strong> {order.address.apartment}, {order.address.street} (
            {order.address.instructions})
          </p>
        )}

        <div className="flex items-center gap-space-xs pt-1">
          <a
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-[11px] font-medium transition-all"
            href={`tel:${order.contact.phone}`}
          >
            <span className="material-symbols-outlined text-sm text-primary">call</span>
            Call Customer
          </a>
          <button
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-[11px] font-medium transition-all"
            type="button"
            onClick={() => alert(`Customer delivery pin: ${order.address?.street || "Michigan Avenue, Detroit, MI"}`)}
          >
            <span className="material-symbols-outlined text-sm text-secondary">share_location</span>
            View Location
          </button>
        </div>
      </div>

      {/* Owner Dynamic State Machine Actions */}
      <div className="flex flex-col gap-2 pt-1 border-t border-outline-variant/30">
        {order.status === "pending" && (
          <>
            <button
              className="w-full py-3 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-lg text-label-lg font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              onClick={() => onAccept(order.orderId)}
              type="button"
            >
              <span className="material-symbols-outlined text-lg">check_circle</span>
              Accept &amp; Send to Kitchen
            </button>
            <div className="flex items-center gap-2">
              <button
                className="flex-1 py-2 rounded-lg bg-surface-container hover:bg-error-container text-secondary font-label-md text-label-md font-medium transition-all text-center cursor-pointer"
                onClick={() => onRejectPrompt(order.orderId)}
                type="button"
              >
                Reject Order
              </button>
            </div>
          </>
        )}

        {order.status === "confirmed" && (
          <button
            className="w-full py-3 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-lg text-label-lg font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => onStartPrep(order.orderId)}
            type="button"
          >
            <span className="material-symbols-outlined text-lg">skillet</span>
            Start Preparing Dishes
          </button>
        )}

        {order.status === "preparing" && (
          <button
            className="w-full py-3 rounded-lg bg-surface-container-highest text-primary hover:bg-primary-container hover:text-on-primary font-label-lg text-label-lg font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => onMarkReady(order.orderId)}
            type="button"
          >
            <span className="material-symbols-outlined text-lg">soup_kitchen</span>
            Mark Food Ready ({order.fulfillmentMode === "delivery" ? "For Dispatch" : "At Counter"})
          </button>
        )}

        {order.status === "ready" && (
          <button
            className="w-full py-3 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-lg text-label-lg font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => {
              if (order.fulfillmentMode === "delivery") {
                onMarkOutForDelivery(order.orderId);
              } else {
                onMarkDeliveredPrompt(order.orderId);
              }
            }}
            type="button"
          >
            <span className="material-symbols-outlined text-lg">
              {order.fulfillmentMode === "delivery" ? "two_wheeler" : "done_all"}
            </span>
            {order.fulfillmentMode === "delivery"
              ? "Dispatch to Courier (Out for Delivery)"
              : order.fulfillmentMode === "takeaway"
              ? "Mark Picked Up"
              : "Mark Banquet Completed"}
          </button>
        )}

        {order.status === "out_for_delivery" && (
          <button
            className="w-full py-3 rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 font-label-lg text-label-lg font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => onMarkDeliveredPrompt(order.orderId)}
            type="button"
          >
            <span className="material-symbols-outlined text-lg">done_all</span>
            Mark Delivered &amp; Verify Payment
          </button>
        )}

        {(order.status === "delivered" || order.status === "completed") && (
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center text-emerald-900 font-body-sm text-[12px] font-medium">
            ✓ Order completed &amp; settled.
          </div>
        )}
      </div>
    </div>
  );
}
