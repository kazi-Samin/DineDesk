"use client";

import { CompletenessAudit } from "@/types/profile";

interface CompletenessChecklistProps {
  audit: CompletenessAudit;
}

export default function CompletenessChecklist({
  audit,
}: CompletenessChecklistProps) {
  return (
    <div className="bg-surface-container-low p-space-md rounded-xl border border-outline-variant space-y-space-sm">
      <div className="flex items-center justify-between">
        <span className="font-label-md text-label-md text-on-surface font-semibold">
          Storefront Completeness
        </span>
        <span className="font-label-sm text-label-sm text-primary font-bold">
          {audit.percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-container rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(5, audit.percentage))}%` }}
        />
      </div>

      {/* Checklist items */}
      <ul className="space-y-1.5 font-label-sm text-label-sm">
        {audit.items.map((item) => (
          <li
            key={item.id}
            className={`flex items-center gap-1.5 ${
              item.completed ? "text-emerald-800" : "text-on-surface-variant"
            }`}
          >
            <span
              className={`material-symbols-outlined text-xs ${
                item.completed ? "text-emerald-600" : "text-on-surface-variant/70"
              }`}
            >
              {item.completed ? "check_circle" : "radio_button_unchecked"}
            </span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
