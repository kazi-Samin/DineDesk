"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const [isAccepting, setIsAccepting] = useState(true);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const isOverview = pathname === "/dashboard/vendor";
  const isOrders = pathname?.startsWith("/dashboard/vendor/orders");
  const isReservations = pathname?.startsWith("/dashboard/vendor/reservations");
  const isMenu = pathname?.startsWith("/dashboard/vendor/manage-menu");
  const isProfile = pathname?.startsWith("/dashboard/vendor/manage-profile");

  const linkClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
      active
        ? "bg-primary-container text-on-primary shadow-2xs font-bold"
        : "text-on-surface-variant hover:text-primary hover:bg-surface-container"
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant shadow-2xs">
      <div className="h-full w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: DineDesk Logo + Outlet Identifier */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">

          {/* DineDesk Brand Logo (Matching Main Page) */}
          <Link
            className="flex items-center gap-2 group transition-transform duration-300 hover:scale-105"
            href="/dashboard/vendor"
          >
            <div className="h-8 sm:h-9 w-auto flex items-center justify-center">
              <Image
                alt="DineDesk Logo"
                className="h-full w-auto object-contain"
                src="/assets/DineDesk Monogram.png"
                width={150}
                height={36}
                priority
              />
            </div>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-[11px] font-semibold border border-outline-variant/60">
              Merchant Console
            </span>
          </Link>

          <div className="h-6 w-px bg-outline-variant hidden md:block" />

          {/* Restaurant Outlet Pill */}
          <div className="hidden md:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/70 shadow-2xs">
            <span className="material-symbols-outlined text-base text-primary">storefront</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-label-md text-xs font-semibold text-on-surface truncate max-w-[150px] lg:max-w-[200px]">
                  {restaurantName}
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-[10px] font-semibold">
                  <span className="material-symbols-outlined text-[11px]">verified</span>
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Restaurant Owner Page-Wise Operational Navigation (Matching Main Page Link Bar) */}
        <nav className="hidden 2xl:flex items-center gap-1 bg-surface-container-low/80 p-1 rounded-xl border border-outline-variant/60">
          <Link href="/dashboard/vendor" className={linkClass(isOverview)}>
            Overview
          </Link>
          <Link href="/dashboard/vendor/orders" className={linkClass(isOrders)}>
            Live Orders
          </Link>
          <Link href="/dashboard/vendor/reservations" className={linkClass(isReservations)}>
            Reservations
          </Link>
          <Link href="/dashboard/vendor/manage-menu" className={linkClass(isMenu)}>
            Menu Catalog
          </Link>
          <Link href="/dashboard/vendor/manage-profile" className={linkClass(isProfile)}>
            Storefront Settings
          </Link>
        </nav>

        {/* Right: Order Acceptance, Guest Storefront Link, Bell, Chef Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Live Kitchen Status Toggle */}
          <button
            type="button"
            onClick={() => setIsAccepting(!isAccepting)}
            className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container px-2.5 sm:px-3 py-1.5 rounded-xl border border-outline-variant/70 shadow-2xs cursor-pointer transition-colors"
            title="Toggle kitchen order acceptance"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAccepting ? "bg-emerald-600 animate-pulse" : "bg-error"
              }`}
            />
            <span className="font-label-sm text-xs text-on-surface font-semibold hidden sm:inline">
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
              />
            </div>
          </button>

          {/* Quick Link to Guest Storefront */}
          <Link
            href="/restaurants/sultans-dine"
            target="_blank"
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary-fixed/50 hover:bg-primary-fixed border border-primary-fixed-dim transition-colors"
            title="Open live guest-facing storefront in new tab"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            <span>View Guest Menu</span>
          </Link>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh kitchen orders & bookings"
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-xl">refresh</span>
            </button>
          )}

          {/* Notification Bell */}
          <div className="relative">
            <button
              className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
              type="button"
              aria-label="Shift Notifications"
            >
              <span className="material-symbols-outlined text-2xl">notifications</span>
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-secondary text-on-secondary rounded-full font-label-sm text-[10px] flex items-center justify-center font-bold animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          <div className="h-6 w-px bg-outline-variant hidden sm:block" />

          {/* Chef / Owner Profile Pill with Quick Mode Switch */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 transition-colors cursor-pointer"
            >
              <img
                alt="Chef Kabir Ahmed"
                className="w-8 h-8 rounded-full object-cover border border-outline-variant bg-surface-container shrink-0"
                src="/avatars/chef-kabir.svg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/avatars/default-avatar.svg";
                }}
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight">
                  Chef Kabir
                </span>
                <span className="font-label-sm text-[11px] text-secondary font-medium leading-tight">
                  Restaurant Owner
                </span>
              </div>
              <span className="material-symbols-outlined text-base text-on-surface-variant hidden sm:block">
                expand_more
              </span>
            </button>

            {/* Role Switcher Menu */}
            {roleMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-2 border-b border-outline-variant/40">
                  <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
                    Active Console
                  </span>
                  <span className="text-xs font-bold text-primary block mt-0.5">
                    Restaurant Owner Console
                  </span>
                </div>
                <div className="py-1">
                  <Link
                    href="/dashboard/vendor/manage-profile"
                    onClick={() => setRoleMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-primary">storefront</span>
                    <span>Restaurant Profile &amp; Settings</span>
                  </Link>
                  <Link
                    href="/dashboard/orders"
                    onClick={() => setRoleMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-secondary">person</span>
                    <span>Switch to Diner Account</span>
                  </Link>
                  <Link
                    href="/dashboard/admin"
                    onClick={() => setRoleMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-primary">admin_panel_settings</span>
                    <span>Governance Hub (Admin)</span>
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setRoleMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-on-surface-variant">home</span>
                    <span>Return to Public Homepage</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
