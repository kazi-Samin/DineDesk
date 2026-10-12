"use client";

import { useState } from "react";
import { CourierInfo } from "@/types/order";

interface CourierCardProps {
  courier: CourierInfo;
  isOutForDelivery: boolean;
}

export default function CourierCard({ courier, isOutForDelivery }: CourierCardProps) {
  const [modalMessageOpen, setModalMessageOpen] = useState(false);
  const [modalCallOpen, setModalCallOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sentMessage, setSentMessage] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSentMessage(true);
    setTimeout(() => {
      setSentMessage(false);
      setMessageText("");
      setModalMessageOpen(false);
    }, 1500);
  };

  return (
    <>
      <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md border border-outline-variant/30">
        <div className="flex items-center gap-space-md w-full sm:w-auto">
          <div className="relative shrink-0">
            <img
              className="w-14 h-14 rounded-full object-cover shadow-sm ring-2 ring-surface-container-lowest"
              alt={`Portrait of courier ${courier.name}`}
              src={courier.avatar}
            />
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                isOutForDelivery ? "bg-primary-container" : "bg-outline-variant"
              }`}
            ></span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-headline-sm text-base md:text-lg text-on-surface font-semibold">
                {courier.name}
              </h3>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface font-label-sm text-label-sm">
                <span
                  className="material-symbols-outlined text-xs text-secondary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                {courier.rating}
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {courier.badge}
            </span>
            <span className="font-label-sm text-label-sm text-primary-container font-medium mt-0.5">
              Vehicle: {courier.vehicle}
            </span>
          </div>
        </div>

        {/* Call & Message Actions */}
        <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
          <button
            onClick={() => setModalMessageOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-container transition-colors shadow-sm font-label-md text-label-md font-semibold cursor-pointer border border-outline-variant/30"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">chat</span>
            Message
          </button>
          <button
            onClick={() => setModalCallOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-space-md py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm font-label-md text-label-md font-semibold cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">call</span>
            Call Rider
          </button>
        </div>
      </div>

      {/* Message Modal Demo */}
      {modalMessageOpen && (
        <div className="fixed inset-0 z-50 bg-[#171714]/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest p-6 rounded-xl max-w-md w-full shadow-xl border border-outline-variant">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">chat</span>
                <h3 className="font-label-lg font-bold text-primary">Message Rider ({courier.name})</h3>
              </div>
              <button
                onClick={() => setModalMessageOpen(false)}
                className="text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 flex flex-col gap-3">
              <p className="text-body-sm text-on-surface-variant">
                Send rapid transit directions or entrance codes directly to Kabir&apos;s DineDesk courier terminal.
              </p>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="e.g. Please ring doorbell 4B or leave with main lobby guard..."
                rows={3}
                className="w-full p-2.5 bg-surface-container-low rounded border border-outline-variant text-body-sm text-on-surface focus:outline-none focus:border-primary-container"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setModalMessageOpen(false)}
                  className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded text-body-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sentMessage}
                  className="px-4 py-2 bg-primary-container text-on-primary hover:bg-primary rounded text-body-sm font-semibold flex items-center gap-1.5"
                >
                  {sentMessage ? (
                    <>
                      <span className="material-symbols-outlined text-sm">check</span>
                      <span>Dispatched!</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">send</span>
                      <span>Send Instruction</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated Call Modal Notice */}
      {modalCallOpen && (
        <div className="fixed inset-0 z-50 bg-[#171714]/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest p-6 rounded-xl max-w-sm w-full shadow-xl border border-outline-variant text-center">
            <div className="w-12 h-12 rounded-full bg-primary-fixed text-primary mx-auto flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl">call</span>
            </div>
            <h3 className="font-headline-sm text-primary font-bold">Courier Phone Line</h3>
            <p className="font-body-sm text-on-surface-variant mt-1">
              Simulated encrypted direct VoIP call to:
            </p>
            <p className="font-label-lg font-bold text-secondary text-base mt-2">
              {courier.phone}
            </p>
            <p className="text-[11px] text-on-surface-variant mt-2 bg-surface-container-low p-2 rounded">
              (Demo interaction: No actual cellular phone call placed in prototype)
            </p>
            <button
              type="button"
              onClick={() => setModalCallOpen(false)}
              className="mt-5 w-full py-2 bg-primary text-on-primary hover:bg-primary-container rounded font-label-md text-label-md font-semibold cursor-pointer"
            >
              Close Dial Window
            </button>
          </div>
        </div>
      )}
    </>
  );
}
