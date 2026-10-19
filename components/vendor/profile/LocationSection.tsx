"use client";

import { NEIGHBORHOOD_OPTIONS } from "@/data/mockRestaurantProfile";

interface LocationSectionProps {
  streetAddress: string;
  neighborhood: string;
  phone: string;
  managerEmail: string;
  latitude: number;
  longitude: number;
  coverageRadiusKm: number;
  restaurantName: string;
  onStreetAddressChange: (val: string) => void;
  onNeighborhoodChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onRecalibratePinClick: () => void;
}

export default function LocationSection({
  streetAddress,
  neighborhood,
  phone,
  managerEmail,
  latitude,
  longitude,
  coverageRadiusKm,
  restaurantName,
  onStreetAddressChange,
  onNeighborhoodChange,
  onPhoneChange,
  onEmailChange,
  onRecalibratePinClick,
}: LocationSectionProps) {
  return (
    <section className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs space-y-space-lg">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm">
        <div className="flex items-center gap-space-xs">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary font-label-sm font-bold">
            04
          </span>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Location &amp; Delivery Logistics
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Map pin verification, courier arrival instructions, and service perimeter.
            </p>
          </div>
        </div>
        <span className="px-2 py-1 rounded-md bg-secondary-fixed/40 text-on-secondary-fixed-variant font-label-sm text-label-sm font-medium">
          GPS Synced
        </span>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {/* Street Address */}
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
            Street Address
          </label>
          <input
            className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/70 text-on-surface font-body-sm focus:outline-none focus:border-primary transition-colors"
            type="text"
            value={streetAddress}
            onChange={(e) => onStreetAddressChange(e.target.value)}
            placeholder="e.g. 1420 Michigan Avenue"
          />
        </div>

        {/* Neighborhood Selector */}
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
            Area / Neighborhood
          </label>
          <div className="relative">
            <select
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/70 text-on-surface font-body-sm focus:outline-none focus:border-primary appearance-none cursor-pointer"
              value={neighborhood}
              onChange={(e) => onNeighborhoodChange(e.target.value)}
            >
              {NEIGHBORHOOD_OPTIONS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-3 text-base text-on-surface-variant pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        {/* Primary Contact Phone */}
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
            Primary Contact Phone
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-base text-on-surface-variant">
              call
            </span>
            <input
              className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/70 text-on-surface font-body-sm focus:outline-none focus:border-primary transition-colors"
              type="text"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="(313) 555-0142"
            />
          </div>
        </div>

        {/* Kitchen Manager Email */}
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
            Kitchen Manager Email
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-base text-on-surface-variant">
              mail
            </span>
            <input
              className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/70 text-on-surface font-body-sm focus:outline-none focus:border-primary transition-colors"
              type="email"
              value={managerEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="manager@mapleandvine.com"
            />
          </div>
        </div>
      </div>

      {/* Static Map Location View with Pin */}
      <div className="space-y-space-xs">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface font-semibold">
            Courier &amp; Guest Navigation Pin
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
            Lat: {latitude.toFixed(4)}° N, Lon: {longitude.toFixed(4)}° E
          </span>
        </div>

        <div className="relative w-full h-56 rounded-xl overflow-hidden border border-outline-variant/60 bg-surface-container">
          {/* Map stylized background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA_tXAyYyWE8LpWMHG2lSdDvqzmrKGPj2__DN9bzG95qepVyxxr4SP6HN5R727d_LZrLcZebSxGbWRmhscjgF9MIjqnaHShysePK4rVRmQeAcG-Txr4AUAcvbgQsRxQFQPT5rNqWTl4DqjrrXMUgrU52hejIzl8k_RPBCCyIWArwCY0Z9p_TfDS5p483PuPYDyk0mvo-y8lFbwROdy7W-4E5hMZoaG7cizl40uKhO2EtyXkTGw09U-G1Q')",
            }}
          />

          {/* Map Pin Marker */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex flex-col items-center animate-bounce-subtle">
              <div className="px-3 py-1 rounded-md bg-primary-container text-on-primary font-label-sm text-xs font-semibold shadow-md whitespace-nowrap mb-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{restaurantName || "The Maple & Vine"}</span>
              </div>
              <span
                className="material-symbols-outlined text-3xl text-secondary drop-shadow-md"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                location_on
              </span>
            </div>
          </div>

          {/* Pin Control Tools */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-surface/90 text-on-surface font-label-sm text-label-sm backdrop-blur-md border border-outline-variant/50 shadow-xs">
              Radius: {coverageRadiusKm} km coverage
            </span>
            <button
              type="button"
              onClick={onRecalibratePinClick}
              className="px-3 py-1 rounded-md bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
            >
              Recalibrate Pin
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
