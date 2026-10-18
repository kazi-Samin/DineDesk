"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  pendingApprovalsCount?: number;
}

export default function AdminSidebar({
  isOpen = true,
  onClose,
  onToggle,
  pendingApprovalsCount = 8,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isOverview = pathname === "/dashboard/admin";
  const isAnalytics = pathname === "/dashboard/admin/analytics";
  const isUsers = pathname?.startsWith("/dashboard/admin/users");
  const isRestaurants = pathname?.startsWith("/dashboard/admin/restaurants");
  const isTransactions = pathname?.startsWith("/dashboard/admin/transactions");
  const isAdmins = pathname?.startsWith("/dashboard/admin/admins");
  const isSettings = pathname?.startsWith("/dashboard/admin/settings");
  const isAuditLogs = pathname?.startsWith("/dashboard/admin/audit-logs");

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
    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
      active
        ? "bg-primary-container text-on-primary font-bold shadow-2xs"
        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
    }`;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-primary/25 backdrop-blur-xs z-30 lg:hidden"
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
          title="Expand admin sidebar"
          aria-label="Expand admin sidebar"
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

        {/* Scrollable Navigation Sections */}
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Brand Sub-header in Sidebar */}
          <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">shield_person</span>
              <div className="flex flex-col">
                <span className="font-headline-sm text-xs font-bold text-primary leading-tight">
                  Governance Hub
                </span>
                <span className="font-label-sm text-[10px] text-on-surface-variant">
                  Platform Telemetry
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live
            </span>
          </div>

          {/* 1. Administration Section */}
          <div className="space-y-1">
            <span className="px-3 text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant/70 block mb-1">
              Administration
            </span>

            <Link
              href="/dashboard/admin"
              onClick={handleNavClick}
              className={linkClass(isOverview)}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-lg">dashboard</span>
                <span>Overview</span>
              </div>
            </Link>

            <Link
              href="/dashboard/admin/analytics"
              onClick={handleNavClick}
              className={linkClass(isAnalytics)}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-lg">monitoring</span>
                <span>System Analytics</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-secondary-fixed text-on-secondary-fixed">
                Trends
              </span>
            </Link>

            <Link
              href="/dashboard/admin/users"
              onClick={handleNavClick}
              className={linkClass(isUsers)}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-lg">group</span>
                <span>Manage Users</span>
              </div>
              <span className="text-[11px] text-on-surface-variant font-mono">48.2k</span>
            </Link>

            <Link
              href="/dashboard/admin/restaurants"
              onClick={handleNavClick}
              className={linkClass(isRestaurants)}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-lg">storefront</span>
                <span>Manage Restaurants</span>
              </div>
              {pendingApprovalsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full font-label-sm text-[10px] font-bold bg-secondary text-on-secondary">
                  +{pendingApprovalsCount}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/admin/transactions"
              onClick={handleNavClick}
              className={linkClass(isTransactions)}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-lg">receipt_long</span>
                <span>All Transactions</span>
              </div>
            </Link>
          </div>

          {/* 2. Super Admin Governance Section */}
          <div className="space-y-1 pt-2 border-t border-outline-variant/60">
            <span className="px-3 text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant/70 block mb-1">
              Super Admin
            </span>

            <Link
              href="/dashboard/admin/admins"
              onClick={handleNavClick}
              className={linkClass(isAdmins)}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                <span>Manage Admins</span>
              </div>
            </Link>

            <Link
              href="/dashboard/admin/settings"
              onClick={handleNavClick}
              className={linkClass(isSettings)}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-lg">tune</span>
                <span>Platform Settings</span>
              </div>
            </Link>
          </div>

          {/* 3. System & Support Section */}
          <div className="space-y-1 pt-2 border-t border-outline-variant/60">
            <span className="px-3 text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant/70 block mb-1">
              System &amp; Support
            </span>

            <Link
              href="/dashboard/admin/audit-logs"
              onClick={handleNavClick}
              className={linkClass(isAuditLogs)}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-lg">history</span>
                <span>Audit Logs</span>
              </div>
            </Link>

            <Link
              href="/"
              onClick={handleNavClick}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-lg">open_in_new</span>
                <span>Back to Marketplace</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom Cluster Status Bar */}
        <div className="p-3 border-t border-outline-variant bg-surface-container-low">
          <div className="bg-surface-container p-2.5 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-label-sm text-[11px] text-on-surface font-semibold">
                Cluster DHK-1
              </span>
            </div>
            <span className="font-mono text-[11px] text-on-surface-variant">v2.14.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
