"use client";

import { useState } from "react";
import Link from "next/link";

interface VendorHeaderProps {
  restaurantName?: string;
  pendingCount?: number;
  onRefresh?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function VendorHeader({
  restaurantName = "Sultan's Heritage Kitchen",
  pendingCount = 0,
  onRefresh,
  isSidebarOpen = false,
  onToggleSidebar,
}: VendorHeaderProps) {
  const [isAccepting, setIsAccepting] = useState(true);

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-container-low/95 backdrop-blur-md border-b border-outline-variant z-30 flex items-center justify-between px-space-md lg:px-space-lg">
      <div className="flex items-center gap-space-sm sm:gap-space-md">
        {/* Mobile Hamburger Menu Toggle */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            aria-label={isSidebarOpen ? "Close navigation sidebar" : "Open navigation sidebar"}
          >
            <span className="material-symbols-outlined text-2xl">
              {isSidebarOpen ? "close" : "menu"}
            </span>
          </button>
        )}

        {/* Restaurant selector pill */}
        <div className="flex items-center gap-space-xs bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-outline-variant cursor-pointer shadow-2xs">
          <span className="material-symbols-outlined text-lg text-primary">store</span>
          <span className="font-label-md text-label-md text-on-surface font-semibold truncate max-w-[130px] sm:max-w-none">
            {restaurantName}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed font-label-sm text-[11px] font-semibold">
            <span className="material-symbols-outlined text-xs">verified</span>Verified Outlet
          </span>
        </div>

        {/* Live status toggle */}
        <div className="hidden sm:flex items-center gap-space-xs pl-space-sm border-l border-outline-variant">
          <button
            type="button"
            onClick={() => setIsAccepting(!isAccepting)}
            className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-outline-variant shadow-2xs cursor-pointer hover:bg-surface-container-low transition-colors"
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
                className={`absolute top-0.5 w-3 h-3 bg-surface rounded-full shadow-2xs transition-transform ${
                  isAccepting ? "right-0.5" : "left-0.5"
                }`}
              ></span>
            </div>
          </button>
        </div>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-1 sm:gap-space-sm">
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh order stream"
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">refresh</span>
          </button>
        )}

        <button
          className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
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

        <div className="h-6 w-px bg-outline-variant hidden sm:block"></div>

        {/* Profile */}
        <Link
          href="/dashboard/vendor/manage-profile"
          className="flex items-center gap-2 pl-space-xs hover:opacity-85 transition-opacity"
        >
          <img
            alt="Chef Kabir Profile"
            className="w-8 h-8 rounded-full object-cover border border-outline-variant bg-surface-container"
            src="/avatars/chef-kabir.svg"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/avatars/default-avatar.svg";
            }}
          />
          <div className="hidden sm:flex flex-col text-left">
            <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight">
              Chef Kabir
            </span>
            <span className="font-label-sm text-[11px] text-on-surface-variant leading-tight">
              General Manager
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
