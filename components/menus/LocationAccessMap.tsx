"use client";

import { useState } from "react";

interface LocationAccessMapProps {
    neighborhood: string;
    restaurantName: string;
}

export default function LocationAccessMap({ neighborhood, restaurantName }: LocationAccessMapProps) {
    const [copied, setCopied] = useState(false);

    // Dynamically generate the website slug from the active restaurant name
    const cleanRestaurantSlug = (restaurantName || "DineDesk Restaurant")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    const websiteUrl = `${cleanRestaurantSlug}.com`;

    const handleCopyWebsite = () => {
        navigator.clipboard.writeText(websiteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-6 shadow-md flex flex-col gap-6">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-4">
                <h3 className="font-heading font-extrabold text-lg text-primary tracking-tight">
                    Location &amp; Access
                </h3>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 uppercase tracking-wider shadow-2xs">
                    Open Now
                </span>
            </div>

            {/* Address */}
            <p className="text-xs font-semibold text-on-surface leading-relaxed">
                {neighborhood || "House 52, Road 11, Block D, Dhanmondi Satmasjid Rd"}
            </p>

            {/* Map Preview Box */}
            <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/40 flex items-center justify-center group shadow-inner">
                <div className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=600&auto=format&fit=crop')` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Map Pin Badge */}
                <div className="relative z-10 px-3.5 py-2 rounded-xl bg-inverse-surface/90 backdrop-blur-md text-inverse-on-surface text-xs font-bold shadow-lg flex items-center gap-2 border border-white/20">
                    <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                    <span className="truncate max-w-[200px]">{neighborhood || "Dhanmondi Satmasjid Rd"}</span>
                </div>
            </div>

            {/* Operating Hours */}
            <div className="flex flex-col gap-1.5 text-xs text-on-surface-variant font-medium pt-2 border-t border-outline-variant/60">
                <div className="flex justify-between items-center">
                    <span>Saturday – Wednesday</span>
                    <span className="font-bold text-on-surface">12:00 PM – 11:30 PM</span>
                </div>
                <div className="flex justify-between items-center">
                    <span>Thursday – Friday (Extended)</span>
                    <span className="font-bold text-on-surface">12:00 PM – 12:30 AM</span>
                </div>
            </div>

            {/* Dynamic Website & Compact Copy Feature */}
            <div className="flex items-center justify-between pt-3 border-t border-outline-variant/60">
                <span className="text-xs font-black text-primary tracking-wide truncate flex-1 min-w-0 mr-3">
                    {websiteUrl}
                </span>
                <button
                    onClick={handleCopyWebsite}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer shadow-2xs flex items-center gap-1 shrink-0 ${copied
                        ? "bg-emerald-600 text-white"
                        : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                        }`}
                    type="button"
                >
                    <span className="material-symbols-outlined text-xs">
                        {copied ? "check" : "content_copy"}
                    </span>
                    <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
            </div>

        </div>
    );
}