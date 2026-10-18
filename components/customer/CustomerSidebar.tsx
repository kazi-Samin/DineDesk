"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface CustomerSidebarProps {
  userName?: string;
  memberSince?: string;
  avatarUrl?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  activeOrderCount?: number;
  loyaltyPoints?: number;
}

export default function CustomerSidebar({
  userName = "Tahmid's Account",
  memberSince = "Member since 2023",
  avatarUrl = "/avatars/tahmid-avatar.svg",
  isOpen = true,
  onClose,
  onToggle,
  activeOrderCount = 1,
  loyaltyPoints = 1450,
}: CustomerSidebarProps) {
  const pathname = usePathname();

  const isOverviewActive =
    pathname === "/dashboard/customer" || pathname === "/dashboard";
  const isProfileActive =
    pathname === "/dashboard/customer/profile" ||
    pathname === "/dashboard/user/profile";
  const isAddressesActive =
    pathname === "/dashboard/customer/addresses" ||
    pathname === "/dashboard/user/addresses";
  const isReservationsActive = pathname === "/dashboard/customer/reservations";
  const isReviewsActive =
    pathname === "/dashboard/customer/reviews" ||
    pathname === "/dashboard/user/reviews";
  const isFavoritesActive =
    pathname === "/dashboard/customer/favorites" ||
    pathname === "/dashboard/user/favorites";
  const isOrdersActive =
    pathname === "/dashboard/customer/orders" || pathname === "/dashboard/orders";
  const isLoyaltyActive =
    pathname === "/dashboard/customer/loyalty" ||
    pathname === "/dashboard/customer/rewards";

  const navItems = [
    {
      label: "Dashboard Overview",
      href: "/dashboard/customer",
      icon: "dashboard",
      badge: null,
      isActive: isOverviewActive,
    },
    {
      label: "Order History",
      href: "/dashboard/customer/orders",
      icon: "receipt_long",
      badge:
        activeOrderCount > 0 ? (
          <span className="px-2 py-0.5 font-label-sm text-xs bg-secondary-fixed text-on-secondary-fixed rounded-sm font-medium">
            {activeOrderCount} active
          </span>
        ) : null,
      isActive: isOrdersActive,
    },
    {
      label: "Table Reservations",
      href: "/dashboard/customer/reservations",
      icon: "table_restaurant",
      badge: <span className="w-2 h-2 rounded-full bg-secondary" />,
      isActive: isReservationsActive,
    },
    {
      label: "Personal Profile",
      href: "/dashboard/customer/profile",
      icon: "person",
      badge: null,
      isActive: isProfileActive,
    },
    {
      label: "Delivery Addresses",
      href: "/dashboard/customer/addresses",
      icon: "location_on",
      badge: null,
      isActive: isAddressesActive,
    },
    {
      label: "My Reviews",
      href: "/dashboard/customer/reviews",
      icon: "rate_review",
      badge: null,
      isActive: isReviewsActive,
    },
    {
      label: "Saved Favorites",
      href: "/dashboard/customer/favorites",
      icon: "bookmark_heart",
      badge: null,
      isActive: isFavoritesActive,
    },
    {
      label: "Loyalty Rewards",
      href: "/dashboard/customer/loyalty",
      icon: "loyalty",
      badge: (
        <span className="font-label-sm text-xs text-primary font-semibold">
          {loyaltyPoints.toLocaleString()} pts
        </span>
      ),
      isActive: isLoyaltyActive,
    },
  ];

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
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-primary/30 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
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
        className={`fixed left-0 top-16 bottom-0 w-72 bg-surface-container-low z-40 flex flex-col justify-between shadow-[1px_0_8px_rgba(0,0,0,0.02)] border-r border-outline-variant transition-transform duration-300 ease-in-out ${
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
          {/* Patron Summary Card */}
          <div className="p-space-lg flex items-center gap-space-md bg-surface-container-low border-b border-outline-variant/20">
            <img
              alt={userName}
              className="w-10 h-10 rounded-full object-cover shadow-xs ring-1 ring-primary/10 bg-surface-container"
              src={avatarUrl}
              onError={(e) => {
                e.currentTarget.src = "/avatars/tahmid-avatar.svg";
              }}
            />
            <div className="flex flex-col">
              <span className="font-headline-sm text-body-lg text-on-surface font-medium">
                {userName}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {memberSince}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-space-md py-space-sm">
            {navItems.map((item) => {
              const activeClass = item.isActive
                ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface";

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center justify-between px-space-md py-2.5 rounded-lg font-label-md text-sm transition-all ${activeClass}`}
                >
                  <div className="flex items-center gap-space-md">
                    <span className="material-symbols-outlined text-lg">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sign Out */}
        <div className="p-space-md border-t border-outline-variant/20">
          <Link
            className="flex items-center gap-space-md px-space-md py-2.5 rounded-lg font-label-md text-sm text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-all"
            href="/"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
