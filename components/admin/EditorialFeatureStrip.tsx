// components/admin/EditorialFeatureStrip.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

interface FeatureItem {
  id: string;
  title: string;
  chef?: string;
  coverImage?: string;
  tag?: string;
  status?: string;
}

interface EditorialFeatureStripProps {
  features: FeatureItem[];
}

export default function EditorialFeatureStrip({
  features = [],
}: EditorialFeatureStripProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  if (!features || features.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-2xl border border-[#1b3b2b]/10 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#1b3b2b]/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-[#E2B774]">
            hotel_class
          </span>
          <h3 className="text-sm font-bold text-[#1b3b2b] uppercase tracking-wider">
            Flagship Kitchens &amp; Venues
          </h3>
        </div>
        <span className="text-[11px] text-neutral-400 font-medium">
          Verified Active Registry
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {features.map((feature) => {
          const hasError = imageErrors[feature.id];
          const imgSrc =
            !hasError && feature.coverImage && feature.coverImage.startsWith("http")
              ? feature.coverImage
              : "/assets/logo.png";

          return (
            <div
              key={feature.id}
              className="group flex items-center gap-3.5 p-3 rounded-xl border border-neutral-200/70 hover:border-[#1b3b2b]/30 bg-[#fbfdfc] hover:bg-neutral-50/80 transition-all shadow-2xs"
            >
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 border border-[#1b3b2b]/10 flex items-center justify-center shrink-0 p-1">
                <Image
                  src={imgSrc}
                  alt={feature.title}
                  width={56}
                  height={56}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={() =>
                    setImageErrors((prev) => ({ ...prev, [feature.id]: true }))
                  }
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block truncate">
                    {feature.tag || "Multi-Cuisine"}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#1b3b2b] truncate group-hover:text-amber-900 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                  {feature.chef || "Lead Culinary Station"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}