// components/ai/DineDeskAILogo.tsx
// High-End Culinary Restaurant AI Logo Identity & Brand Mark

"use client";

import React, { useId } from "react";
import Link from "next/link";

interface DineDeskAILogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "fab";
  withLink?: boolean;
  iconOnly?: boolean;
  framed?: boolean;
  href?: string;
  className?: string;
}

export default function DineDeskAILogo({
  size = "md",
  withLink = true,
  iconOnly = false,
  framed = true,
  href = "/",
  className = "",
}: DineDeskAILogoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "_");
  const goldId = `gold_${uid}`;
  const silverId = `silver_${uid}`;
  const flareId = `flare_${uid}`;

  // Perfectly proportioned sizing:
  // sm = 28px (chat bubbles)
  // md = 38px (sleek navbar header on desktop)
  // lg = 42px (clean, perfectly sized mobile header)
  // xl = 56px (hero showcase)
  // fab = 48px (bottom-right floating launcher)
  const sizeMap = {
    sm: { box: "w-8 h-8", radius: "rounded-lg", frameRadius: "rounded-xl", text: "text-sm", badge: "text-[9px] px-1 py-0.5", sub: "text-[8px]" },
    md: { box: "w-9 h-9 sm:w-[38px] sm:h-[38px]", radius: "rounded-xl", frameRadius: "rounded-2xl", text: "text-base font-bold", badge: "text-[10px] px-1.5 py-0.5", sub: "text-[9px]" },
    lg: { box: "w-10 h-10", radius: "rounded-xl", frameRadius: "rounded-2xl", text: "text-lg", badge: "text-[10px] px-2 py-0.5", sub: "text-[10px]" },
    xl: { box: "w-14 h-14", radius: "rounded-2xl", frameRadius: "rounded-[1.4rem]", text: "text-2xl", badge: "text-xs px-2.5 py-1", sub: "text-xs" },
    fab: { box: "w-12 h-12", radius: "rounded-2xl", frameRadius: "rounded-[1.35rem]", text: "", badge: "", sub: "" },
  };

  const s = sizeMap[size] || sizeMap.md;

  // The Culinary AI Emblem (Crisp, solid, failsafe vector graphics)
  const innerEmblem = (
    <div
      className={`relative ${s.box} ${s.radius} bg-gradient-to-br from-[#1b3b2b] via-[#153123] to-[#0b1a13] p-1 shadow-sm flex items-center justify-center border border-[#FFAA40]/40 group-hover:border-[#F6AD55] transition-all duration-300 shrink-0 overflow-visible`}
    >
      {/* Ambient background glow inside emblem */}
      <div className={`absolute inset-0 ${s.radius} bg-[radial-gradient(circle_at_50%_20%,rgba(255,213,79,0.3),transparent_70%)] pointer-events-none`} />

      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
      >
        <defs>
          <linearGradient id={goldId} x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF9C4" />
            <stop offset="0.3" stopColor="#FFD54F" />
            <stop offset="0.7" stopColor="#FF9800" />
            <stop offset="1" stopColor="#B26A00" />
          </linearGradient>

          <linearGradient id={silverId} x1="20" y1="20" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.4" stopColor="#F8FAFC" />
            <stop offset="0.8" stopColor="#CBD5E1" />
            <stop offset="1" stopColor="#94A3B8" />
          </linearGradient>

          <linearGradient id={flareId} x1="28" y1="2" x2="36" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.4" stopColor="#FFE082" />
            <stop offset="1" stopColor="#FF8F00" />
          </linearGradient>
        </defs>

        {/* 1. Fine Dining Platter Base (Solid Gold base with gradient overlay) */}
        <ellipse cx="32" cy="49" rx="24" ry="4.5" fill="#F59E0B" />
        <ellipse cx="32" cy="49" rx="24" ry="4.5" fill={`url(#${goldId})`} />
        <ellipse cx="32" cy="48" rx="21" ry="3.5" fill="#0D2016" />
        <ellipse cx="32" cy="47.2" rx="18.5" ry="2.6" fill="#E2E8F0" />
        <ellipse cx="32" cy="47.2" rx="18.5" ry="2.6" fill={`url(#${silverId})`} />

        {/* 2. Architectural Luxury Cloche Dome (Solid Silver Base with Shading & Highlight) */}
        <path
          d="M15 45 C15 30.5, 22.5 21, 32 21 C41.5 21, 49 30.5, 49 45 Z"
          fill="#F1F5F9"
        />
        <path
          d="M15 45 C15 30.5, 22.5 21, 32 21 C41.5 21, 49 30.5, 49 45 Z"
          fill={`url(#${silverId})`}
        />

        {/* Cloche Inner Ambient Shadow & Depth */}
        <path
          d="M18 45 C18.5 32.5, 24.5 23.5, 32 23.5 C39.5 23.5, 45.5 32.5, 46 45 Z"
          fill="#0D2418"
          fillOpacity="0.25"
        />

        {/* Cloche Left Highlight Sheen */}
        <path
          d="M20.5 43 C21 32 25.5 25 31 23.5"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Cloche Crown Finial Knob (Solid Gold) */}
        <ellipse cx="32" cy="20.5" rx="3.5" ry="2.5" fill="#FFB300" />
        <ellipse cx="32" cy="20.5" rx="3.5" ry="2.5" fill={`url(#${goldId})`} />
        <circle cx="32" cy="18.5" r="2.2" fill="#FFA000" />
        <circle cx="32" cy="18.5" r="2.2" fill={`url(#${goldId})`} />

        {/* 3. Crossed Fine-Dining Silverware Silhouette (Fork & Chef Knife) */}
        {/* Left: Fork Silhouette */}
        <g stroke="#1b3b2b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M26 31 V37" />
          <path d="M23.5 31 V34.5 C23.5 35.8 24.5 36.5 26 36.5" />
          <path d="M28.5 31 V34.5 C28.5 35.8 27.5 36.5 26 36.5" />
          <path d="M26 36.5 V42" />
        </g>

        {/* Right: French Chef Knife Blade */}
        <path
          d="M37.5 30 C36 30 35.2 32 35.2 35 V42 H37.5 V31.2 C37.8 30.8 37.8 30.4 37.5 30 Z"
          fill="#1b3b2b"
        />

        {/* 4. Radiant AI Discovery Star (Rising from the center finial) */}
        {/* Solid Star Base */}
        <path
          d="M32 2 L33.8 10 L41.5 12 L33.8 14 L32 21 L30.2 14 L22.5 12 L30.2 10 Z"
          fill="#FFB300"
        />
        {/* Gradient Enhancement */}
        <path
          d="M32 2 L33.8 10 L41.5 12 L33.8 14 L32 21 L30.2 14 L22.5 12 L30.2 10 Z"
          fill={`url(#${flareId})`}
        />
        {/* Star Center Bright Core */}
        <circle cx="32" cy="12" r="1.5" fill="#FFFFFF" />

        {/* Flanking Constellation Sparkles */}
        <path
          d="M37.5 6.5 L38.2 9 L40.5 9.7 L38.2 10.4 L37.5 13 L36.8 10.4 L34.5 9.7 L36.8 9 Z"
          fill="#FFF9C4"
        />
        <path
          d="M47 8.5 L47.7 11.2 L50 12 L47.7 12.8 L47 15.5 L46.3 12.8 L44 12 L46.3 11.2 Z"
          fill="#FFD54F"
        />
        <path
          d="M17 9.5 L17.6 11.8 L20 12.5 L17.6 13.2 L17 15.5 L16.4 13.2 L14 12.5 L16.4 11.8 Z"
          fill="#FFD54F"
        />
      </svg>

      {/* Live Glowing AI Pulse Indicator on top right corner */}
      <span className="absolute -top-1 -right-1 flex h-3 w-3 z-20">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFAA40] opacity-80" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-r from-[#FF9800] to-[#E65100] border border-white shadow-xs" />
      </span>
    </div>
  );

  // The Framed Luxury Card Presentation (Proportional and compact)
  const emblemSvg = framed ? (
    <div className={`relative inline-flex items-center justify-center ${s.frameRadius} p-0.5 bg-white/95 backdrop-blur-md shadow-xs border border-[#FFAA40]/40 hover:border-[#FFAA40]/80 transition-all duration-300 shrink-0`}>
      {innerEmblem}
    </div>
  ) : (
    innerEmblem
  );

  // If iconOnly is true (used strictly for floating button launcher & mobile header)
  if (iconOnly) {
    if (!withLink) return emblemSvg;
    return (
      <Link
        href={href}
        className="inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFAA40] rounded-xl group transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="DineDesk Restaurant AI Discovery"
      >
        {emblemSvg}
      </Link>
    );
  }

  // Full Brand Presentation for Desktop / Laptop inside page nav
  const fullBrand = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {emblemSvg}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className={`font-heading tracking-tight text-[#1b3b2b] ${s.text} leading-tight`}>
            DineDesk
          </span>
          <span className="font-mono font-black tracking-wider uppercase bg-[#132d20] text-[#FFE082] border border-[#FFAA40]/40 rounded-lg px-2 py-0.5 text-[10px] shadow-xs">
            AI
          </span>
        </div>
        <span className={`font-extrabold uppercase tracking-widest text-[#C05621] ${s.sub} leading-tight mt-0.5`}>
          Culinary Intelligence
        </span>
      </div>
    </div>
  );

  if (!withLink) {
    return fullBrand;
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center group transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFAA40] rounded-xl cursor-pointer"
      aria-label="DineDesk Restaurant AI Discovery"
    >
      {fullBrand}
    </Link>
  );
}
