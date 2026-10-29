"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import UserProfileDropdown from "@/components/layout/UserProfileDropdown";

interface CustomerHeaderProps {
  userName?: string;
  userRole?: string;
  avatarUrl?: string;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function CustomerHeader({
  userName = "Diner",
  userRole = "Verified Diner",
  avatarUrl = "",
  onToggleSidebar,
  isSidebarOpen,
}: CustomerHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl || "");
  const [currentName, setCurrentName] = useState(userName);

  // Sync state whenever props update from the parent page
  useEffect(() => {
    if (userName && userName !== "Diner") {
      setCurrentName(userName);
    }
  }, [userName]);

  useEffect(() => {
    if (avatarUrl) {
      setCurrentAvatar(avatarUrl);
    }
  }, [avatarUrl]);

  // Sync avatar and name dynamically from storage & custom dispatch events
  useEffect(() => {
    const updateProfileFromStorage = (event?: any) => {
      try {
        if (event?.detail) {
          const detail = event.detail;
          if (detail.fullName || detail.name) {
            setCurrentName(detail.fullName || detail.name);
          }
          if (detail.avatarUrl || detail.image) {
            setCurrentAvatar(detail.avatarUrl || detail.image);
          }
          return;
        }

        const storedProfile = JSON.parse(localStorage.getItem("dinedesk_customer_profile") || "{}");
        const directName = localStorage.getItem("dinedesk_user_name");
        const directAvatar = localStorage.getItem("dinedesk_user_avatar");
        const authUser = JSON.parse(localStorage.getItem("dinedesk_auth_user") || "{}");

        const resolvedName =
          storedProfile.fullName || directName || authUser.name || (userName !== "Diner" ? userName : "");

        // Prioritize actual user photos over generic svg fallbacks
        const resolvedAvatar =
          directAvatar ||
          storedProfile.avatarUrl ||
          authUser.avatarUrl ||
          authUser.image ||
          avatarUrl;

        if (resolvedName) setCurrentName(resolvedName);
        if (resolvedAvatar && !resolvedAvatar.includes("tahmid-avatar.svg")) {
          setCurrentAvatar(resolvedAvatar);
        }
      } catch (e) {
        // Fallback silently if storage read fails
      }
    };

    updateProfileFromStorage();

    window.addEventListener("storage", updateProfileFromStorage);
    window.addEventListener("profile-updated", updateProfileFromStorage);
    window.addEventListener("external-profile-updated", updateProfileFromStorage);

    return () => {
      window.removeEventListener("storage", updateProfileFromStorage);
      window.removeEventListener("profile-updated", updateProfileFromStorage);
      window.removeEventListener("external-profile-updated", updateProfileFromStorage);
    };
  }, [avatarUrl, userName]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Google OAuth returns .image; database returns .avatarUrl
  const googleAvatar =
    (user as any)?.image ||
    user?.avatarUrl ||
    currentAvatar ||
    (typeof window !== "undefined" ? localStorage.getItem("dinedesk_user_avatar") : "") ||
    avatarUrl;

  const resolvedDisplayName = currentName || user?.name || userName || "Diner";
  const resolvedDisplayAvatar = googleAvatar;

  const dropdownUser = {
    name: resolvedDisplayName,
    email: user?.email || "diner@dinedesk.com",
    role: userRole,
    avatar: resolvedDisplayAvatar,
    avatarUrl: resolvedDisplayAvatar,
    image: resolvedDisplayAvatar,
    ...(user || {}),
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-20 z-40 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/80 shadow-xs">
      <div className="h-full w-full px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">

        {/* Left: Brand Logo */}
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Link
              className="flex items-center group transition-transform duration-300 hover:scale-105 shrink-0"
              href="/"
            >
              <div className="h-12 sm:h-14 w-auto flex items-center justify-center">
                <Image
                  alt="DineDesk Logo"
                  className="h-full w-auto object-contain"
                  src="/assets/DineDesk Monogram.png"
                  width={210}
                  height={52}
                  priority
                />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Middle: Centered Navigation Links */}
        <nav className="hidden lg:flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"
          >
            Home
          </Link>

          <Link
            href="/dashboard/customer/orders"
            className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"
          >
            My Orders
          </Link>

          {/* Hover Dropdown for Explore & Dining */}
          <div
            className="relative"
            onMouseEnter={() => setExploreDropdownOpen(true)}
            onMouseLeave={() => setExploreDropdownOpen(false)}
          >
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Culinary Guide</span>
              <span className="material-symbols-outlined text-base">expand_more</span>
            </button>

            <AnimatePresence>
              {exploreDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 w-60 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl p-2 z-50 mt-1"
                >
                  <Link
                    href="/explore"
                    onClick={() => setExploreDropdownOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold text-on-surface hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-base text-primary">restaurant_menu</span>
                    <span>Browse Restaurants</span>
                  </Link>
                  <Link
                    href="/explore"
                    onClick={() => setExploreDropdownOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold text-on-surface hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-base text-secondary">table_restaurant</span>
                    <span>Reserve a Table</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Right: Search, Notifications, User Profile Pill */}
        <div className="flex items-center gap-3">

          {/* Global Search Field */}
          <form onSubmit={handleSearch} className="relative hidden md:block max-w-xs w-48 lg:w-60">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base pointer-events-none">
              search
            </span>
            <input
              className="w-full pl-10 pr-3 py-2.5 bg-surface-container-low font-body-sm text-xs text-on-surface rounded-2xl placeholder:text-on-surface-variant/70 focus:outline-none focus:bg-surface-container-lowest focus:border-primary border border-outline-variant/70 shadow-inner transition-all"
              placeholder="Search dishes, kitchens..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Notifications Button */}
          <div className="relative">
            <button
              aria-label="Notifications"
              className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors rounded-2xl relative cursor-pointer border border-outline-variant/40"
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full animate-pulse" />
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-3 w-72 sm:w-80 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                    Activity Alerts
                  </span>
                  <span className="text-[10px] bg-secondary/15 text-secondary px-2 py-0.5 rounded-md font-bold">
                    1 New
                  </span>
                </div>
                <div className="pt-3">
                  <div className="p-3 bg-surface-container-low rounded-xl text-left border border-outline-variant/40">
                    <span className="text-xs text-primary font-extrabold block">
                      Kitchen Preparing Order
                    </span>
                    <span className="text-[11px] text-on-surface-variant mt-1 block font-medium">
                      The Maple &amp; Vine has confirmed your order #DD-23698.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-outline-variant/60 hidden sm:block" />

          {/* Profile Dropdown */}
          <UserProfileDropdown user={dropdownUser} logout={logout} />

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-2xl bg-surface-container text-on-surface hover:bg-surface-container-high lg:hidden border border-outline-variant/40 cursor-pointer"
            aria-label="Open Mobile Menu"
          >
            <span className="material-symbols-outlined text-xl">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex flex-col gap-3 shadow-2xl"
          >
            <form onSubmit={handleSearch} className="relative w-full mb-2 md:hidden">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                search
              </span>
              <input
                className="w-full pl-9 pr-3 py-2.5 bg-surface-container-low text-xs text-on-surface rounded-xl border border-outline-variant"
                placeholder="Search dishes, kitchens..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low font-bold text-xs text-on-surface"
            >
              <span className="material-symbols-outlined text-base text-primary">home</span>
              <span>Home</span>
            </Link>
            <Link
              href="/dashboard/customer/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low font-bold text-xs text-on-surface"
            >
              <span className="material-symbols-outlined text-base text-primary">receipt</span>
              <span>My Orders</span>
            </Link>
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low font-bold text-xs text-on-surface"
            >
              <span className="material-symbols-outlined text-base text-primary">restaurant_menu</span>
              <span>Browse Restaurants</span>
            </Link>
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low font-bold text-xs text-on-surface"
            >
              <span className="material-symbols-outlined text-base text-secondary">table_restaurant</span>
              <span>Reserve a Table</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}