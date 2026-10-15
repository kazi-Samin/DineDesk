"use client";

import { useState } from "react";
import Link from "next/link";

interface VendorHeaderProps {
  restaurantName?: string;
  pendingCount?: number;
  onRefresh?: () => void;
}

export default function VendorHeader({
  restaurantName = "Sultan's Heritage Kitchen",
  pendingCount = 0,
  onRefresh,
}: VendorHeaderProps) {
  const [isAccepting, setIsAccepting] = useState(true);

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/40 z-30 flex items-center justify-between px-space-md lg:px-space-lg">
      <div className="flex items-center gap-space-md">
        {/* Restaurant selector pill */}
        <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1.5 rounded-xl border border-outline-variant/50 cursor-pointer">
          <span className="material-symbols-outlined text-lg text-primary">store</span>
          <span className="font-label-md text-label-md text-on-surface font-semibold truncate max-w-[140px] sm:max-w-none">
            {restaurantName}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed font-label-sm text-[11px]">
            <span className="material-symbols-outlined text-xs">verified</span>Verified Partner
          </span>
        </div>

        {/* Live status toggle */}
        <div className="hidden sm:flex items-center gap-space-xs pl-space-sm border-l border-outline-variant/40">
          <button
            type="button"
            onClick={() => setIsAccepting(!isAccepting)}
            className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-outline-variant/60 shadow-xs cursor-pointer"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isAccepting ? "bg-emerald-600 animate-pulse" : "bg-error"
              }`}
            ></span>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">
              {isAccepting ? "Accepting Orders" : "Kitchen Paused"}
            </span>
            <div
              className={`w-7 h-4 rounded-full relative transition-colors ${
                isAccepting ? "bg-primary-container" : "bg-outline-variant"
              }`}
            >
              <span
                className={`absolute top-0.5 w-3 h-3 bg-surface rounded-full shadow-xs transition-transform ${
                  isAccepting ? "right-0.5" : "left-0.5"
                }`}
              ></span>
            </div>
          </button>
        </div>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-space-sm sm:gap-space-md">
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh order stream"
            className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">refresh</span>
          </button>
        )}

        <button
          className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
          type="button"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-2xl">notifications</span>
          {pendingCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-secondary text-on-secondary rounded-full font-label-sm text-[10px] flex items-center justify-center font-bold">
              {pendingCount}
            </span>
          )}
        </button>

        <div className="h-7 w-px bg-outline-variant/40 hidden sm:block"></div>

        {/* Profile */}
        <Link
          href="/dashboard/orders"
          className="flex items-center gap-space-sm pl-space-xs hover:opacity-85 transition-opacity"
        >
          <img
            alt="Chef Profile"
            className="w-8 h-8 rounded-full object-cover border border-outline-variant/60"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuATj-5bVpB67KqXwRJDHpOF-tOKDVAizyDorsdPffwl_Xjw-R7SZAbgsdymkx90d5OalmiW-ir8JfCJVOOTA2zrriohTjINKBIeK0a12SWLMOtlCkYQWtw48YdQPb_fIMHbeZ37HB2maP4LrP2Yw3FP0ytPlWzkTuT2XeHGpoRyUcDXObLkwxNYEKOM3MJMDvbwB1Ks4xTuu3z3aEzOtjc9_i-LlBaoSsmJSx2CNst06Oo5ga2QQd2k2Q"
          />
          <div className="hidden sm:flex flex-col text-left">
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              Chef Kabir
            </span>
            <span className="font-label-sm text-[11px] text-on-surface-variant">
              General Manager
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
