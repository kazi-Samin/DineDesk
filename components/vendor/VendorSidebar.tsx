"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface VendorSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  pendingCount?: number;
  restaurantName?: string;
  activeTablesCount?: number;
  totalTablesCount?: number;
}

export default function VendorSidebar({
  isOpen = true,
  onClose,
  onToggle,
  pendingCount = 0,
  restaurantName,
  activeTablesCount = 0,
  totalTablesCount = 0,
}: VendorSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isLiveConsole = pathname === "/dashboard/vendor";
  const isLiveOrders = pathname === "/dashboard/vendor/orders";
  const isReservations = pathname === "/dashboard/vendor/reservations";
  const isFloor = pathname === "/dashboard/vendor/floor" || pathname === "/dashboard/vendor/floorplan";
  const isMenu = pathname === "/dashboard/vendor/manage-menu";
  const isProfile = pathname === "/dashboard/vendor/manage-profile";

  const resolvedName = user?.name || "Kitchen Manager";
  const resolvedAvatar =
    (user as any)?.avatarUrl ||
    (user as any)?.image ||
    (user as any)?.avatar ||
    "";
  const resolvedRestaurant =
    restaurantName ||
    (user as any)?.restaurant?.name ||
    (user as any)?.restaurantName ||
    "DineDesk Culinary Outlet";

  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  const handleToggleClick = () => {
    if (onToggle) {
      onToggle();
    } else if (isOpen && onClose) {
      onClose();
    }
  };

  const linkClass = (active: boolean) => {
    if (isOpen) {
      return `group relative flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-200 ${active
          ? "bg-[#1b3b2b] text-white shadow-md shadow-[#1b3b2b]/15 font-bold"
          : "text-neutral-600 hover:text-[#1b3b2b] hover:bg-[#1b3b2b]/5 font-semibold"
        }`;
    }

    return `group relative w-11 h-11 mx-auto flex items-center justify-center rounded-2xl transition-all duration-200 ${active
        ? "bg-[#1b3b2b] text-white shadow-md shadow-[#1b3b2b]/25 ring-2 ring-[#1b3b2b]/10"
        : "text-neutral-600 hover:text-[#1b3b2b] hover:bg-[#1b3b2b]/8"
      }`;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#1b3b2b]/25 backdrop-blur-xs z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`fixed left-0 top-16 bottom-0 bg-white z-40 flex flex-col justify-between border-r border-[#1b3b2b]/10 shadow-[2px_0_20px_rgba(27,59,43,0.04)] transition-all duration-300 ease-in-out ${isOpen
            ? "translate-x-0 w-72"
            : "-translate-x-full lg:translate-x-0 lg:w-20"
          }`}
      >
        {/* Compact Collapse / Expand Arrow */}
        <button
          type="button"
          onClick={handleToggleClick}
          className="hidden lg:flex absolute -right-3 top-5 z-50 w-6 h-6 rounded-full bg-white border border-[#1b3b2b]/15 shadow-sm items-center justify-center text-[#1b3b2b] hover:bg-[#1b3b2b] hover:text-white hover:border-[#1b3b2b] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <span
            className={`material-symbols-outlined text-[13px] leading-none transition-transform duration-300 ${isOpen ? "rotate-0 group-hover:-translate-x-0.5" : "rotate-180 group-hover:translate-x-0.5"
              }`}
          >
            chevron_left
          </span>
        </button>

        {/* TOP SECTION: Animated Logo & Manager Profile */}
        <div className="flex flex-col border-b border-[#1b3b2b]/10">

          {/* Brand Logo Header */}
          <div className={`flex items-center ${isOpen ? "px-5 py-4 justify-between" : "p-3 justify-center"} bg-gradient-to-b from-[#1b3b2b]/5 to-transparent`}>
            <Link
              href="/dashboard/vendor"
              className="flex items-center gap-3.5 group relative"
              title="DineDesk Vendor Suite"
            >
              <div className="relative flex items-center justify-center shrink-0">
                <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-[#1b3b2b]/20 via-[#C05621]/20 to-emerald-400/20 blur-xs animate-pulse opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -inset-1 rounded-2xl border border-dashed border-[#1b3b2b]/25 animate-[spin_14s_linear_infinite]" />
                <div className="relative w-11 h-11 rounded-2xl bg-white shadow-sm border border-[#1b3b2b]/15 flex items-center justify-center p-1.5 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src="/assets/logo.png"
                    alt="DineDesk Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
              </div>

              {isOpen && (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-black text-lg sm:text-xl text-[#1b3b2b] tracking-tight leading-none">
                      DineDesk
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#C05621]/10 text-[#C05621] border border-[#C05621]/25">
                      Ops
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider mt-1">
                    Vendor Suite 2.0
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Manager Profile Capsule with Real Avatar Image */}
          <div className={isOpen ? "p-3.5 pt-2" : "p-2 pt-2"}>
            {isOpen ? (
              <div className="bg-[#FBFBFA] rounded-2xl p-3.5 border border-[#1b3b2b]/10 shadow-2xs flex flex-col gap-2.5">
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0 mt-0.5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#1b3b2b] to-emerald-900 text-white flex items-center justify-center font-black text-base shadow-xs border border-white overflow-hidden">
                      {resolvedAvatar ? (
                        <img
                          src={resolvedAvatar}
                          alt={resolvedName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{resolvedName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <h4 className="text-sm font-black text-[#1b3b2b] leading-tight tracking-tight break-words">
                      {resolvedName}
                    </h4>
                    <span className="text-[11px] text-[#C05621] font-bold leading-tight mt-1">
                      Restaurant General Manager
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-[#1b3b2b]/5 text-[11px]">
                  <span className="text-neutral-500 font-medium truncate max-w-[130px]" title={resolvedRestaurant}>
                    {resolvedRestaurant}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200/80 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="w-11 h-11 mx-auto rounded-xl bg-[#1b3b2b] text-white flex items-center justify-center font-black text-base shadow-xs relative group cursor-pointer overflow-hidden border border-white"
                title={`${resolvedName} • Active General Manager`}
              >
                {resolvedAvatar ? (
                  <img
                    src={resolvedAvatar}
                    alt={resolvedName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{resolvedName.charAt(0).toUpperCase()}</span>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE SECTION: Navigation Links */}
        <div className="flex flex-col flex-1 overflow-y-auto py-3">
          <nav className={`flex flex-col gap-2 ${isOpen ? "px-3.5" : "px-2"}`}>

            <Link
              href="/dashboard/vendor"
              onClick={handleNavClick}
              className={linkClass(isLiveConsole)}
              title="Operations Console"
            >
              <div className="flex items-center gap-3.5">
                <span className={`material-symbols-outlined text-xl ${isLiveConsole ? "text-white" : "text-neutral-500 group-hover:text-[#1b3b2b]"}`}>
                  speed
                </span>
                {isOpen && <span className="text-xs font-extrabold tracking-tight">Operations Console</span>}
              </div>
              {isOpen && isLiveConsole && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </Link>

            <Link
              href="/dashboard/vendor/orders"
              onClick={handleNavClick}
              className={linkClass(isLiveOrders)}
              title="Live Orders"
            >
              <div className="flex items-center gap-3.5 relative">
                <span className={`material-symbols-outlined text-xl ${isLiveOrders ? "text-white" : "text-neutral-500 group-hover:text-[#1b3b2b]"}`}>
                  receipt_long
                </span>
                {!isOpen && pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#C05621] ring-2 ring-white" />
                )}
                {isOpen && <span className="text-xs font-extrabold tracking-tight">Live Orders</span>}
              </div>
              {isOpen && pendingCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${isLiveOrders
                      ? "bg-white text-[#1b3b2b]"
                      : "bg-[#C05621] text-white shadow-2xs"
                    }`}
                >
                  {pendingCount} New
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/vendor/reservations"
              onClick={handleNavClick}
              className={linkClass(isReservations)}
              title="Table Seating & Holds"
            >
              <div className="flex items-center gap-3.5">
                <span className={`material-symbols-outlined text-xl ${isReservations ? "text-white" : "text-neutral-500 group-hover:text-[#1b3b2b]"}`}>
                  event_seat
                </span>
                {isOpen && <span className="text-xs font-extrabold tracking-tight">Table Seating</span>}
              </div>
            </Link>

            <Link
              href="/dashboard/vendor/floor"
              onClick={handleNavClick}
              className={linkClass(isFloor)}
              title="Dining Room Floor Matrix"
            >
              <div className="flex items-center gap-3.5">
                <span className={`material-symbols-outlined text-xl ${isFloor ? "text-white" : "text-neutral-500 group-hover:text-[#1b3b2b]"}`}>
                  grid_view
                </span>
                {isOpen && <span className="text-xs font-extrabold tracking-tight">Floor &amp; Tables</span>}
              </div>
            </Link>

            <Link
              href="/dashboard/vendor/manage-menu"
              onClick={handleNavClick}
              className={linkClass(isMenu)}
              title="Menu & Specials Management"
            >
              <div className="flex items-center gap-3.5">
                <span className={`material-symbols-outlined text-xl ${isMenu ? "text-white" : "text-neutral-500 group-hover:text-[#1b3b2b]"}`}>
                  restaurant_menu
                </span>
                {isOpen && <span className="text-xs font-extrabold tracking-tight">Menu &amp; Specials</span>}
              </div>
            </Link>

            <Link
              href="/dashboard/vendor/manage-profile"
              onClick={handleNavClick}
              className={linkClass(isProfile)}
              title="Restaurant Profile & Settings"
            >
              <div className="flex items-center gap-3.5">
                <span className={`material-symbols-outlined text-xl ${isProfile ? "text-white" : "text-neutral-500 group-hover:text-[#1b3b2b]"}`}>
                  settings
                </span>
                {isOpen && <span className="text-xs font-extrabold tracking-tight">Restaurant Settings</span>}
              </div>
            </Link>
          </nav>
        </div>

        {/* BOTTOM SECTION: Elevated Back to Home & Sign Out */}
        <div className={`border-t border-[#1b3b2b]/10 bg-[#FBFBFA]/80 pt-3.5 pb-6 ${isOpen ? "px-3.5 space-y-2" : "px-2 space-y-2"}`}>

          <Link
            href="/"
            onClick={handleNavClick}
            className={`flex items-center ${isOpen ? "justify-between px-3.5 py-2.5" : "w-11 h-11 mx-auto justify-center"
              } rounded-xl text-neutral-700 hover:text-[#1b3b2b] hover:bg-white border border-transparent hover:border-[#1b3b2b]/10 transition-all shadow-2xs group`}
            title="Return to DineDesk Home"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg text-neutral-500 group-hover:text-[#1b3b2b] group-hover:-translate-x-0.5 transition-transform">
                arrow_back
              </span>
              {isOpen && <span className="text-xs font-bold">Back to Home</span>}
            </div>
            {isOpen && (
              <span className="material-symbols-outlined text-xs text-neutral-400 group-hover:text-neutral-600">
                open_in_new
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => {
              handleNavClick();
              logout();
            }}
            className={`flex items-center ${isOpen ? "w-full justify-start px-3.5 py-2.5" : "w-11 h-11 mx-auto justify-center"
              } rounded-xl text-red-600 hover:text-white bg-red-50/80 hover:bg-red-600 border border-red-200/60 hover:border-red-600 transition-all shadow-2xs cursor-pointer group`}
            title="Sign Out of Vendor Console"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg text-red-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform">
                logout
              </span>
              {isOpen && <span className="text-xs font-extrabold">Sign Out</span>}
            </div>
          </button>
        </div>

      </aside>
    </>
  );
}