"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface VendorSidebarProps {
  pendingCount?: number;
  activeCount?: number;
}

export default function VendorSidebar({ pendingCount = 0 }: VendorSidebarProps) {
  const pathname = usePathname();

  const isLiveOrders = pathname === "/dashboard/vendor/orders";

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-low z-40 flex flex-col justify-between border-r border-outline-variant/40">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 px-space-md flex items-center gap-space-sm border-b border-outline-variant/30">
          <Link href="/" className="flex items-center gap-space-sm">
            <img
              alt="DineDesk"
              className="h-8 w-auto object-contain"
              src="/logo.png"
            />
          </Link>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight">
              DineDesk
            </span>
            <span className="font-label-sm text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">
              Merchant Console
            </span>
          </div>
        </div>

        {/* Current Outlet Card */}
        <div className="p-space-sm">
          <div className="bg-surface-container-lowest p-space-sm rounded-xl border border-outline-variant/50 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Sultan&apos;s Heritage
                </span>
                <span className="font-body-sm text-[12px] text-on-surface-variant">
                  Banani Outlet • DHK
                </span>
              </div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-lg bg-surface-container text-on-primary-fixed-variant font-label-sm text-[11px] border border-outline-variant/40">
                Live
              </span>
            </div>
            <div className="mt-space-xs pt-space-xs border-t border-outline-variant/30 flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-[11px]">Table Occupancy</span>
              <span className="font-label-sm text-[11px] text-primary font-semibold">
                14 / 22 Active
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-space-sm space-y-1">
          <Link
            href="/dashboard/vendor/orders"
            className={`flex items-center justify-between px-space-md py-2.5 rounded-xl transition-all ${
              isLiveOrders
                ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
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
            className={`flex items-center justify-between px-space-md py-2.5 rounded-xl transition-all ${
              pathname === "/dashboard/vendor/reservations"
                ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-xl">table_restaurant</span>
              <span className="font-label-lg text-label-lg">Table Reservations</span>
            </div>
            <span
              className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full font-label-sm text-[11px] ${
                pathname === "/dashboard/vendor/reservations"
                  ? "bg-surface-container-high text-on-surface"
                  : "bg-surface-container-high text-on-surface"
              }`}
            >
              3
            </span>
          </Link>

          <Link
            href="/explore"
            className="flex items-center justify-between px-space-md py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-xl">menu_book</span>
              <span className="font-label-lg text-label-lg">Menu Management</span>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center justify-between px-space-md py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-xl">storefront</span>
              <span className="font-label-lg text-label-lg">Restaurant Profile</span>
            </div>
          </Link>

          <div className="my-2 border-t border-outline-variant/40"></div>

          <Link
            href="/dashboard/orders"
            className="flex items-center justify-between px-space-md py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-xl">person</span>
              <span className="font-label-lg text-label-lg">Switch to Diner</span>
            </div>
          </Link>

          <button
            type="button"
            className="w-full flex items-center justify-between px-space-md py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all text-left"
            onClick={() => alert("Analytics & Settlement logs available in complete merchant bundle.")}
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-xl">query_stats</span>
              <span className="font-label-lg text-label-lg">Analytics &amp; Earnings</span>
            </div>
          </button>
        </nav>
      </div>

      {/* POS Sync Status Footer */}
      <div className="p-space-sm border-t border-outline-variant/30 bg-surface-container-lowest/70">
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
  );
}
