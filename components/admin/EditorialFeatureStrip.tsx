"use client";

import { EditorialFeatureItem } from "@/types/admin";

interface EditorialFeatureStripProps {
  features: EditorialFeatureItem[];
}

export default function EditorialFeatureStrip({
  features,
}: EditorialFeatureStripProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {features.map((item) => (
        <div
          key={item.id}
          className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant shadow-2xs flex items-center gap-4 transition-all duration-200 hover:shadow-xs hover:border-outline"
        >
          <img
            src={item.image}
            alt={item.title}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0 border border-outline-variant/60 bg-surface-container"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-[10px] sm:text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
              {item.tag}
            </span>
            <span className="font-headline-sm text-sm sm:text-base font-bold text-primary truncate mt-0.5">
              {item.title}
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant mt-1">
              {item.metrics}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
