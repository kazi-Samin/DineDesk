"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CustomerHeaderProps {
  userName?: string;
  userRole?: string;
  avatarUrl?: string;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function CustomerHeader({
  userName = "Tahmid Rahman",
  userRole = "Verified Foodie",
  avatarUrl = "/avatars/tahmid-avatar.svg",
  onToggleSidebar,
  isSidebarOpen,
}: CustomerHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant shadow-2xs">
      <div className="h-full w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand Logo + Nav Links */}
        <div className="flex items-center gap-4 sm:gap-6">

          {/* DineDesk Brand Logo */}
          <Link
            className="flex items-center gap-2 group transition-transform duration-300 hover:scale-105 shrink-0"
            href="/"
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
          </Link>

          {/* Quick Public Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6 ml-2">
            <Link
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-medium"
              href="/"
            >
              Home
            </Link>
            <Link
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-medium"
              href="/explore"
            >
              Browse Restaurants
            </Link>
            <Link
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-medium"
              href="/explore"
            >
              Reserve a Table
            </Link>
          </nav>
        </div>

        {/* Right: Search, Notifications, Profile Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Field */}
          <form onSubmit={handleSearch} className="relative hidden md:block max-w-xs w-56 lg:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base pointer-events-none">
              search
            </span>
            <input
              className="w-full pl-9 pr-3 py-2 bg-surface-container-low font-body-sm text-body-sm text-on-surface rounded-xl placeholder:text-on-surface-variant/70 focus:outline-none focus:bg-surface-container-lowest focus:border-primary border border-outline-variant/70 shadow-inner transition-all"
              placeholder="Search dishes, restaurants..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Notifications Button */}
          <div className="relative">
            <button
              aria-label="Notifications"
              className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors rounded-xl relative cursor-pointer"
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <span className="material-symbols-outlined text-2xl">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full animate-pulse" />
            </button>

            {/* Notifications Dropdown Preview */}
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                  <span className="font-label-md text-label-md font-semibold text-primary">
                    Activity Alerts
                  </span>
                  <span className="font-label-sm text-[11px] text-secondary font-bold">
                    1 New
                  </span>
                </div>
                <div className="pt-2">
                  <div className="p-2.5 bg-surface-container-low rounded-lg text-left">
                    <span className="font-label-sm text-xs text-primary font-semibold block">
                      Kitchen Preparing Order
                    </span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant mt-0.5 block">
                      Sultan&apos;s Heritage Kitchen has confirmed your order #DD-23698.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-outline-variant hidden sm:block" />

          {/* User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 transition-colors cursor-pointer"
            >
              <img
                alt={userName}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-outline-variant/60 bg-surface-container shrink-0"
                src={avatarUrl}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/avatars/tahmid-avatar.svg";
                }}
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight">
                  {userName}
                </span>
                <span className="font-label-sm text-[11px] text-secondary font-medium leading-tight">
                  {userRole}
                </span>
              </div>
              <span className="material-symbols-outlined text-base text-on-surface-variant hidden sm:block">
                expand_more
              </span>
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-2 border-b border-outline-variant/40">
                  <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
                    Account
                  </span>
                  <span className="text-xs font-bold text-primary block mt-0.5">
                    {userName}
                  </span>
                </div>
                <div className="py-1">
                  <Link
                    href="/dashboard/customer/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-primary">person</span>
                    <span>My Profile &amp; Settings</span>
                  </Link>
                  <Link
                    href="/dashboard/vendor"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-secondary">storefront</span>
                    <span>Switch to Restaurant Owner</span>
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-on-surface-variant">home</span>
                    <span>Return to Public Homepage</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
