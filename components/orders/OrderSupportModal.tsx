"use client";

import { useState } from "react";

interface OrderSupportModalProps {
  orderId: string;
  restaurantName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderSupportModal({
  orderId,
  restaurantName,
  isOpen,
  onClose,
}: OrderSupportModalProps) {
  const [selectedTopic, setSelectedTopic] = useState("delay");
  const [supportMessage, setSupportMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSupportMessage("");
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#171714]/60 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest max-w-lg w-full rounded-xl shadow-2xl border border-outline-variant p-6 relative">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-2xl">
              support_agent
            </span>
            <h3 className="font-headline-sm text-lg font-bold text-primary">
              Order Concierge &amp; Support
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mt-4">
          <div className="bg-surface-container-low p-3 rounded-lg flex items-center justify-between text-body-sm mb-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold block">
                Order Case Reference
              </span>
              <span className="font-semibold text-primary font-mono">#{orderId}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold block">
                Restaurant
              </span>
              <span className="font-medium text-on-surface">{restaurantName}</span>
            </div>
          </div>

          {submitted ? (
            <div className="py-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-3xl">check</span>
              </div>
              <h4 className="font-headline-sm text-primary font-bold">Ticket Logged</h4>
              <p className="font-body-sm text-on-surface-variant mt-1 max-w-xs">
                Your support request has been expedited to our live Dhaka culinary dispatcher. A support agent will respond within 3 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-on-surface mb-1">
                  How can our concierge assist you?
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full p-2 bg-surface-container-low border border-outline-variant rounded font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
                >
                  <option value="delay">Order taking longer than estimated</option>
                  <option value="instructions">Update gate entry / delivery instructions</option>
                  <option value="dishes">Missing or incorrect dishes inquiry</option>
                  <option value="contact">Unable to reach rider phone</option>
                  <option value="cancellation">Request emergency cancellation</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-on-surface mb-1">
                  Additional Details
                </label>
                <textarea
                  required
                  rows={3}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Provide any specific remarks for our support team..."
                  className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>

              <div className="bg-surface-container-high/50 p-2.5 rounded text-[11px] text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-primary-container">
                  call
                </span>
                <span>
                  Immediate hotline: <strong>+880 9612-DINE (3463)</strong> (Available 9:00 AM – 2:00 AM)
                </span>
              </div>

              <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-body-sm font-medium text-on-surface-variant hover:bg-surface-container rounded cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-container text-on-primary hover:bg-primary font-semibold text-body-sm rounded shadow cursor-pointer transition-colors"
                >
                  Submit Support Ticket
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
