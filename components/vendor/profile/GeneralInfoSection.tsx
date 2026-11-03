"use client";

import { motion } from "framer-motion";
import { PriceTier } from "@/types/profile";

interface GeneralInfoSectionProps {
  name: string;
  tagline: string;
  cuisineTags: string[];
  priceTier: PriceTier;
  licenseReference: string;
  hygieneGrade: string;
  onNameChange: (val: string) => void;
  onTaglineChange: (val: string) => void;
  onAddTagClick: () => void;
  onRemoveTag: (tag: string) => void;
  onPriceTierChange: (tier: PriceTier) => void;
  onLicenseChange: (val: string) => void;
  nameError?: string;
}

const PRICE_TIERS: { label: string; sub: string; value: PriceTier }[] = [
  { label: "$", sub: "Economy", value: "budget" as PriceTier },
  { label: "$$", sub: "Moderate", value: "moderate" as PriceTier },
  { label: "$$$", sub: "Fine Dining", value: "upscale" as PriceTier },
  { label: "$$$$", sub: "Luxury", value: "luxury" as PriceTier },
];

export default function GeneralInfoSection({
  name,
  tagline,
  cuisineTags,
  priceTier,
  licenseReference,
  hygieneGrade,
  onNameChange,
  onTaglineChange,
  onAddTagClick,
  onRemoveTag,
  onPriceTierChange,
  onLicenseChange,
  nameError,
}: GeneralInfoSectionProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#1b3b2b]/10 shadow-xs space-y-6">
      {/* Polished Icon Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1b3b2b]/5 text-[#1b3b2b] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">badge</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1b3b2b]">General Information &amp; Identity</h2>
            <p className="text-xs text-neutral-400 font-medium">
              Core restaurant nomenclature, culinary badges, and licensing records.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          Live on Search
        </span>
      </div>

      <div className="space-y-4">
        {/* Restaurant Name */}
        <div>
          <label className="text-xs font-bold text-[#1b3b2b] block mb-1">
            Restaurant Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. DineDesk Flagship Central Kitchen"
            className="w-full bg-neutral-50 px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-[#1b3b2b] focus:outline-none focus:ring-1 focus:ring-[#1b3b2b]"
          />
          {nameError ? (
            <p className="text-[11px] text-rose-600 font-medium mt-1">{nameError}</p>
          ) : (
            <span className="text-[11px] text-neutral-400 block mt-1">
              Official brand moniker displayed on digital guest invoices and aggregator feeds.
            </span>
          )}
        </div>

        {/* Tagline */}
        <div>
          <label className="text-xs font-bold text-[#1b3b2b] block mb-1">
            Tagline / Heritage Pitch
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => onTaglineChange(e.target.value)}
            placeholder="e.g. Authentic culinary excellence crafted with passion"
            className="w-full bg-neutral-50 px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium text-[#1b3b2b] focus:outline-none focus:ring-1 focus:ring-[#1b3b2b]"
          />
          <span className="text-[11px] text-neutral-400 block mt-1">
            Appears beneath your outlet headline across user-facing search results.
          </span>
        </div>

        {/* Primary Cuisine Badges */}
        <div>
          <label className="text-xs font-bold text-[#1b3b2b] block mb-1">
            Primary Cuisine Badges
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {cuisineTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-[#1b3b2b] transition-colors"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={onAddTagClick}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl border border-dashed border-[#1b3b2b]/30 hover:border-[#1b3b2b] text-xs font-bold text-[#1b3b2b] cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Add Cuisine Tag</span>
            </button>
          </div>
        </div>

        {/* Price Tier & Health Dept Food License Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Price Tier Selectors */}
          <div>
            <label className="text-xs font-bold text-[#1b3b2b] block mb-1">
              Price Tier Bracket
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRICE_TIERS.map((tier) => (
                <button
                  key={tier.value}
                  type="button"
                  onClick={() => onPriceTierChange(tier.value)}
                  className={`p-2 rounded-xl text-center cursor-pointer transition-all ${priceTier === tier.value
                    ? "bg-[#1b3b2b] text-white shadow-2xs font-bold"
                    : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-200"
                    }`}
                >
                  <span className="text-xs block font-bold">{tier.label}</span>
                  <span className="text-[10px] block opacity-80">{tier.sub}</span>
                </button>
              ))}
            </div>
          </div>

          
          {/* Clean Non-Overlapping License & Hygiene Section */}
          <div>
            <label className="text-xs font-bold text-[#1b3b2b] block mb-1">
              Trade License &amp; Food Safety Audit
            </label>
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              {/* Input Box with Integrated End Adornment */}
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  value={licenseReference}
                  onChange={(e) => onLicenseChange(e.target.value)}
                  placeholder="TRAD/DSCC/019284/2026"
                  className="w-full h-11 bg-neutral-50 pl-3.5 pr-11 rounded-xl border border-neutral-200 text-xs font-mono font-semibold text-[#1b3b2b] focus:outline-none focus:ring-1 focus:ring-[#1b3b2b] transition-all"
                />
                <div
                  title="Official Trade Verification"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center justify-center pointer-events-none text-emerald-600"
                >
                  <span className="material-symbols-outlined text-[20px] leading-none">verified</span>
                </div>
              </div>

              {/* Matching Height Badge */}
              <div className="shrink-0 h-11 px-3.5 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center gap-1.5 text-neutral-700 text-xs font-semibold select-none">
                <span className="material-symbols-outlined text-base text-emerald-600 leading-none">
                  health_and_safety
                </span>
                <span>{hygieneGrade || "Grade A (98/100)"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}