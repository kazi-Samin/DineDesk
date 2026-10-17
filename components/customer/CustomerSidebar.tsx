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
  memberSince = "Patron since 2023",
  avatarUrl = "https://lh3.googleusercontent.com/aida/AEtjO1Xvc2MrKyLPPwPKRHPvGiuGzzv3Vl3xudUMnfKmM_OejgtKJObOFHcqNPF4XgM99yJVO2vd5xVNy1ialfL7MMAf-mTYsbOekfDFOQeP3J_05sjjK_dG1-TowYtfmniCeQ5oWP3YUL0mOpQ_Kd_4gnUIQvBpdLJfX7FS7iKDGaNDFcEeOV3fOJ7c2-_IHK7W8BGBNX8pIPLWpzKWXacemtS8HMQtfBJOmvihWXCsfl9OXjXlGaVf6vC98QUC",
  isOpen = false,
  onClose,
  activeOrderCount = 1,
  loyaltyPoints = 1450,
}: CustomerSidebarProps) {
  const pathname = usePathname();

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

  const navItems = [
    {
      label: "Order History",
      href: "/dashboard/customer/orders",
      icon: "receipt_long",
      badge:
        activeOrderCount > 0 ? (
          <span className="px-2 py-0.5 font-label-sm text-label-sm bg-secondary-fixed text-on-secondary-fixed rounded-xl font-medium">
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
      label: "My Reviews & Ratings",
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
      href: "#",
      icon: "loyalty",
      badge: (
        <span className="font-label-sm text-label-sm text-primary font-semibold">
          {loyaltyPoints.toLocaleString()} pts
        </span>
      ),
      isActive: false,
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
              className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-primary/10"
              src={avatarUrl}
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
          <nav className="flex flex-col gap-space-xs px-space-md py-space-sm">
            {navItems.map((item) => {
              const activeClass = item.isActive
                ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface";

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => onClose?.()}
                  className={`flex items-center justify-between px-space-md py-2.5 rounded-xl font-label-lg text-label-lg transition-all ${activeClass}`}
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
            className="flex items-center gap-space-md px-space-md py-2.5 rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-all"
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
