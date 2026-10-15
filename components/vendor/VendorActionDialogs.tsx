"use client";

import { useState } from "react";

interface VendorActionDialogsProps {
  rejectModal: {
    isOpen: boolean;
    orderId: string;
  };
  onCloseReject: () => void;
  onConfirmReject: (orderId: string, reason: string) => void;

  deliverModal: {
    isOpen: boolean;
    orderId: string;
    isCOD: boolean;
    amount: number;
  };
  onCloseDeliver: () => void;
  onConfirmDeliver: (orderId: string, paymentCollected: boolean) => void;
}

export default function VendorActionDialogs({
  rejectModal,
  onCloseReject,
  onConfirmReject,
  deliverModal,
  onCloseDeliver,
  onConfirmDeliver,
}: VendorActionDialogsProps) {
  const [rejectReason, setRejectReason] = useState("Kitchen at maximum banquet capacity");
  const [customReason, setCustomReason] = useState("");
  const [codCollected, setCodCollected] = useState(true);

  return (
    <>
      {/* 1. Reject Order Dialog */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-[#171714]/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-xl shadow-2xl border border-outline-variant p-6 relative">
            <div className="flex items-center gap-3 text-secondary pb-3 border-b border-outline-variant">
              <span className="material-symbols-outlined text-3xl">cancel</span>
              <div>
                <h3 className="font-headline-sm text-lg font-bold text-primary">
                  Decline Order #{rejectModal.orderId}?
                </h3>
                <p className="text-body-sm text-on-surface-variant text-[12px]">
                  Customer will be notified with your selected culinary reason.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <label className="text-[12px] font-semibold text-on-surface">
                Select Rejection Reason:
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
              >
                <option value="Kitchen at maximum banquet capacity">
                  Kitchen at maximum banquet capacity
                </option>
                <option value="Key dish ingredient or handi batch sold out">
                  Key dish ingredient or handi batch sold out
                </option>
                <option value="Delivery address outside restaurant radius">
                  Delivery address outside restaurant radius
                </option>
                <option value="Restaurant closing early for private event">
                  Restaurant closing early for private event
                </option>
                <option value="Other">Other custom reason</option>
              </select>

              {rejectReason === "Other" && (
                <input
                  type="text"
                  placeholder="Type specific reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full p-2 bg-surface-container-low border border-outline-variant rounded font-body-sm text-on-surface"
                />
              )}

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={onCloseReject}
                  className="px-4 py-2 text-body-sm font-medium text-on-surface-variant hover:bg-surface-container rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onConfirmReject(
                      rejectModal.orderId,
                      rejectReason === "Other" && customReason.trim() ? customReason : rejectReason
                    )
                  }
                  className="px-4 py-2 bg-secondary text-on-secondary hover:bg-secondary/90 font-semibold text-body-sm rounded shadow cursor-pointer transition-colors"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Mark Delivered & Verify Payment Dialog */}
      {deliverModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-[#171714]/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-xl shadow-2xl border border-outline-variant p-6 relative">
            <div className="flex items-center gap-3 text-emerald-800 pb-3 border-b border-outline-variant">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
              <div>
                <h3 className="font-headline-sm text-lg font-bold text-primary">
                  Confirm Delivery #{deliverModal.orderId}
                </h3>
                <p className="text-body-sm text-on-surface-variant text-[12px]">
                  Verify handover completion and settlement.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {deliverModal.isCOD ? (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-[12px] uppercase font-bold text-amber-900">
                      Cash on Delivery Notice
                    </span>
                    <span className="font-headline-sm text-primary font-bold">
                      ৳ {deliverModal.amount.toLocaleString()}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-1 text-on-surface text-[13px] font-medium">
                    <input
                      type="checkbox"
                      checked={codCollected}
                      onChange={(e) => setCodCollected(e.target.checked)}
                      className="accent-primary-container w-4 h-4"
                    />
                    <span>Courier has collected full cash payment from customer</span>
                  </label>
                </div>
              ) : (
                <div className="p-3 bg-surface-container-low rounded-lg text-body-sm text-on-surface-variant">
                  Payment for this order was settled online via credit card or digital wallet.
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={onCloseDeliver}
                  className="px-4 py-2 text-body-sm font-medium text-on-surface-variant hover:bg-surface-container rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onConfirmDeliver(deliverModal.orderId, codCollected)}
                  className="px-4 py-2 bg-emerald-800 text-white hover:bg-emerald-900 font-semibold text-body-sm rounded shadow cursor-pointer transition-colors"
                >
                  Confirm Delivered
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
