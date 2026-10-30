// components/ai/DineDeskAILogo.tsx
// Professional Culinary Restaurant AI Logo Identity & Brand Mark

"use client";

import React, { useId } from "react";
import Link from "next/link";

interface DineDeskAILogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "fab";
  withLink?: boolean;
  iconOnly?: boolean;
  href?: string;
  className?: string;
  framed?: boolean;
}

export default function DineDeskAILogo({
  size = "md",
  withLink = true,
  iconOnly = false,
  href = "/",
  className = "",
  framed = false,
}: DineDeskAILogoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "_");
  const goldId = `gold_${uid}`;
  const silverId = `silver_${uid}`;
  const flareId = `flare_${uid}`;

  // Proportions:
  // sm = 32px (chat responses)
  // md = 40px (desktop header)
  // lg = 44px (feature cards / mobile header)
  // xl = 56px (hero presentation)
  // fab = 52px (floating luxury launcher)
  const sizeMap = {
    sm: {
      box: "w-8 h-8",
      radius: "rounded-xl",
      padding: "p-1.5",
      text: "text-base font-bold",
      badge: "text-[9px] px-1.5 py-0.5",
      sub: "text-[9px]",
    },
    md: {
      box: "w-10 h-10",
      radius: "rounded-xl",
      padding: "p-1.5",
      text: "text-lg font-bold",
      badge: "text-[10px] px-2 py-0.5",
      sub: "text-[10px]",
    },
    lg: {
      box: "w-11 h-11",
      radius: "rounded-2xl",
      padding: "p-2",
      text: "text-xl font-bold",
      badge: "text-[10px] px-2 py-0.5",
      sub: "text-[10px]",
    },
    xl: {
      box: "w-14 h-14",
      radius: "rounded-2xl",
      padding: "p-2.5",
      text: "text-2xl font-black",
      badge: "text-xs px-2.5 py-1",
      sub: "text-xs",
    },
    fab: {
      box: "w-[52px] h-[52px]",
      radius: "rounded-[18px]",
      padding: "p-2.5",
      text: "",
      badge: "",
      sub: "",
    },
  };

  const s = sizeMap[size] || sizeMap.md;
  const isFab = size === "fab" || framed;

  // The Culinary AI Emblem (Brand Secondary Terracotta #9f4122 luxury border and smooth squircle radius)
  const emblem = (
    <div
      className={`relative ${s.box} ${s.radius} bg-gradient-to-b from-[#244f3b] via-[#1b3b2b] to-[#10271d] ${s.padding} flex items-center justify-center shrink-0 border-[1.5px] border-[#9f4122]/70 ${
        isFab
          ? "shadow-[0_8px_20px_-3px_rgba(10,25,18,0.5),0_2px_8px_rgba(159,65,34,0.2),inset_0_1px_1px_rgba(255,255,255,0.25)] group-hover:border-[#9f4122] group-hover:shadow-[0_12px_26px_-4px_rgba(10,25,18,0.6),0_0_14px_rgba(159,65,34,0.3)]"
          : "shadow-[0_3px_12px_rgba(15,36,26,0.22),inset_0_1px_1px_rgba(255,255,255,0.2)] group-hover:border-[#9f4122] group-hover:shadow-md"
      } transition-all duration-300`}
    >
      {/* Subtle interior lighting sheen */}
      <div
        className={`absolute inset-0 ${s.radius} bg-[radial-gradient(circle_at_50%_15%,rgba(255,213,79,0.22),transparent_65%)] pointer-events-none`}
      />

      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 select-none"
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

        {/* 1. Fine Dining Platter Base */}
        <ellipse cx="32" cy="49" rx="24" ry="4.5" fill="#F59E0B" />
        <ellipse cx="32" cy="49" rx="24" ry="4.5" fill={`url(#${goldId})`} />
        <ellipse cx="32" cy="48" rx="21" ry="3.5" fill="#0D2016" />
        <ellipse cx="32" cy="47.2" rx="18.5" ry="2.6" fill="#E2E8F0" />
        <ellipse cx="32" cy="47.2" rx="18.5" ry="2.6" fill={`url(#${silverId})`} />

        {/* 2. Luxury Cloche Dome */}
        <path
          d="M15 45 C15 30.5, 22.5 21, 32 21 C41.5 21, 49 30.5, 49 45 Z"
          fill="#F1F5F9"
        />
        <path
          d="M15 45 C15 30.5, 22.5 21, 32 21 C41.5 21, 49 30.5, 49 45 Z"
          fill={`url(#${silverId})`}
        />

        {/* Cloche Inner Ambient Shadow */}
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

        {/* Cloche Crown Finial Knob */}
        <ellipse cx="32" cy="20.5" rx="3.5" ry="2.5" fill="#FFB300" />
        <ellipse cx="32" cy="20.5" rx="3.5" ry="2.5" fill={`url(#${goldId})`} />
        <circle cx="32" cy="18.5" r="2.2" fill="#FFA000" />
        <circle cx="32" cy="18.5" r="2.2" fill={`url(#${goldId})`} />

        {/* 3. Crossed Silverware Silhouette (Fork & Chef Knife) */}
        <g stroke="#1b3b2b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M26 31 V37" />
          <path d="M23.5 31 V34.5 C23.5 35.8 24.5 36.5 26 36.5" />
          <path d="M28.5 31 V34.5 C28.5 35.8 27.5 36.5 26 36.5" />
          <path d="M26 36.5 V42" />
        </g>

        <path
          d="M37.5 30 C36 30 35.2 32 35.2 35 V42 H37.5 V31.2 C37.8 30.8 37.8 30.4 37.5 30 Z"
          fill="#1b3b2b"
        />

        {/* 4. Radiant AI Discovery Star */}
        <path
          d="M32 2 L33.8 10 L41.5 12 L33.8 14 L32 21 L30.2 14 L22.5 12 L30.2 10 Z"
          fill="#FFB300"
        />
        <path
          d="M32 2 L33.8 10 L41.5 12 L33.8 14 L32 21 L30.2 14 L22.5 12 L30.2 10 Z"
          fill={`url(#${flareId})`}
        />
        <circle cx="32" cy="12" r="1.5" fill="#FFFFFF" />

        {/* Constellation Sparkles */}
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

      {/* Live AI Status Jewel Indicator on Top-Right Corner */}
      <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 z-20 pointer-events-none">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-50" />
        <span className="relative inline-flex rounded-full h-full w-full bg-gradient-to-tr from-[#9f4122] via-amber-400 to-amber-200 border-[1.5px] border-white shadow-xs" />
      </span>
    </div>
  );

  // Icon only rendering
  if (iconOnly) {
    if (!withLink) return emblem;
    return (
      <Link
        href={href}
        className="inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl group transition-transform duration-200 hover:scale-105 active:scale-95"
        aria-label="DineDesk AI Home"
      >
        {emblem}
      </Link>
    );
  }

  // Full Brand Presentation for Desktop & Tablet
  const fullBrand = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {emblem}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className={`font-heading tracking-tight text-[#1b3b2b] ${s.text} leading-none`}>
            DineDesk
          </span>
          <span className={`font-mono font-bold tracking-wide uppercase bg-[#1b3b2b] text-amber-300 rounded-md border border-amber-400/30 ${s.badge} leading-none`}>
            AI
          </span>
        </div>
        <span className={`font-semibold uppercase tracking-wider text-[#C05621] ${s.sub} leading-none mt-1`}>
          Dining Concierge
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
      className="inline-flex items-center group transition-transform duration-200 hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl"
      aria-label="DineDesk AI Home"
    >
      {fullBrand}
    </Link>
  );
}
