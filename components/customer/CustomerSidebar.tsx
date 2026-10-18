"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface CustomerSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  userName?: string;
  memberSince?: string;
  avatarUrl?: string;
  activeOrderCount?: number;
  activeOrdersCount?: number;
  upcomingReservationsCount?: number;
  loyaltyPoints?: number;
}

export default function CustomerSidebar({
  isOpen = true,
  onClose,
  onToggle,
  userName = "Tahmid Rahman",
  memberSince = "Patron since Jan 2024",
  avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  activeOrderCount,
  activeOrdersCount = 1,
  upcomingReservationsCount = 2,
  loyaltyPoints = 1250,
}: CustomerSidebarProps) {
  const pathname = usePathname();

  const isOverviewActive = pathname === "/dashboard/customer";
  const isOrdersActive = pathname === "/dashboard/customer/orders";
  const isReservationsActive = pathname === "/dashboard/customer/reservations";
  const isProfileActive = pathname === "/dashboard/customer/profile";
  const isAddressesActive = pathname === "/dashboard/customer/addresses";
  const isReviewsActive = pathname === "/dashboard/customer/reviews";
  const isFavoritesActive = pathname === "/dashboard/customer/favorites";
  const isLoyaltyActive = pathname === "/dashboard/customer/loyalty";

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard/customer",
      icon: "dashboard",
      badge: null,
      isActive: isOverviewActive,
    },
    {
      label: "My Orders",
      href: "/dashboard/customer/orders",
      icon: "receipt_long",
      badge: (activeOrderCount ?? activeOrdersCount) > 0 ? (
        <span className="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-xs font-semibold px-2 py-0.5 rounded-full">
          {activeOrderCount ?? activeOrdersCount} active
        </span>
      ) : null,
      isActive: isOrdersActive,
    },
    {
      label: "Table Reservations",
      href: "/dashboard/customer/reservations",
      icon: "table_restaurant",
      badge: upcomingReservationsCount > 0 ? (
        <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-xs font-semibold px-2 py-0.5 rounded-full">
          {upcomingReservationsCount}
        </span>
      ) : null,
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

      <aside
        className={`fixed left-0 top-16 bottom-0 bg-surface-container-low z-40 flex flex-col justify-between shadow-[1px_0_8px_rgba(0,0,0,0.02)] border-r border-outline-variant transition-all duration-300 ease-in-out ${
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
          {/* Patron Summary Card */}
          {isOpen ? (
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
          ) : (
            <div className="p-3 flex items-center justify-center border-b border-outline-variant/20">
              <img
                alt={userName}
                className="w-9 h-9 rounded-full object-cover shadow-xs ring-1 ring-primary/10 bg-surface-container"
                src={avatarUrl}
                title={`${userName} (${memberSince})`}
                onError={(e) => {
                  e.currentTarget.src = "/avatars/tahmid-avatar.svg";
                }}
              />
            </div>
          )}

          {/* Navigation Links */}
          <nav className={`flex flex-col gap-1 ${isOpen ? "px-space-md py-space-sm" : "px-2 py-space-sm"}`}>
            {navItems.map((item) => {
              const activeClass = item.isActive
                ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface";

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center ${
                    isOpen ? "justify-between px-space-md py-2.5" : "justify-center px-2 py-2.5"
                  } rounded-lg font-label-md text-sm transition-all ${activeClass}`}
                  title={item.label}
                >
                  <div className="flex items-center gap-space-md">
                    <span className="material-symbols-outlined text-xl">
                      {item.icon}
                    </span>
                    {isOpen && <span>{item.label}</span>}
                  </div>
                  {isOpen && item.badge}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sign Out */}
        <div className={`border-t border-outline-variant/20 ${isOpen ? "p-space-md" : "p-2"}`}>
          <Link
            className={`flex items-center ${
              isOpen ? "gap-space-md px-space-md py-2.5" : "justify-center px-2 py-2.5"
            } rounded-lg font-label-md text-sm text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-all`}
            href="/"
            title="Sign Out"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            {isOpen && <span>Sign Out</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
