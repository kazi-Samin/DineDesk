"use client";

import { useState } from "react";

interface CancelOrderModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: () => void;
}

export default function CancelOrderModal({
  orderId,
  isOpen,
  onClose,
  onConfirmCancel,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState("changed_mind");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmCancel();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#171714]/60 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest max-w-md w-full rounded-xl shadow-2xl border border-outline-variant p-6 relative">
        <div className="flex items-center gap-3 text-error pb-3 border-b border-outline-variant">
          <span className="material-symbols-outlined text-3xl">warning</span>
          <h3 className="font-headline-sm text-lg font-bold text-primary">
            Cancel Order #{orderId}?
          </h3>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <p className="text-body-sm text-on-surface-variant">
            Are you sure you want to cancel this order? This action will halt restaurant preparation and notify the dispatch team.
          </p>

          <div className="p-3 bg-surface-container-low rounded-lg text-[12px] text-on-surface-variant">
            <strong className="text-on-surface">Demo Notice:</strong> This is a simulation in the frontend prototype. In production, prepaid amounts would be refunded to your source account according to the cancellation window policy.
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-on-surface mb-1">
              Select reason for cancellation:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 bg-surface-container-low border border-outline-variant rounded font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
            >
              <option value="changed_mind">Placed by mistake / Changed dining plans</option>
              <option value="too_long">Delivery duration longer than desired</option>
              <option value="wrong_address">Incorrect delivery address or contact number</option>
              <option value="other">Other reason</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-outline-variant">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="px-4 py-2 text-body-sm font-medium text-on-surface-variant hover:bg-surface-container rounded cursor-pointer"
            >
              Keep Order
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirm}
              className="px-4 py-2 bg-error text-on-error hover:bg-error/90 font-semibold text-body-sm rounded shadow cursor-pointer transition-colors flex items-center gap-1.5"
            >
              {isProcessing ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                  <span>Cancelling...</span>
                </>
              ) : (
                <span>Confirm Cancellation</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
