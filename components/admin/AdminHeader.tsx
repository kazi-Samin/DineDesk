// components/admin/AdminHeader.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getAdminAlerts } from "@/services/mockAdminService";
import { useAuth } from "@/context/AuthContext";

interface AdminHeaderProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onSearch?: (query: string) => void;
}

export default function AdminHeader({
  isSidebarOpen,
  onToggleSidebar,
  onSearch,
}: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const alerts = getAdminAlerts();
  const unreadCount = alerts.filter((a) => a.unread).length;

  const isOverview = pathname === "/dashboard/admin";
  const isAnalytics = pathname === "/dashboard/admin/analytics";
  const isUsers = pathname?.startsWith("/dashboard/admin/users") || false;

  const userAvatarUrl =
    (user as any)?.image ||
    (user as any)?.avatar ||
    (user as any)?.picture ||
    (user as any)?.photoURL ||
    (user as any)?.profileImage ||
    "/assets/logo.png";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (roleMenuRef.current && !roleMenuRef.current.contains(target)) {
        setRoleMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [searchOpen]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const navLinkClass = (active: boolean) =>
    `relative px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${active
      ? "bg-[#1b3b2b] text-white shadow-xs"
      : "text-neutral-600 hover:text-[#1b3b2b] hover:bg-neutral-100/70"
    }`;

  const userInitials =
    typeof (user as any)?.name === "string"
      ? ((user as any).name as string)
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
      : "SA";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 h-20 z-40 transition-all duration-500 border-b ${scrolled
            ? "bg-[#e8f3ee]/75 backdrop-blur-xl border-[#2a7a58]/20 shadow-[0_8px_32px_0_rgba(27,75,54,0.1)] [background-image:radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(168,218,200,0.4),rgba(255,255,255,0))]"
            : "bg-white/90 backdrop-blur-md border-[#1b3b2b]/10 shadow-[0_4px_24px_-4px_rgba(27,59,43,0.06)]"
          }`}
      >
        <div className="h-full w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* LEFT: Mobile Sidebar Hamburger Toggle + Moving DineDesk Monogram + Buffered Governance Hub Badge */}
          <div className="flex items-center shrink-0">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="p-2 mr-2 rounded-xl text-[#1b3b2b] hover:bg-[#1b3b2b]/5 active:scale-95 transition-all cursor-pointer lg:hidden flex items-center justify-center"
                title={isSidebarOpen ? "Close navigation" : "Open navigation"}
                aria-label="Toggle Navigation Sidebar"
              >
                <span className="material-symbols-outlined text-2xl leading-none">
                  {isSidebarOpen ? "close" : "menu"}
                </span>
              </button>
            )}

            <Link
              href="/"
              className="flex items-center group pr-6 sm:pr-10 mr-3 sm:mr-4 border-r border-[#1b3b2b]/10"
              title="Return to DineDesk Home"
            >
              <motion.div
                animate={{
                  y: [0, -3.5, 0, 3.5, 0],
                  rotate: [0, -0.8, 0, 0.8, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  transition: { duration: 0.25 },
                }}
                className="h-12 sm:h-14 w-auto flex items-center justify-center relative cursor-pointer"
              >
                <div className="absolute inset-0 bg-[#E2B774]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <Image
                  alt="DineDesk Logo"
                  className="h-full w-auto object-contain relative z-10 drop-shadow-xs"
                  src="/assets/DineDesk Monogram.png"
                  width={230}
                  height={58}
                  priority
                />
              </motion.div>
            </Link>

            {/* Governance Hub Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1b3b2b]/5 border border-[#1b3b2b]/10">
              <span className="w-2 h-2 rounded-full bg-[#E2B774]" />
              <span className="text-[11px] font-bold text-[#1b3b2b] uppercase tracking-wider">
                Governance Hub
              </span>
            </div>

            <div className="h-6 w-px bg-neutral-200 hidden lg:block mx-4" />

            {/* Live Telemetry Pill */}
            <div className="hidden xl:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/80">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span className="text-[11px] text-emerald-900 font-semibold tracking-tight">
                PostgreSQL Operational
              </span>
            </div>
          </div>

          {/* CENTER: Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-neutral-100/80 p-1.5 rounded-2xl border border-neutral-200/70">
            <Link href="/dashboard/admin" className={navLinkClass(isOverview)}>
              Overview
            </Link>
            <Link href="/dashboard/admin/analytics" className={navLinkClass(isAnalytics)}>
              Analytics
            </Link>
            <Link href="/dashboard/admin/users" className={navLinkClass(isUsers)}>
              User Access
            </Link>
            <Link href="/dashboard/admin#audits" className={navLinkClass(false)}>
              Live Audits
            </Link>
          </nav>

          {/* RIGHT: Expandable Search Icon, Alerts & Super Admin Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Expandable Search Trigger & Bar */}
            <div className="relative" ref={searchContainerRef}>
              <div className="flex items-center">
                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 280, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden mr-1 sm:mr-2"
                    >
                      <div className="relative w-full">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          placeholder="Search merchant, order, audit..."
                          className="w-full bg-white/95 text-[#1b3b2b] text-xs pl-3.5 pr-8 py-2.5 rounded-xl border border-[#1b3b2b]/20 focus:border-[#1b3b2b] focus:outline-none focus:ring-1 focus:ring-[#1b3b2b] shadow-xs font-medium placeholder:text-neutral-400"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => handleSearchChange("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs cursor-pointer p-0.5 rounded-md"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={() => setSearchOpen(!searchOpen)}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer ${searchOpen
                      ? "bg-[#1b3b2b] text-[#E2B774]"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-[#1b3b2b]"
                    }`}
                  title="Search Platform"
                  aria-label="Search Platform"
                >
                  <span className="material-symbols-outlined text-xl">
                    {searchOpen ? "close" : "search"}
                  </span>
                </button>
              </div>
            </div>

            {/* Notifications Trigger & Menu */}
            <div className="relative" ref={notifMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setRoleMenuOpen(false);
                }}
                className={`relative p-2.5 rounded-xl transition-all cursor-pointer ${notificationsOpen
                    ? "bg-[#1b3b2b] text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-[#1b3b2b]"
                  }`}
                title="System Notifications"
                aria-label="System Notifications"
              >
                <span className="material-symbols-outlined text-xl">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600 border-2 border-white" />
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-xl border border-[#1b3b2b]/15 rounded-2xl shadow-xl p-3.5 z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1b3b2b]">System Alerts</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#1b3b2b] text-[#E2B774] text-[10px] font-bold">
                          {unreadCount} pending
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-[11px] text-[#1b3b2b] hover:underline font-semibold cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>

                    <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                      {alerts.length === 0 ? (
                        <div className="py-6 text-center text-xs text-neutral-400">
                          No active system alerts
                        </div>
                      ) : (
                        alerts.map((alert) => (
                          <div
                            key={alert.id}
                            className={`p-2.5 rounded-xl border transition-colors ${alert.unread
                                ? "bg-amber-50/70 border-amber-200/80"
                                : "bg-neutral-50/80 hover:bg-neutral-100 border-neutral-200/60"
                              }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-xs text-[#1b3b2b] leading-tight">
                                {alert.title}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-medium whitespace-nowrap">
                                {alert.timestamp}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-600 mt-1 leading-snug">
                              {alert.description}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 w-px bg-neutral-200" />

            {/* Admin Profile Dropdown with Real Avatar / Golden Monogram Emblem */}
            <div className="relative" ref={roleMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setRoleMenuOpen(!roleMenuOpen);
                  setNotificationsOpen(false);
                }}
                className={`flex items-center gap-3 p-1.5 sm:px-3 sm:py-2 rounded-2xl border transition-all cursor-pointer ${roleMenuOpen
                    ? "bg-[#1b3b2b] text-white border-[#1b3b2b] shadow-sm"
                    : "bg-neutral-50/80 hover:bg-neutral-100 text-[#1b3b2b] border-neutral-200/80"
                  }`}
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#1b3b2b] border border-[#E2B774]/30 shadow-xs shrink-0 flex items-center justify-center p-0.5">
                  {userAvatarUrl && !avatarError ? (
                    <img
                      src={userAvatarUrl}
                      alt={user?.name || "Admin"}
                      className="w-full h-full object-cover rounded-lg"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="text-xs font-bold text-[#E2B774]">{userInitials}</span>
                  )}
                </div>

                <div className="hidden sm:flex flex-col text-left">
                  <span
                    className={`text-xs font-bold leading-tight truncate max-w-[130px] ${roleMenuOpen ? "text-white" : "text-[#1b3b2b]"
                      }`}
                  >
                    {user?.name || "Fourkan Bin Ilias"}
                  </span>
                  <span
                    className={`text-[10px] font-semibold leading-tight uppercase tracking-wider ${roleMenuOpen ? "text-[#E2B774]" : "text-amber-800"
                      }`}
                  >
                    Super Admin
                  </span>
                </div>
                <span
                  className={`material-symbols-outlined text-base hidden sm:block transition-transform duration-200 ${roleMenuOpen ? "rotate-180 text-white" : "text-neutral-500"
                    }`}
                >
                  expand_more
                </span>
              </button>

              <AnimatePresence>
                {roleMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-3 w-64 bg-white/95 backdrop-blur-xl border border-[#1b3b2b]/15 rounded-2xl shadow-xl p-2 z-50"
                  >
                    <div className="px-3 py-2.5 rounded-xl bg-neutral-50/90 border border-neutral-100 mb-1 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#1b3b2b] border border-[#E2B774]/40 flex items-center justify-center shrink-0 p-0.5">
                        {userAvatarUrl && !avatarError ? (
                          <img
                            src={userAvatarUrl}
                            alt={user?.name || "Admin"}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-xs font-bold text-[#E2B774]">{userInitials}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                          Authority Level
                        </span>
                        <span className="text-xs font-bold text-[#1b3b2b] block truncate">
                          {user?.name || "Fourkan Bin Ilias"}
                        </span>
                        <span className="text-[11px] text-neutral-500 block truncate font-medium">
                          {user?.email || "admin@dinedesk.com"}
                        </span>
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        href="/dashboard/admin/manage-admins"
                        onClick={() => setRoleMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#1b3b2b] hover:bg-neutral-100 font-semibold transition-colors"
                      >
                        <span className="material-symbols-outlined text-base text-[#1b3b2b]">
                          admin_panel_settings
                        </span>
                        <span>Manage Admins</span>
                      </Link>

                      <Link
                        href="/dashboard/admin/analytics"
                        onClick={() => setRoleMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#1b3b2b] hover:bg-neutral-100 font-semibold transition-colors"
                      >
                        <span className="material-symbols-outlined text-base text-[#1b3b2b]">
                          analytics
                        </span>
                        <span>Platform Analytics</span>
                      </Link>

                      <Link
                        href="/dashboard/admin/settings"
                        onClick={() => setRoleMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#1b3b2b] hover:bg-neutral-100 font-semibold transition-colors"
                      >
                        <span className="material-symbols-outlined text-base text-[#1b3b2b]">
                          tune
                        </span>
                        <span>Platform Settings</span>
                      </Link>

                      <Link
                        href="/"
                        onClick={() => setRoleMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-600 hover:bg-neutral-100 font-medium transition-colors"
                      >
                        <span className="material-symbols-outlined text-base text-neutral-500">
                          storefront
                        </span>
                        <span>Return to Storefront</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-neutral-100 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setRoleMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-bold transition-colors cursor-pointer text-left"
                      >
                        <span className="material-symbols-outlined text-base">logout</span>
                        <span>Sign Out Authority</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* 80px layout spacer (h-20) matches the navbar height */}
      <div className="h-20 w-full" />
    </>
  );
}