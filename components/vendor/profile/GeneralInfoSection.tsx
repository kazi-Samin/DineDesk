"use client";

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
    <section className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs space-y-space-lg">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm">
        <div className="flex items-center gap-space-xs">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary font-label-sm font-bold">
            01
          </span>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              General Information &amp; Identity
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Core restaurant nomenclature, culinary badges, and licensing records.
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-surface-container text-primary font-label-sm text-label-sm font-medium">
          Live on Search
        </span>
      </div>

      <div className="space-y-space-md">
        {/* Restaurant Name */}
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold">
            Restaurant Name <span className="text-error">*</span>
          </label>
          <input
            className={`w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border ${
              nameError
                ? "border-error focus:border-error"
                : "border-outline-variant/70 focus:border-primary"
            } text-on-surface font-body-md focus:outline-none focus:bg-surface-container-lowest transition-colors`}
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Sultan's Heritage Kitchen"
            maxLength={60}
          />
          {nameError ? (
            <p className="mt-1 font-body-sm text-xs text-error flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">error</span>
              {nameError}
            </p>
          ) : (
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Official brand moniker displayed on digital guest invoices and aggregator feeds.
            </p>
          )}
        </div>

        {/* Tagline / Pitch */}
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold">
            Tagline / Heritage Pitch
          </label>
          <input
            className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/70 text-on-surface font-body-md focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors"
            type="text"
            value={tagline}
            onChange={(e) => onTaglineChange(e.target.value)}
            placeholder="e.g. Authentic Mughlai, Old Dhaka Kacchi & Dum Biryanis since 1984"
            maxLength={120}
          />
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
            Appears beneath your outlet headline across user-facing search results.
          </p>
        </div>

        {/* Cuisine Multi-Pills */}
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-2 font-semibold">
            Primary Cuisine Badges
          </label>
          <div className="flex flex-wrap gap-2">
            {cuisineTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-fixed/60 border border-primary-fixed-dim text-on-primary-fixed font-label-sm text-label-sm"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="material-symbols-outlined text-xs hover:text-error transition-colors cursor-pointer"
                  title={`Remove ${tag}`}
                >
                  close
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={onAddTagClick}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-outline-variant hover:border-primary hover:text-primary text-on-surface-variant font-label-sm text-label-sm transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Add Cuisine Tag</span>
            </button>
          </div>
          {cuisineTags.length === 0 && (
            <p className="mt-1.5 font-body-sm text-xs text-secondary">
              Please add at least 1 cuisine badge to help guests discover your specialty dishes.
            </p>
          )}
        </div>

        {/* Price Tier & Licensing row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold">
              Price Tier Bracket
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onPriceTierChange("economy")}
                className={`py-2 text-center rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                  priceTier === "economy"
                    ? "bg-primary-container text-on-primary border border-primary font-semibold shadow-xs"
                    : "border border-outline-variant/60 text-on-surface hover:bg-surface-container"
                }`}
              >
                ৳ Economy
              </button>
              <button
                type="button"
                onClick={() => onPriceTierChange("moderate")}
                className={`py-2 text-center rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                  priceTier === "moderate"
                    ? "bg-primary-container text-on-primary border border-primary font-semibold shadow-xs"
                    : "border border-outline-variant/60 text-on-surface hover:bg-surface-container"
                }`}
              >
                ৳৳ Moderate
              </button>
              <button
                type="button"
                onClick={() => onPriceTierChange("fine-dining")}
                className={`py-2 text-center rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                  priceTier === "fine-dining"
                    ? "bg-primary-container text-on-primary border border-primary font-semibold shadow-xs"
                    : "border border-outline-variant/60 text-on-surface hover:bg-surface-container"
                }`}
              >
                ৳৳৳ Fine Dining
              </button>
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold">
              BSTI Hygiene &amp; Trade License
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/70 text-on-surface font-body-sm focus:outline-none focus:border-primary pr-8"
                  type="text"
                  value={licenseReference}
                  onChange={(e) => onLicenseChange(e.target.value)}
                  placeholder="e.g. BSTI-DHK-2024-98421"
                />
                <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-base text-emerald-700 pointer-events-none">
                  verified
                </span>
              </div>
              <span className="px-2 py-1.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap">
                {hygieneGrade || "Grade A+"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
