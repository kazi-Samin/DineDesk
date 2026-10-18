"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface VendorSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  pendingCount?: number;
}

export default function VendorSidebar({
  isOpen = true,
  onClose,
  onToggle,
  pendingCount = 4,
}: VendorSidebarProps) {
  const pathname = usePathname();

  const isLiveConsole = pathname === "/dashboard/vendor";
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

  const linkClass = (active: boolean) =>
    `flex items-center ${
      isOpen ? "justify-between px-3 py-2.5" : "justify-center px-2 py-2.5"
    } rounded-xl transition-all ${
      active
        ? "bg-primary-container text-on-primary font-semibold shadow-2xs"
        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
    }`;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-primary/20 backdrop-blur-xs z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed left-0 top-16 bottom-0 bg-surface-container-low z-30 flex flex-col justify-between border-r border-outline-variant shadow-[1px_0_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out ${
          isOpen
            ? "translate-x-0 w-72"
            : "-translate-x-full lg:translate-x-0 lg:w-20"
        }`}
      >
        {/* Floating Collapse / Expand Arrow docked on sidebar's right border */}
        <button
          type="button"
          onClick={handleToggleClick}
          className="absolute -right-3.5 top-5 z-50 w-7 h-7 rounded-full bg-surface-container-lowest border border-outline-variant shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-all cursor-pointer group"
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <span className="material-symbols-outlined text-base transition-transform group-hover:scale-110">
            {isOpen ? "chevron_left" : "chevron_right"}
          </span>
        </button>

        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Current Outlet Shift Card */}
          <div className={isOpen ? "p-3 sm:p-4" : "p-2"}>
            {isOpen ? (
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
            ) : (
              <div
                className="bg-surface-container-lowest p-2 rounded-xl border border-outline-variant shadow-2xs flex items-center justify-center relative"
                title="Sultan's Heritage • Live"
              >
                <span className="material-symbols-outlined text-primary text-xl">storefront</span>
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className={`flex flex-col gap-1 ${isOpen ? "px-3 sm:px-4" : "px-2"}`}>
            <Link
              href="/dashboard/vendor"
              onClick={handleNavClick}
              className={linkClass(isLiveConsole)}
              title="Live Console"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">speed</span>
                {isOpen && (
                  <span className="font-label-lg text-label-lg font-medium">Live Console</span>
                )}
              </div>
            </Link>

            <Link
              href="/dashboard/vendor/orders"
              onClick={handleNavClick}
              className={linkClass(isLiveOrders)}
              title="Live Orders"
            >
              <div className="flex items-center gap-3 relative">
                <span className="material-symbols-outlined text-xl">receipt_long</span>
                {!isOpen && pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-secondary" />
                )}
                {isOpen && (
                  <span className="font-label-lg text-label-lg font-medium">Live Orders</span>
                )}
              </div>
              {isOpen && pendingCount > 0 && (
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
              className={linkClass(isReservations)}
              title="Table Reservations"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">table_restaurant</span>
                {isOpen && (
                  <span className="font-label-lg text-label-lg font-medium">Table Reservations</span>
                )}
              </div>
              {isOpen && (
                <span
                  className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-bold ${
                    isReservations
                      ? "bg-surface-container-lowest text-primary"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  3
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/vendor/reservations#floorplan"
              onClick={handleNavClick}
              className={linkClass(false)}
              title="Kitchen Floorplan"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">grid_view</span>
                {isOpen && (
                  <span className="font-label-lg text-label-lg font-medium">Kitchen Floorplan</span>
                )}
              </div>
            </Link>

            <Link
              href="/dashboard/vendor/manage-menu"
              onClick={handleNavClick}
              className={linkClass(isMenu)}
              title="Menu & Inventory"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">restaurant_menu</span>
                {isOpen && (
                  <span className="font-label-lg text-label-lg font-medium">Menu & Inventory</span>
                )}
              </div>
            </Link>

            <Link
              href="/dashboard/vendor/manage-profile"
              onClick={handleNavClick}
              className={linkClass(isProfile)}
              title="Merchant Profile"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">settings</span>
                {isOpen && (
                  <span className="font-label-lg text-label-lg font-medium">Merchant Profile</span>
                )}
              </div>
            </Link>
          </nav>
        </div>

        {/* Back to Marketplace Link */}
        <div className={`border-t border-outline-variant ${isOpen ? "p-3 sm:p-4" : "p-2"}`}>
          <Link
            href="/"
            onClick={handleNavClick}
            className={`flex items-center ${
              isOpen ? "justify-between px-3 py-2.5" : "justify-center px-2 py-2.5"
            } rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all`}
            title="Back to Marketplace"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl">open_in_new</span>
              {isOpen && (
                <span className="font-label-md text-label-md font-medium">Back to Marketplace</span>
              )}
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
