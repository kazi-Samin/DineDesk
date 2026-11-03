"use client";

import { useState } from "react";

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
  const [mapViewType, setMapViewType] = useState<"m" | "k">("m"); // 'm' for Roadmap, 'k' for Satellite

  // Real Google Maps embed URL
  const googleMapEmbedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&t=${mapViewType}&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#1b3b2b]/10 shadow-xs space-y-6">
      {/* Polished Location Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1b3b2b]/5 text-[#1b3b2b] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">near_me</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1b3b2b]">Location &amp; Delivery Logistics</h2>
            <p className="text-xs text-neutral-400 font-medium">
              Real-time Google Maps coordinates, courier arrival instructions, and service perimeter.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          GPS Synced
        </span>
      </div>

      {/* Address & Neighborhood Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-[#1b3b2b] block mb-1">
            Street Address *
          </label>
          <input
            type="text"
            required
            value={streetAddress}
            onChange={(e) => onStreetAddressChange(e.target.value)}
            placeholder="e.g. House 42, Road 11, Block D"
            className="w-full bg-neutral-50 px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-[#1b3b2b] focus:outline-none focus:ring-1 focus:ring-[#1b3b2b]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#1b3b2b] block mb-1">
            Area / Neighborhood *
          </label>
          <input
            type="text"
            required
            value={neighborhood}
            onChange={(e) => onNeighborhoodChange(e.target.value)}
            placeholder="e.g. Gulshan, Dhaka"
            className="w-full bg-neutral-50 px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-[#1b3b2b] focus:outline-none focus:ring-1 focus:ring-[#1b3b2b]"
          />
        </div>
      </div>

      {/* Contact Phone & Manager Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-[#1b3b2b] block mb-1">
            Primary Contact Phone
          </label>
          <div className="relative">
            <input
              type="text"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="+880 1711-000000"
              className="w-full bg-neutral-50 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium text-[#1b3b2b] focus:outline-none focus:ring-1 focus:ring-[#1b3b2b]"
            />
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-400 text-lg">
              call
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#1b3b2b] block mb-1">
            Kitchen Manager Email
          </label>
          <div className="relative">
            <input
              type="email"
              value={managerEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="manager@dinedesk.com"
              className="w-full bg-neutral-50 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium text-[#1b3b2b] focus:outline-none focus:ring-1 focus:ring-[#1b3b2b]"
            />
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-400 text-lg">
              mail
            </span>
          </div>
        </div>
      </div>

      {/* Real Interactive Google Map */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1b3b2b]">Live Interactive Google Map</span>
            <span className="text-[11px] font-mono text-neutral-400">
              ({latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Satellite / Roadmap Toggle */}
            <div className="bg-neutral-100 p-0.5 rounded-lg flex items-center text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setMapViewType("m")}
                className={`px-2 py-1 rounded-md transition-all ${mapViewType === "m" ? "bg-white text-[#1b3b2b] shadow-2xs" : "text-neutral-500"
                  }`}
              >
                Roadmap
              </button>
              <button
                type="button"
                onClick={() => setMapViewType("k")}
                className={`px-2 py-1 rounded-md transition-all ${mapViewType === "k" ? "bg-white text-[#1b3b2b] shadow-2xs" : "text-neutral-500"
                  }`}
              >
                Satellite
              </button>
            </div>

            <button
              type="button"
              onClick={onRecalibratePinClick}
              className="px-3 py-1.5 rounded-xl bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1 transition-all"
            >
              <span className="material-symbols-outlined text-sm text-[#E2B774]">edit_location</span>
              <span>Recalibrate Pin</span>
            </button>
          </div>
        </div>

        {/* Real Embedded Google Maps IFrame */}
        <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-neutral-200 shadow-inner bg-neutral-100">
          <iframe
            title="Real Google Map View"
            src={googleMapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />

          {/* Delivery Radius Overlay */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-200 shadow-md flex items-center gap-2 text-xs font-bold text-[#1b3b2b]">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>Delivery Radius: {coverageRadiusKm} km coverage</span>
          </div>

          <a
            href={`https://maps.google.com/?q=${latitude},${longitude}`}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-3 right-3 bg-white/95 hover:bg-white backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-neutral-200 shadow-md flex items-center gap-1 text-[11px] font-bold text-[#1b3b2b] transition-colors"
          >
            <span>Open in Google Maps</span>
            <span className="material-symbols-outlined text-xs">open_in_new</span>
          </a>
        </div>
      </div>
    </div>
  );
}