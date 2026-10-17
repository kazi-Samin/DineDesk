"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface VendorSidebarProps {
  pendingCount?: number;
  activeCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function VendorSidebar({
  pendingCount = 0,
  isOpen = false,
  onClose,
}: VendorSidebarProps) {
  const pathname = usePathname();

  const isOverview = pathname === "/dashboard/vendor";
  const isLiveOrders = pathname === "/dashboard/vendor/orders";
  const isReservations = pathname === "/dashboard/vendor/reservations";
  const isMenu = pathname === "/dashboard/vendor/manage-menu";
  const isProfile = pathname === "/dashboard/vendor/manage-profile";

  const handleNavClick = () => {
    if (onClose) onClose();
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

      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-surface-container-low z-40 flex flex-col justify-between border-r border-outline-variant transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="h-16 px-space-md flex items-center justify-between border-b border-outline-variant">
            <Link
              href="/dashboard/vendor"
              onClick={handleNavClick}
              className="flex items-center gap-space-sm"
            >
              <img
                alt="DineDesk"
                className="h-8 w-auto object-contain"
                src="/logo.png"
              />
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
                  DineDesk
                </span>
                <span className="font-label-sm text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">
                  Merchant Console
                </span>
              </div>
            </Link>

            {/* Close button for mobile */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                aria-label="Close sidebar"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            )}
          </div>

          {/* Current Outlet Card */}
          <div className="p-space-sm">
            <div className="bg-surface-container-lowest p-space-sm rounded-lg border border-outline-variant shadow-2xs">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Sultan&apos;s Heritage
                  </span>
                  <span className="font-body-sm text-[12px] text-on-surface-variant">
                    Banani Outlet • DHK
                  </span>
                </div>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed font-label-sm text-[11px] font-semibold">
                  Live
                </span>
              </div>
              <div className="mt-space-xs pt-space-xs border-t border-outline-variant flex items-center justify-between text-on-surface-variant">
                <span className="font-label-sm text-[11px]">Floor Seating</span>
                <span className="font-label-sm text-[11px] text-primary font-semibold">
                  14 / 22 Active
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Nav Links */}
          <nav className="flex-1 px-space-sm space-y-1">
            <Link
              href="/dashboard/vendor"
              onClick={handleNavClick}
              className={`flex items-center justify-between px-space-md py-2.5 rounded-lg transition-all ${
                isOverview
                  ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-xl">dashboard</span>
                <span className="font-label-lg text-label-lg">Overview</span>
              </div>
            </Link>

            <Link
              href="/dashboard/vendor/orders"
              onClick={handleNavClick}
              className={`flex items-center justify-between px-space-md py-2.5 rounded-lg transition-all ${
                isLiveOrders
                  ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-xl">receipt_long</span>
                <span className="font-label-lg text-label-lg">Live Orders</span>
              </div>
              {pendingCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-[11px] font-semibold animate-pulse">
                  {pendingCount}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/vendor/reservations"
              onClick={handleNavClick}
              className={`flex items-center justify-between px-space-md py-2.5 rounded-lg transition-all ${
                isReservations
                  ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-xl">table_restaurant</span>
                <span className="font-label-lg text-label-lg">Table Reservations</span>
              </div>
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full font-label-sm text-[11px] bg-surface-container text-on-surface font-semibold">
                3
              </span>
            </Link>

            <Link
              href="/dashboard/vendor/manage-menu"
              onClick={handleNavClick}
              className={`flex items-center justify-between px-space-md py-2.5 rounded-lg transition-all ${
                isMenu
                  ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-xl">menu_book</span>
                <span className="font-label-lg text-label-lg">Menu Management</span>
              </div>
            </Link>

            <Link
              href="/dashboard/vendor/manage-profile"
              onClick={handleNavClick}
              className={`flex items-center justify-between px-space-md py-2.5 rounded-lg transition-all ${
                isProfile
                  ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-xl">storefront</span>
                <span className="font-label-lg text-label-lg">Restaurant Profile</span>
              </div>
            </Link>

            <div className="my-2 border-t border-outline-variant"></div>

            <Link
              href="/dashboard/customer"
              onClick={handleNavClick}
              className="flex items-center justify-between px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-xl">person</span>
                <span className="font-label-lg text-label-lg">Switch to Diner</span>
              </div>
            </Link>
          </nav>
        </div>

        {/* POS Sync Status Footer */}
        <div className="p-space-sm border-t border-outline-variant bg-surface-container-lowest/80">
          <div className="flex items-center gap-space-sm p-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                POS Sync Online
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                Updated just now
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
