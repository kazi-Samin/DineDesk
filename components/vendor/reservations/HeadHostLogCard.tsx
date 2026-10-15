"use client";

import { useState } from "react";
import { DEFAULT_HOST_LOGS } from "@/data/mockVendorReservations";

interface HeadHostLogCardProps {
  onPageHost: () => void;
}

export default function HeadHostLogCard({ onPageHost }: HeadHostLogCardProps) {
  const [isPaged, setIsPaged] = useState(false);

  const handlePageClick = () => {
    setIsPaged(true);
    onPageHost();
    setTimeout(() => {
      setIsPaged(false);
    }, 3000);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-sm text-headline-sm text-primary font-medium">
          Head Host Log
        </h2>
        <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
          Shift: Evening
        </span>
      </div>

      <div className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
        {DEFAULT_HOST_LOGS.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30"
          >
            <span
              className={`material-symbols-outlined text-base mt-0.5 ${
                log.type === "kitchen_capacity" ? "text-primary" : "text-secondary"
              }`}
            >
              {log.icon}
            </span>
            <div>
              <span className="font-label-sm text-label-sm text-on-surface font-semibold block">
                {log.title}
              </span>
              <p className="text-xs text-on-surface-variant mt-0.5">{log.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Contact Card */}
      <div className="p-space-md rounded-lg bg-primary-container text-on-primary flex items-center justify-between shadow-xs">
        <div>
          <span className="font-label-sm text-[11px] text-on-primary-container block">
            Front Desk In-charge
          </span>
          <span className="font-label-md text-label-md font-semibold">
            Sarah Zaman (Hostess)
          </span>
        </div>
        <button
          onClick={handlePageClick}
          disabled={isPaged}
          className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-80"
          type="button"
        >
          {isPaged ? "✓ Paged" : "Page Host"}
        </button>
      </div>
    </div>
  );
}
