"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getAdminAlerts } from "@/services/mockAdminService";
import { useAuth } from "@/context/AuthContext";

interface AdminHeaderProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onSearch?: (query: string) => void;
}

export default function AdminHeader({
  isSidebarOpen = true,
  onToggleSidebar,
  onSearch,
}: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const alerts = getAdminAlerts();
  const unreadCount = alerts.filter((a) => a.unread).length;

  const isOverview = pathname === "/dashboard/admin";
  const isAnalytics = pathname === "/dashboard/admin/analytics";

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const navLinkClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
      active
        ? "bg-primary-container text-on-primary shadow-2xs font-bold"
        : "text-on-surface-variant hover:text-primary hover:bg-surface-container"
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant shadow-2xs">
      <div className="h-full w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Brand Monogram & Governance Hub Identifier */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link
            className="flex items-center gap-2 group transition-transform duration-300 hover:scale-105"
            href="/"
            title="DineDesk Home"
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
              Governance Hub
            </span>
          </Link>

          <div className="h-6 w-px bg-outline-variant hidden md:block" />

          {/* Breadcrumb & Live System Status Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/60">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-label-sm text-[11px] text-on-surface font-semibold">
              System Healthy • All services operational
            </span>
          </div>
        </div>

        {/* Center: Fast Sub-Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/60">
          <Link href="/dashboard/admin" className={navLinkClass(isOverview)}>
            Overview
          </Link>
          <Link href="/dashboard/admin/analytics" className={navLinkClass(isAnalytics)}>
            Analytics
          </Link>
          <Link href="/dashboard/admin#audits" className={navLinkClass(false)}>
            Audit Stream
          </Link>
        </nav>

        {/* Right: Search, Notifications & Admin Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Search */}
          <div className="relative hidden lg:block w-64 xl:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search audit, merchant, ID..."
              className="w-full bg-surface-container-low text-on-surface text-xs pl-9 pr-8 py-2 rounded-lg border border-outline-variant/80 focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all placeholder:text-on-surface-variant/70"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setRoleMenuOpen(false);
              }}
              className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors cursor-pointer"
              title="Operational Alerts"
              aria-label="Operational Alerts"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface-container-lowest" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-3 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface">System Alerts</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    Close
                  </button>
                </div>
                <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-xs text-on-surface leading-tight">
                          {alert.title}
                        </span>
                        <span className="text-[10px] text-on-surface-variant whitespace-nowrap">
                          {alert.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">
                        {alert.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-outline-variant" />

          {/* Super Admin User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setRoleMenuOpen(!roleMenuOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/70 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "SA"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-label-md text-xs font-semibold text-on-surface leading-tight truncate max-w-[120px]">
                  {user?.name || "Super Admin"}
                </span>
                <span className="font-label-sm text-[10px] text-secondary font-bold leading-tight uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <span className="material-symbols-outlined text-base text-on-surface-variant hidden sm:block">
                expand_more
              </span>
            </button>

            {/* Admin Management Menu */}
            {roleMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-2 border-b border-outline-variant/40">
                  <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block">
                    Active Authority
                  </span>
                  <span className="text-xs font-bold text-primary block mt-0.5 truncate">
                    {user?.name || "Super Admin"}
                  </span>
                  <span className="text-[11px] text-on-surface-variant block mt-0.5 truncate">
                    {user?.email || "admin@dinedesk.com"}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    href="/dashboard/admin/manage-admins"
                    onClick={() => setRoleMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-primary">admin_panel_settings</span>
                    <span>Manage Admins</span>
                  </Link>

                  <Link
                    href="/dashboard/admin/analytics"
                    onClick={() => setRoleMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-primary">analytics</span>
                    <span>Platform Analytics</span>
                  </Link>

                  <Link
                    href="/dashboard/admin/settings"
                    onClick={() => setRoleMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-primary">tune</span>
                    <span>Platform Settings</span>
                  </Link>

                  <Link
                    href="/"
                    onClick={() => setRoleMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-on-surface-variant">home</span>
                    <span>Return to Marketplace</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-outline-variant/40">
                  <button
                    type="button"
                    onClick={() => {
                      setRoleMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-error hover:bg-error-container/20 font-medium transition-colors text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    <span>Log Out Session</span>
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
