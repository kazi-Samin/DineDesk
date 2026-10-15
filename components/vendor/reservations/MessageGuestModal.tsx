"use client";

import { useState } from "react";
import { VendorReservation } from "@/types/reservation";

interface MessageGuestModalProps {
  isOpen: boolean;
  reservation: VendorReservation | null;
  onClose: () => void;
  onSend: (reservationId: string, message: string) => void;
}

const TEMPLATES = [
  "Your table is ready! Please proceed directly to the front desk hostess.",
  "We have noted your special anniversary request and arranged jasmine flowers.",
  "Kindly verify if anyone in your dining party requires wheelchair access.",
  "Due to peak courtyard load, we may seat you 10 minutes past reservation time.",
];

export default function MessageGuestModal({
  isOpen,
  reservation,
  onClose,
  onSend,
}: MessageGuestModalProps) {
  const [message, setMessage] = useState(TEMPLATES[0]);

  if (!isOpen || !reservation) return null;

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(reservation.id, message.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-surface-container text-primary">
              <span className="material-symbols-outlined text-lg">chat</span>
            </span>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-primary">
                Message {reservation.guestName}
              </h3>
              <p className="text-xs text-on-surface-variant font-mono">
                {reservation.id} • {reservation.phone}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Quick Templates
          </label>
          <div className="space-y-1">
            {TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMessage(tmpl)}
                className="w-full text-left p-2 rounded-lg text-xs bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors cursor-pointer border border-outline-variant/30"
              >
                &ldquo;{tmpl}&rdquo;
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Message Content
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-surface-container-low p-3 rounded-lg border border-outline-variant text-xs text-on-surface focus:outline-none resize-none"
          ></textarea>
        </div>

        <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between">
          <span className="text-[11px] text-on-surface-variant">
            ⚡ Simulated SMS / in-app notification
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-outline-variant text-xs text-on-surface hover:bg-surface-container-low cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="px-4 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-colors cursor-pointer"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
