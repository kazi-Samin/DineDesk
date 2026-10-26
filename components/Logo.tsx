"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  withLink?: boolean;
}

const SIZE_MAP = {
  sm: { height: 32, width: 140, className: "h-8" },
  md: { height: 42, width: 180, className: "h-10 sm:h-11" },
  lg: { height: 52, width: 220, className: "h-12 sm:h-14" },
};

export default function Logo({ size = "md", className = "", withLink = true }: LogoProps) {
  const currentSize = SIZE_MAP[size] || SIZE_MAP.md;

  const logoImage = (
    <div className={`relative flex items-center justify-start ${currentSize.className} ${className}`}>
      <Image
        src="/assets/DineDesk Monogram.png"
        alt="DineDesk"
        width={currentSize.width}
        height={currentSize.height}
        className="h-full w-auto object-contain select-none"
        priority
        unoptimized
      />
    </div>
  );

  if (!withLink) {
    return logoImage;
  }

  return (
    <Link
      href="/"
      className="inline-flex items-center group transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
      aria-label="DineDesk Home"
    >
      {logoImage}
    </Link>
  );
}


