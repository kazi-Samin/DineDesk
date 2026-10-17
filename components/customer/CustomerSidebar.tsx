"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface CustomerSidebarProps {
  userName?: string;
  memberSince?: string;
  avatarUrl?: string;
  isOpen?: boolean;
  onClose?: () => void;
  activeOrderCount?: number;
  loyaltyPoints?: number;
}

export default function CustomerSidebar({
  userName = "Tahmid's Account",
  memberSince = "Member since 2023",
  avatarUrl = "/avatars/tahmid-avatar.svg",
  isOpen = false,
  onClose,
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
        className={`fixed left-0 top-16 bottom-0 w-72 bg-surface-container-low z-40 flex flex-col justify-between shadow-[1px_0_8px_rgba(0,0,0,0.02)] border-r border-outline-variant/30 overflow-y-auto transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col">
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
                  onClick={() => onClose?.()}
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
