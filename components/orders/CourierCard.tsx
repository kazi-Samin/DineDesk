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
      <div className="bg-white rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border border-[#1b3b2b]/10 shadow-xs transition-all">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Animated Delivery Rider Avatar */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#1b3b2b]/10 via-[#F7FAF7] to-[#1b3b2b]/20 border border-[#1b3b2b]/15 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
            {/* Speed Lines */}
            <div className="absolute inset-0 flex flex-col justify-around opacity-30 pointer-events-none">
              <div className="h-[1px] w-6 bg-[#1b3b2b] animate-pulse" />
              <div
                className="h-[1px] w-8 bg-[#C05621] ml-auto animate-pulse"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="h-[1px] w-5 bg-[#1b3b2b] animate-pulse"
                style={{ animationDelay: "300ms" }}
              />
            </div>

            {/* SVG Animated Delivery Scooter & Courier */}
            <svg
              viewBox="0 0 100 100"
              className="w-12 h-12 sm:w-16 sm:h-16 relative z-10 drop-shadow-sm transition-transform hover:scale-105"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Scooter Chassis */}
              <path
                d="M32 72h36c3 0 5-2 6-5l6-16c1-3-1-6-4-6H54"
                stroke="#1b3b2b"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M42 72h18" stroke="#0e2319" strokeWidth="4" strokeLinecap="round" />

              {/* Scooter Wheels */}
              <circle cx="28" cy="72" r="10" stroke="#1b3b2b" strokeWidth="4" fill="#ffffff" />
              <circle cx="28" cy="72" r="4" fill="#C05621" />
              <circle cx="74" cy="72" r="10" stroke="#1b3b2b" strokeWidth="4" fill="#ffffff" />
              <circle cx="74" cy="72" r="4" fill="#C05621" />

              {/* Insulated Food Bag (DineDesk Amber) */}
              <rect
                x="16"
                y="38"
                width="20"
                height="22"
                rx="3"
                fill="#C05621"
                stroke="#8c3a12"
                strokeWidth="2"
              />
              <path d="M20 49h12" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

              {/* Courier Rider Body (DineDesk Green Jacket) */}
              <path
                d="M45 42c2-6 7-10 13-8 5 2 6 8 3 14l-6 12h-9l-1-18z"
                fill="#1b3b2b"
              />

              {/* Courier Rider Arm & Handlebars */}
              <path
                d="M48 48l16-3 6 8"
                stroke="#1b3b2b"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M70 52l4 1" stroke="#0e2319" strokeWidth="4" strokeLinecap="round" />

              {/* Helmet (DineDesk Green with Visor) */}
              <circle cx="56" cy="27" r="8" fill="#1b3b2b" />
              <path
                d="M58 24c3 0 6 2 6 5s-2 5-6 5"
                fill="#1b3b2b"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <path d="M60 28h4" stroke="#C05621" strokeWidth="2" strokeLinecap="round" />
            </svg>

            {/* Active Live Pulse Badge */}
            <span className="absolute bottom-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>

          {/* Courier Identity & Transit Status */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#1b3b2b]">
                {courier.name}
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shadow-2xs">
                <span
                  className="material-symbols-outlined text-xs text-amber-500"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                {courier.rating}
              </span>
            </div>

            <span className="text-xs text-[#1b3b2b]/70 font-medium mt-0.5">
              {courier.badge || "Verified Priority Courier"}
            </span>

            {/* Vehicle & Dispatch status: BIKE ICON REMOVED */}
            <span className="text-[11px] font-semibold text-[#C05621] mt-1">
              {courier.vehicle ? `Vehicle: ${courier.vehicle}` : "Insulated Thermal Fleet"}
              {" • "}
              {isOutForDelivery ? "En route to delivery point" : "Awaiting dispatch at kitchen"}
            </span>
          </div>
        </div>

        {/* Call & Message Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            onClick={() => setModalMessageOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#1b3b2b] transition-all shadow-xs text-xs font-bold cursor-pointer border border-[#1b3b2b]/10 whitespace-nowrap"
            type="button"
          >
            <span className="material-symbols-outlined text-base">chat</span>
            Message
          </button>

          {/* Single-line button */}
          <button
            onClick={() => setModalCallOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1b3b2b] text-white hover:bg-[#1b3b2b]/90 transition-all shadow-xs text-xs font-bold cursor-pointer whitespace-nowrap"
            type="button"
          >
            <span className="material-symbols-outlined text-base">call</span>
            Call Rider
          </button>
        </div>
      </div>

      {/* Message Modal */}
      {modalMessageOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl border border-[#1b3b2b]/15 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1b3b2b]">chat</span>
                <h3 className="text-base font-bold text-[#1b3b2b]">
                  Message Courier ({courier.name})
                </h3>
              </div>
              <button
                onClick={() => setModalMessageOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer p-1 rounded-lg hover:bg-neutral-100"
                type="button"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 flex flex-col gap-3">
              <p className="text-xs text-neutral-600 leading-relaxed">
                Send rapid transit directions or entrance codes directly to {courier.name}&apos;s terminal.
              </p>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="e.g. Please ring doorbell 4B or leave with main lobby security..."
                rows={3}
                className="w-full p-3 bg-[#FBFBFA] rounded-2xl border border-neutral-200 text-xs text-[#1b3b2b] focus:outline-none focus:border-[#1b3b2b] resize-none"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setModalMessageOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sentMessage}
                  className="px-5 py-2.5 bg-[#1b3b2b] text-white hover:bg-[#1b3b2b]/90 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-80"
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

      {/* Simulated Call Modal */}
      {modalCallOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full shadow-2xl border border-[#1b3b2b]/15 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-[#1b3b2b]/10 text-[#1b3b2b] mx-auto flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl">call</span>
            </div>
            <h3 className="text-lg font-bold text-[#1b3b2b]">Encrypted Courier Line</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Direct VoIP communication link with courier:
            </p>
            <p className="font-mono font-bold text-[#C05621] text-base mt-2">
              {courier.phone}
            </p>
            <p className="text-[11px] text-neutral-500 mt-3 bg-[#FBFBFA] p-2.5 rounded-xl border border-neutral-100">
              Demo environment: Direct phone link available on mobile web view.
            </p>
            <button
              type="button"
              onClick={() => setModalCallOpen(false)}
              className="mt-5 w-full py-2.5 bg-[#1b3b2b] text-white hover:bg-[#1b3b2b]/90 rounded-xl text-xs font-bold cursor-pointer shadow-xs"
            >
              Close Dial Window
            </button>
          </div>
        </div>
      )}
    </>
  );
}