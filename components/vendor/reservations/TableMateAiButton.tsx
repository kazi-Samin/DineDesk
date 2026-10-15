"use client";

import { useState } from "react";

export default function TableMateAiButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-space-md right-space-md z-50">
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-[0_16px_40px_rgba(30,27,22,0.18)] p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary-container text-on-primary">
                <span className="material-symbols-outlined text-base">smart_toy</span>
              </span>
              <div>
                <span className="font-headline-sm text-sm font-bold text-primary block">
                  TableMate AI Floor Dispatch
                </span>
                <span className="text-[10px] text-on-surface-variant">Live telemetry &amp; kitchen balance</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-on-surface-variant hover:text-on-surface text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-xs text-on-surface">
            <div className="p-2.5 rounded-xl bg-secondary/10 border border-secondary/20 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-secondary">
                <span className="material-symbols-outlined text-sm">warning</span>
                <span>Courtyard Grill Peak Alert</span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Courtyard grills operate at 94% capacity between 8:15 PM and 9:15 PM. Recommend allocating upcoming parties of 4 to Main Dining Hall tables <strong>T-2</strong> or <strong>T-8</strong>.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/15 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-primary">
                <span className="material-symbols-outlined text-sm">lightbulb</span>
                <span>VIP Seating Optimization</span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Nusrat Anam (Anniversary) is currently assigned to <strong>C-4</strong>. Jasmine flower package is ready at the pantry counter.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-on-surface">
                <span className="material-symbols-outlined text-sm">speed</span>
                <span>Turnover Projection</span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Tables <strong>T-3</strong> and <strong>C-1</strong> are expected to vacate by 8:35 PM, freeing 6 seats for walk-ins.
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-space-xs px-space-md py-2.5 rounded-full bg-primary-container text-on-primary shadow-[0_8px_24px_rgba(30,27,22,0.12)] hover:bg-primary transition-all border border-primary-fixed/20 cursor-pointer"
        type="button"
      >
        <span className="material-symbols-outlined text-lg">smart_toy</span>
        <span className="font-label-md text-label-md font-semibold">TableMate AI</span>
        <span className="inline-flex w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      </button>
    </div>
  );
}
