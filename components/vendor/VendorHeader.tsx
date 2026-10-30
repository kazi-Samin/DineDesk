"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface VendorHeaderProps {
  userName?: string;
  restaurantName?: string;
  pendingCount?: number;
  onRefresh?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function VendorHeader({
  userName,
  restaurantName,
  pendingCount = 0,
  onRefresh,
  isSidebarOpen = false,
  onToggleSidebar,
}: VendorHeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const [isAccepting, setIsAccepting] = useState(true);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
    setRoleMenuOpen(false);
  }, [pathname]);

  const displayName = userName || user?.name || "Kitchen Manager";
  const userAvatar =
    (user as any)?.avatarUrl ||
    (user as any)?.image ||
    (user as any)?.avatar ||
    "";

  const displayRestaurant =
    restaurantName ||
    (user as any)?.restaurant?.name ||
    (user as any)?.restaurantName ||
    "DineDesk Kitchen Partner";

  const isOpsActive =
    pathname === "/dashboard/vendor" ||
    pathname?.startsWith("/dashboard/vendor/orders") ||
    pathname?.startsWith("/dashboard/vendor/floor") ||
    pathname?.startsWith("/dashboard/vendor/reservations");

  const isMenuActive = pathname?.startsWith("/dashboard/vendor/manage-menu");
  const isSettingsActive = pathname?.startsWith("/dashboard/vendor/manage-profile");

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white/95 backdrop-blur-xl border-b border-[#1b3b2b]/10 shadow-xs">
      <div className="h-full w-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">

        {/* Left: Mobile Toggle + Large Brand Logo + Compact Console Tag */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          {/* Mobile Sidebar Toggle */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-[#1b3b2b] hover:bg-[#1b3b2b]/5 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Sidebar"
            >
              <span className="material-symbols-outlined text-2xl">
                {isSidebarOpen ? "close" : "menu"}
              </span>
            </button>
          )}

          {/* Standalone Large Animated Brand Logo (Transparent background) */}
          <Link
            className="group relative flex items-center transition-transform duration-300 hover:scale-105"
            href="/dashboard/vendor"
            title="DineDesk Vendor Suite"
          >
            {/* Luminous aura behind logo */}
            <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-[#1b3b2b]/15 via-[#C05621]/15 to-emerald-400/20 blur-md opacity-60 group-hover:opacity-100 transition-opacity" />

            {/* Expanded Responsive Logo Dimensions */}
            <div className="relative h-9 sm:h-10 w-28 sm:w-36 flex items-center justify-start bg-transparent">
              <Image
                alt="DineDesk Logo"
                className="w-full h-full object-contain object-left drop-shadow-xs transition-transform duration-300 group-hover:rotate-0.5"
                src="/assets/DineDesk Monogram.png"
                width={160}
                height={44}
                priority
              />
            </div>
          </Link>

          {/* Compact Minimalist Vendor Console Tag */}
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-[#1b3b2b]/5 text-[#1b3b2b] text-[9px] font-extrabold uppercase tracking-widest border border-[#1b3b2b]/10 select-none">
            VENDOR
          </span>

          <div className="h-5 w-px bg-neutral-200 hidden md:block ml-0.5" />

          {/* Restaurant Status Pill */}
          <div className="hidden md:flex items-center gap-2 bg-[#FBFBFA] px-2.5 py-1.5 rounded-xl border border-[#1b3b2b]/10 shadow-2xs">
            <span className="material-symbols-outlined text-base text-[#C05621]">
              storefront
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#1b3b2b] truncate max-w-[120px] lg:max-w-[180px]">
                {displayRestaurant}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[9px] font-extrabold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Shift
              </span>
            </div>
          </div>
        </div>

        {/* Center: Clean Proportional Navigation Tabs */}
        <nav ref={navRef} className="hidden md:flex items-center gap-1.5">

          {/* Group 1: Live Operations */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("ops")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === "ops" ? null : "ops")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isOpsActive
                  ? "bg-[#1b3b2b] text-white shadow-2xs"
                  : "text-neutral-700 hover:text-[#1b3b2b] hover:bg-[#1b3b2b]/5"
                }`}
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>Live Operations</span>
              <span className="material-symbols-outlined text-xs">
                {activeDropdown === "ops" ? "expand_less" : "expand_more"}
              </span>
            </button>

            {activeDropdown === "ops" && (
              <div className="absolute top-full left-0 mt-1 w-60 bg-white border border-[#1b3b2b]/10 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <Link
                  href="/dashboard/vendor"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1b3b2b] hover:bg-[#FBFBFA] transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-[#1b3b2b]">dashboard</span>
                  <div>
                    <span className="block font-bold">Shift Overview</span>
                    <span className="text-[10px] text-neutral-500 font-normal">Real-time metrics & performance</span>
                  </div>
                </Link>
                <Link
                  href="/dashboard/vendor/orders"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1b3b2b] hover:bg-[#FBFBFA] transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-[#C05621]">receipt_long</span>
                  <div>
                    <span className="block font-bold">Kitchen Orders &amp; Queue</span>
                    <span className="text-[10px] text-neutral-500 font-normal">Active tickets, cooking, & delivery</span>
                  </div>
                </Link>
                <Link
                  href="/dashboard/vendor/floor"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1b3b2b] hover:bg-[#FBFBFA] transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-[#1b3b2b]">table_restaurant</span>
                  <div>
                    <span className="block font-bold">Dining Room Floor</span>
                    <span className="text-[10px] text-neutral-500 font-normal">Table matrix & floorplan visualizer</span>
                  </div>
                </Link>
                <Link
                  href="/dashboard/vendor/reservations"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1b3b2b] hover:bg-[#FBFBFA] transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-[#C05621]">event_seat</span>
                  <div>
                    <span className="block font-bold">Table Reservations</span>
                    <span className="text-[10px] text-neutral-500 font-normal">Upcoming table holds & seating</span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Group 2: Menu & Specials */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("menu")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === "menu" ? null : "menu")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isMenuActive
                  ? "bg-[#1b3b2b] text-white shadow-2xs"
                  : "text-neutral-700 hover:text-[#1b3b2b] hover:bg-[#1b3b2b]/5"
                }`}
            >
              <span className="material-symbols-outlined text-base">restaurant_menu</span>
              <span>Menu &amp; Specials</span>
              <span className="material-symbols-outlined text-xs">
                {activeDropdown === "menu" ? "expand_less" : "expand_more"}
              </span>
            </button>

            {activeDropdown === "menu" && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-[#1b3b2b]/10 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <Link
                  href="/dashboard/vendor/manage-menu"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1b3b2b] hover:bg-[#FBFBFA] transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-[#1b3b2b]">menu_book</span>
                  <div>
                    <span className="block font-bold">Manage Dishes</span>
                    <span className="text-[10px] text-neutral-500 font-normal">Pricing, photos, & categories</span>
                  </div>
                </Link>
                <Link
                  href="/explore"
                  target="_blank"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-[#FBFBFA] transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-[#C05621]">open_in_new</span>
                  <div>
                    <span className="block font-bold">Public Diner View</span>
                    <span className="text-[10px] text-neutral-500 font-normal">Live storefront preview</span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Group 3: Outlet Settings */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("settings")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === "settings" ? null : "settings")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSettingsActive
                  ? "bg-[#1b3b2b] text-white shadow-2xs"
                  : "text-neutral-700 hover:text-[#1b3b2b] hover:bg-[#1b3b2b]/5"
                }`}
            >
              <span className="material-symbols-outlined text-base">store</span>
              <span>Settings</span>
              <span className="material-symbols-outlined text-xs">
                {activeDropdown === "settings" ? "expand_less" : "expand_more"}
              </span>
            </button>

            {activeDropdown === "settings" && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-[#1b3b2b]/10 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <Link
                  href="/dashboard/vendor/manage-profile"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1b3b2b] hover:bg-[#FBFBFA] transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-[#1b3b2b]">storefront</span>
                  <div>
                    <span className="block font-bold">Restaurant Profile</span>
                    <span className="text-[10px] text-neutral-500 font-normal">Address, hours, & contact</span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Right: Live Kitchen Toggle, Refresh, Bell, Elevated Profile Capsule */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Order Acceptance Switch */}
          <button
            type="button"
            onClick={() => setIsAccepting(!isAccepting)}
            className="flex items-center gap-2 bg-[#FBFBFA] hover:bg-neutral-100 px-2 sm:px-3 py-1.5 rounded-xl border border-[#1b3b2b]/10 shadow-2xs cursor-pointer transition-colors"
            title="Toggle kitchen order acceptance"
          >
            <span
              className={`w-2 h-2 rounded-full ${isAccepting ? "bg-emerald-600 animate-pulse" : "bg-red-500"
                }`}
            />
            <span className="text-xs text-[#1b3b2b] font-bold hidden sm:inline">
              {isAccepting ? "Accepting Orders" : "Kitchen Paused"}
            </span>
            <div
              className={`w-7 h-4 rounded-full relative transition-colors ${isAccepting ? "bg-[#1b3b2b]" : "bg-neutral-300"
                }`}
            >
              <span
                className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-2xs transition-transform ${isAccepting ? "right-0.5" : "left-0.5"
                  }`}
              />
            </div>
          </button>

          {/* Refresh Action */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh live orders & bookings"
              className="p-2 rounded-xl text-neutral-600 hover:text-[#1b3b2b] hover:bg-[#1b3b2b]/5 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-xl">refresh</span>
            </button>
          )}

          {/* Pending Alerts Bell */}
          <div className="relative">
            <Link
              href="/dashboard/vendor/orders"
              className="relative p-2 rounded-xl text-neutral-600 hover:text-[#1b3b2b] hover:bg-[#1b3b2b]/5 transition-colors flex items-center justify-center"
              aria-label="Pending Kitchen Orders"
            >
              <span className="material-symbols-outlined text-2xl">notifications</span>
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#C05621] text-white rounded-full text-[10px] flex items-center justify-center font-bold animate-pulse">
                  {pendingCount}
                </span>
              )}
            </Link>
          </div>

          <div className="h-5 w-px bg-neutral-200 hidden sm:block" />

          {/* Elevated Manager Profile Capsule */}
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-[#FBFBFA] hover:bg-neutral-100 border border-[#1b3b2b]/15 transition-all shadow-2xs cursor-pointer group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1b3b2b] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-2xs overflow-hidden border border-white group-hover:scale-105 transition-transform">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{displayName ? displayName.charAt(0).toUpperCase() : "M"}</span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs sm:text-[13px] text-[#1b3b2b] font-black leading-tight truncate max-w-[130px]">
                  {displayName}
                </span>
                <span className="text-[10px] text-[#C05621] font-bold leading-tight mt-0.5">
                  Restaurant Manager
                </span>
              </div>
              <span className="material-symbols-outlined text-base text-neutral-400 group-hover:text-[#1b3b2b] transition-colors hidden sm:block">
                expand_more
              </span>
            </button>

            {/* Profile Dropdown */}
            {roleMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#1b3b2b]/10 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-neutral-100 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1b3b2b] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-white">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{displayName ? displayName.charAt(0).toUpperCase() : "M"}</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                      Manager Account
                    </span>
                    <span className="text-xs font-bold text-[#1b3b2b] block truncate">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-neutral-500 block truncate">
                      {user?.email || "vendor@dinedesk.com"}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href="/dashboard/vendor/manage-profile"
                    onClick={() => setRoleMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neutral-700 hover:bg-[#FBFBFA] hover:text-[#1b3b2b] font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-[#1b3b2b]">store</span>
                    <span>Outlet Profile</span>
                  </Link>

                  <Link
                    href="/dashboard/customer"
                    onClick={() => setRoleMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neutral-700 hover:bg-[#FBFBFA] hover:text-[#1b3b2b] font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-neutral-500">person</span>
                    <span>Customer View</span>
                  </Link>

                  <Link
                    href="/"
                    onClick={() => setRoleMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neutral-700 hover:bg-[#FBFBFA] hover:text-[#1b3b2b] font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-neutral-500">home</span>
                    <span>DineDesk Home</span>
                  </Link>

                  <div className="my-1 border-t border-neutral-100" />

                  <button
                    type="button"
                    onClick={() => {
                      setRoleMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 font-bold transition-colors text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}