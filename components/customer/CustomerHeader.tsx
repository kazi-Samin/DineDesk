"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  avatarUrl = "https://lh3.googleusercontent.com/aida/AEtjO1Xvc2MrKyLPPwPKRHPvGiuGzzv3Vl3xudUMnfKmM_OejgtKJObOFHcqNPF4XgM99yJVO2vd5xVNy1ialfL7MMAf-mTYsbOekfDFOQeP3J_05sjjK_dG1-TowYtfmniCeQ5oWP3YUL0mOpQ_Kd_4gnUIQvBpdLJfX7FS7iKDGaNDFcEeOV3fOJ7c2-_IHK7W8BGBNX8pIPLWpzKWXacemtS8HMQtfBJOmvihWXCsfl9OXjXlGaVf6vC98QUC",
  onToggleSidebar,
  isSidebarOpen,
}: CustomerHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/30">
      <div className="h-16 w-full px-space-lg flex items-center justify-between">
        {/* Left: Brand + Desktop Navigation */}
        <div className="flex items-center gap-space-lg">
          {/* Mobile Menu Toggle Button */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
              aria-label="Toggle Navigation Sidebar"
            >
              <span className="material-symbols-outlined text-2xl">
                {isSidebarOpen ? "close" : "menu"}
              </span>
            </button>
          )}

          <Link className="flex items-center gap-space-sm" href="/">
            <img
              alt="DineDesk"
              className="h-8 w-auto object-contain"
              src="/logo.png"
            />
            <span className="font-headline-sm text-headline-sm text-primary font-medium tracking-tight">
              DineDesk
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-space-lg ml-space-md">
            <Link
              className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors"
              href="/"
            >
              Home
            </Link>
            <Link
              className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors"
              href="/explore"
            >
              Browse Restaurants
            </Link>
            <Link
              className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors"
              href="/explore"
            >
              Reserve a Table
            </Link>
          </nav>
        </div>

        {/* Right: Search, Notifications, Profile */}
        <div className="flex items-center gap-space-md">
          {/* Global Search Field */}
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-space-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
              search
            </span>
            <input
              className="w-60 pl-8 pr-space-md py-1.5 bg-surface-container-lowest font-body-sm text-body-sm text-on-surface rounded-xl placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary-container shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/40"
              placeholder="Search restaurants, cuisines..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Notifications Button */}
          <div className="relative">
            <button
              aria-label="Notifications"
              className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors rounded-xl relative"
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <span className="material-symbols-outlined text-xl">
                notifications
              </span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full" />
            </button>

            {/* Notifications Dropdown Preview */}
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-lg p-space-md z-50">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                  <span className="font-label-md text-label-md font-semibold text-primary">
                    Activity Notifications
                  </span>
                  <span className="font-label-sm text-[11px] text-secondary">
                    1 New
                  </span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <div className="p-2 bg-surface-container-low rounded-lg text-left">
                    <span className="font-label-sm text-[12px] text-primary font-medium block">
                      Order Placed Successfully
                    </span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">
                      Nando&apos;s Dhaka is preparing your meal.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info */}
          <Link
            href="/dashboard/customer/profile"
            className="flex items-center gap-space-sm pl-space-sm hover:opacity-90 transition-opacity"
          >
            <img
              alt={userName}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-outline-variant/40"
              src={avatarUrl}
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="font-label-md text-label-md text-on-surface font-medium leading-tight">
                {userName}
              </span>
              <span className="font-label-sm text-label-sm text-secondary font-semibold">
                {userRole}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
