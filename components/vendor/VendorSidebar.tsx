"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface VendorSidebarProps {
  pendingCount?: number;
  activeCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

export default function VendorSidebar({
  pendingCount = 0,
  isOpen = true,
  onClose,
  onToggle,
}: VendorSidebarProps) {
  const pathname = usePathname();

  const isOverview = pathname === "/dashboard/vendor";
  const isLiveOrders = pathname === "/dashboard/vendor/orders";
  const isReservations = pathname === "/dashboard/vendor/reservations";
  const isMenu = pathname === "/dashboard/vendor/manage-menu";
  const isProfile = pathname === "/dashboard/vendor/manage-profile";

  const handleNavClick = () => {
    // Only auto-close on mobile screens
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

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Floating Expand Arrow when sidebar is collapsed */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleToggleClick}
          className="fixed left-0 top-20 z-40 px-1 py-3 bg-surface-container-lowest border border-outline-variant border-l-0 rounded-r-lg shadow-sm hover:bg-surface-container hover:border-primary text-on-surface-variant hover:text-primary transition-all cursor-pointer flex items-center justify-center group"
          title="Expand sidebar"
          aria-label="Expand sidebar"
        >
          <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-0.5">
            chevron_right
          </span>
        </button>
      )}

      <aside
        className={`fixed left-0 top-16 bottom-0 w-72 bg-surface-container-low z-30 flex flex-col justify-between border-r border-outline-variant shadow-[1px_0_8px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        {/* Floating Collapse Arrow docked on sidebar's right border */}
        {isOpen && (
          <button
            type="button"
            onClick={handleToggleClick}
            className="absolute -right-3.5 top-5 z-50 w-7 h-7 rounded-full bg-surface-container-lowest border border-outline-variant shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-all cursor-pointer group"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <span className="material-symbols-outlined text-base transition-transform group-hover:-translate-x-0.5">
              chevron_left
            </span>
          </button>
        )}

        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Current Outlet Shift Card */}
          <div className="p-3 sm:p-4">
            <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant shadow-2xs">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Sultan&apos;s Heritage
                  </span>
                  <span className="font-body-sm text-[12px] text-on-surface-variant">
                    Banani Outlet • DHK
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed font-label-sm text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-outline-variant/60 flex items-center justify-between text-on-surface-variant">
                <span className="font-label-sm text-[11px]">Floor Seating</span>
                <span className="font-label-sm text-[11px] text-primary font-semibold">
                  14 / 22 Active
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Nav Links */}
          <nav className="flex-1 px-3 space-y-1">
            <Link
              href="/dashboard/vendor"
              onClick={handleNavClick}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                isOverview
                  ? "bg-primary-container text-on-primary font-semibold shadow-2xs"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">dashboard</span>
                <span className="font-label-lg text-label-lg font-medium">Overview</span>
              </div>
            </Link>

            <Link
              href="/dashboard/vendor/orders"
              onClick={handleNavClick}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                isLiveOrders
                  ? "bg-primary-container text-on-primary font-semibold shadow-2xs"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">receipt_long</span>
                <span className="font-label-lg text-label-lg font-medium">Live Orders</span>
              </div>
              {pendingCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full font-label-sm text-xs font-bold ${
                    isLiveOrders
                      ? "bg-surface-container-lowest text-primary"
                      : "bg-secondary text-on-secondary"
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/vendor/reservations"
              onClick={handleNavClick}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                isReservations
                  ? "bg-primary-container text-on-primary font-semibold shadow-2xs"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">table_restaurant</span>
                <span className="font-label-lg text-label-lg font-medium">Table Reservations</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-bold ${
                  isReservations
                    ? "bg-surface-container-lowest text-primary"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                3
              </span>
            </Link>

            <Link
              href="/dashboard/vendor/manage-menu"
              onClick={handleNavClick}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                isMenu
                  ? "bg-primary-container text-on-primary font-semibold shadow-2xs"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">menu_book</span>
                <span className="font-label-lg text-label-lg font-medium">Menu Management</span>
              </div>
            </Link>

            <Link
              href="/dashboard/vendor/manage-profile"
              onClick={handleNavClick}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                isProfile
                  ? "bg-primary-container text-on-primary font-semibold shadow-2xs"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">store</span>
                <span className="font-label-lg text-label-lg font-medium">Restaurant Profile</span>
              </div>
            </Link>
          </nav>
        </div>

        {/* Bottom Shift Controls & Mode Switching */}
        <div className="p-3 border-t border-outline-variant/60 space-y-1">
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors text-xs font-medium"
          >
            <span className="material-symbols-outlined text-lg">person</span>
            <span>Switch to Diner</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors text-xs font-medium"
          >
            <span className="material-symbols-outlined text-lg">home</span>
            <span>Return to Homepage</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
