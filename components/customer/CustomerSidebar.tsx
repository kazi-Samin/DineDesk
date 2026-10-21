"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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
  userName = "Diner",
  memberSince = "Patron since Jan 2024",
  avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  activeOrderCount,
  activeOrdersCount = 1,
  upcomingReservationsCount = 2,
  loyaltyPoints,
}: CustomerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Dynamic state for real points fetched from Stripe payments API / localStorage
  const [realPoints, setRealPoints] = useState<number>(loyaltyPoints ?? 20);
  const [currentAvatar, setCurrentAvatar] = useState<string>(
    avatarUrl && avatarUrl.trim() !== "" ? avatarUrl : "/avatars/tahmid-avatar.svg"
  );
  const [currentName, setCurrentName] = useState<string>(userName);

  // Real-time synchronization for avatar, name, and loyalty points
  useEffect(() => {
    const syncProfileFromStorage = () => {
      try {
        const storedProfile = JSON.parse(localStorage.getItem("dinedesk_customer_profile") || "{}");
        if (storedProfile.avatarUrl && storedProfile.avatarUrl.trim() !== "") {
          setCurrentAvatar(storedProfile.avatarUrl);
        } else {
          const directAvatar = localStorage.getItem("dinedesk_user_avatar");
          if (directAvatar && directAvatar.trim() !== "") {
            setCurrentAvatar(directAvatar);
          }
        }

        if (storedProfile.fullName) {
          setCurrentName(storedProfile.fullName);
        }

        const storedPayments = JSON.parse(localStorage.getItem("dinedesk_stripe_payments") || "[]");
        if (storedPayments.length > 0) {
          setRealPoints(storedPayments.length * 20);
        } else if (loyaltyPoints !== undefined) {
          setRealPoints(loyaltyPoints);
        }
      } catch (e) {
        // fallback
      }
    };

    syncProfileFromStorage();

    window.addEventListener("storage", syncProfileFromStorage);
    window.addEventListener("profile-updated", syncProfileFromStorage);

    return () => {
      window.removeEventListener("storage", syncProfileFromStorage);
      window.removeEventListener("profile-updated", syncProfileFromStorage);
    };
  }, [avatarUrl, userName, loyaltyPoints]);

  const resolvedName = user?.name
    ? `${user.name.split(" ")[0]}`
    : currentName && currentName !== "Diner"
      ? currentName.split(" ")[0]
      : "Diner";

  const isOverviewActive = pathname === "/dashboard/customer";
  const isOrdersActive = pathname === "/dashboard/customer/orders";
  const isReservationsActive = pathname === "/dashboard/customer/reservations";
  const isProfileActive = pathname === "/dashboard/customer/profile";
  const isAddressesActive = pathname === "/dashboard/customer/addresses";
  const isReviewsActive = pathname === "/dashboard/customer/reviews";
  const isFavoritesActive = pathname === "/dashboard/customer/favorites";
  const isLoyaltyActive = pathname === "/dashboard/customer/loyalty";

  const totalActiveOrders = activeOrderCount ?? activeOrdersCount;
  const isPremiumUser = realPoints >= 2000;

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
      badge: totalActiveOrders > 0 ? (
        <span className="bg-[#C05621]/15 text-[#C05621] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
          {totalActiveOrders} active
        </span>
      ) : null,
      isActive: isOrdersActive,
    },
    {
      label: "Table Reservations",
      href: "/dashboard/customer/reservations",
      icon: "table_restaurant",
      badge: upcomingReservationsCount > 0 ? (
        <span className="bg-[#1b3b2b]/10 text-[#1b3b2b] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
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
        <span className="text-[10px] text-[#C05621] font-extrabold">
          {realPoints.toLocaleString()} pts
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

  const safeAvatar = currentAvatar && currentAvatar.trim() !== "" ? currentAvatar : "/avatars/tahmid-avatar.svg";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#1b3b2b]/40 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-20 bottom-0 bg-white/95 backdrop-blur-2xl z-40 flex flex-col justify-between shadow-[4px_0_24px_rgba(27,59,43,0.06)] border-r border-[#1b3b2b]/15 transition-all duration-300 ease-in-out ${isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 lg:w-20"
          }`}
      >
        <motion.button
          type="button"
          onClick={handleToggleClick}
          whileHover={{ scale: 1.12, rotate: 5 }}
          whileTap={{ scale: 0.92 }}
          className="absolute -right-3.5 top-6 z-50 w-8 h-8 rounded-full bg-gradient-to-tr from-[#1b3b2b] to-[#2c5e43] border-2 border-white text-white shadow-[0_4px_12px_rgba(27,59,43,0.3)] flex items-center justify-center hover:border-[#C05621] transition-all cursor-pointer group"
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <span className={`material-symbols-outlined text-sm font-black transition-transform duration-300 ${isOpen ? "rotate-0" : "rotate-180"}`}>
            keyboard_double_arrow_left
          </span>
        </motion.button>

        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {isOpen ? (
            <div className="p-5 flex flex-col gap-3 bg-gradient-to-b from-[#1b3b2b]/5 to-transparent border-b border-[#1b3b2b]/10">
              <div className="flex items-center gap-3.5">
                <div className={`relative w-11 h-11 rounded-2xl p-0.5 ${isPremiumUser
                    ? "bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-300 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    : "bg-gradient-to-tr from-[#1b3b2b] to-[#C05621]"
                  } shadow-sm shrink-0`}>
                  <img
                    alt={resolvedName}
                    className="w-full h-full rounded-[14px] object-cover bg-white"
                    src={safeAvatar}
                    onError={(e) => {
                      e.currentTarget.src = "/avatars/tahmid-avatar.svg";
                    }}
                  />
                  {isPremiumUser && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] shadow-md border border-white" title="Gold Tier VIP">
                      👑
                    </span>
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-heading font-extrabold text-sm text-[#1b3b2b] tracking-tight truncate flex items-center gap-1.5">
                    {resolvedName}&apos;s Account
                    {isPremiumUser && <span className="text-[10px]">👑</span>}
                  </span>
                  <span className="text-[10px] text-[#1b3b2b]/60 font-semibold uppercase tracking-wider">
                    {memberSince}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
                <div className="bg-white/80 border border-[#1b3b2b]/10 py-1.5 px-1 rounded-xl shadow-2xs">
                  <span className="block text-[9px] uppercase font-bold text-[#1b3b2b]/50">Orders</span>
                  <span className="font-heading font-black text-xs text-[#1b3b2b]">{totalActiveOrders}</span>
                </div>
                <div className="bg-white/80 border border-[#1b3b2b]/10 py-1.5 px-1 rounded-xl shadow-2xs">
                  <span className="block text-[9px] uppercase font-bold text-[#1b3b2b]/50">Bookings</span>
                  <span className="font-heading font-black text-xs text-[#C05621]">{upcomingReservationsCount}</span>
                </div>
                <div className="bg-white/80 border border-[#1b3b2b]/10 py-1.5 px-1 rounded-xl shadow-2xs">
                  <span className="block text-[9px] uppercase font-bold text-[#1b3b2b]/50">Points</span>
                  <span className="font-heading font-black text-xs text-[#1b3b2b]">{realPoints}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 flex items-center justify-center border-b border-[#1b3b2b]/10">
              <div className={`relative w-10 h-10 rounded-2xl p-0.5 ${isPremiumUser
                  ? "bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-300 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                  : "bg-gradient-to-tr from-[#1b3b2b] to-[#C05621]"
                } shadow-sm`}>
                <img
                  alt={resolvedName}
                  className="w-full h-full rounded-[14px] object-cover bg-white"
                  src={safeAvatar}
                  title={`${resolvedName} (${memberSince})${isPremiumUser ? " - Gold Tier VIP" : ""}`}
                  onError={(e) => {
                    e.currentTarget.src = "/avatars/tahmid-avatar.svg";
                  }}
                />
                {isPremiumUser && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] shadow-sm border border-white" title="Gold Tier VIP">
                    👑
                  </span>
                )}
              </div>
            </div>
          )}

          <nav className={`flex flex-col gap-1.5 ${isOpen ? "p-4" : "px-2 py-4"}`}>
            {navItems.map((item) => {
              const activeClass = item.isActive
                ? "bg-[#1b3b2b] text-white font-extrabold shadow-md shadow-[#1b3b2b]/20"
                : "text-[#1b3b2b]/80 hover:bg-[#1b3b2b]/10 hover:text-[#1b3b2b] font-bold";

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center ${isOpen ? "justify-between px-4 py-3" : "justify-center px-2 py-3"} rounded-2xl text-xs tracking-tight transition-all group ${activeClass}`}
                  title={!isOpen ? item.label : undefined}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`material-symbols-outlined text-xl transition-transform group-hover:scale-110 ${item.isActive ? "text-[#C05621]" : "text-[#1b3b2b]/70 group-hover:text-[#1b3b2b]"}`}>
                      {item.icon}
                    </span>
                    {isOpen && <span className="truncate">{item.label}</span>}
                  </div>
                  {isOpen && item.badge}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={`border-t border-[#1b3b2b]/10 flex flex-col gap-2 bg-[#f8f9f6]/50 ${isOpen ? "p-4" : "p-2"}`}>
          <Link
            href="/"
            className={`w-full flex items-center ${isOpen ? "gap-3.5 px-4 py-3" : "justify-center px-2 py-3"} rounded-2xl text-xs font-bold text-[#1b3b2b]/80 hover:bg-[#1b3b2b]/10 hover:text-[#1b3b2b] transition-all group`}
            title="Return to Home"
          >
            <span className="material-symbols-outlined text-xl text-[#1b3b2b]/70 group-hover:text-[#1b3b2b] group-hover:scale-110 transition-transform">
              home
            </span>
            {isOpen && <span>Return to Home</span>}
          </Link>

          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push("/sign-in");
            }}
            className={`w-full flex items-center ${isOpen ? "gap-3.5 px-4 py-3" : "justify-center px-2 py-3"} rounded-2xl text-xs font-bold text-red-700 hover:bg-red-50 hover:text-red-900 transition-all cursor-pointer group`}
            title="Sign Out"
          >
            <span className="material-symbols-outlined text-xl text-red-500 group-hover:scale-110 transition-transform">
              logout
            </span>
            {isOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}