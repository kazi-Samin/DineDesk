"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useReservation } from "@/context/ReservationContext";
import { motion, AnimatePresence } from "framer-motion";
import NavLinks from "../NavLinks";
import Logo from "../Logo";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleDrawer, totalItemCount } = useCart();
  const { openReservationModal } = useReservation();
  const { user, isAuthenticated, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Diner");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  // Dynamic scroll listener for liquid glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDashboard = pathname?.startsWith("/dashboard");
  const isAuth = pathname === "/sign-in" || pathname === "/login";

  if (isDashboard || isAuth) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/explore`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 lg:px-16 pt-4 pointer-events-none">
      <motion.nav
        initial={false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`pointer-events-auto max-w-[1400px] mx-auto h-20 px-5 sm:px-8 flex items-center justify-between gap-4 transition-all duration-500 rounded-3xl border shadow-xl ${scrolled
          ? "bg-surface-container-lowest/85 backdrop-blur-2xl border-outline-variant/60 shadow-[0_12px_40px_rgba(31,61,43,0.08)] scale-[0.99]"
          : "bg-surface-container-low/90 backdrop-blur-xl border-outline-variant/80 shadow-[0_8px_30px_rgba(31,61,43,0.04)] scale-100"
          }`}
      >
        {/* Brand Logo Image & Desktop Navigation Links */}
        <div className="flex items-center gap-8 shrink-0">
          <Logo size="lg" />

          <NavLinks openReservationModal={openReservationModal} />
        </div>

        {/* Floating Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-sm mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg">search</span>
            </span>
            <input
              className="w-full bg-surface-container/60 hover:bg-surface-container focus:bg-surface-container-lowest border border-outline-variant/60 focus:border-primary rounded-2xl py-2.5 pl-11 pr-4 text-xs font-medium text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none transition-all shadow-inner"
              placeholder="Search gourmet dishes, kitchens..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Action Controls & Profile Pill */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Cart Bag with Bouncing Count */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label="View cart"
            onClick={toggleDrawer}
            className="relative p-3 text-on-surface-variant hover:text-primary rounded-2xl bg-surface-container/50 hover:bg-surface-container border border-outline-variant/40 transition-colors cursor-pointer shadow-2xs"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">shopping_bag</span>
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-on-secondary rounded-full font-bold text-[10px] flex items-center justify-center shadow-md animate-bounce">
                {totalItemCount}
              </span>
            )}
          </motion.button>

          {/* Direct Role Dashboard Shortcut Button when Authenticated */}
          {isAuthenticated && user && (
            <Link
              href={
                user.role === "ADMIN" || user.role === "SUPERADMIN"
                  ? "/dashboard/admin"
                  : user.role === "VENDOR"
                    ? "/dashboard/vendor"
                    : "/dashboard/customer"
              }
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              <span>
                {user.role === "ADMIN" || user.role === "SUPERADMIN"
                  ? "Admin Console"
                  : user.role === "VENDOR"
                    ? "Partner Portal"
                    : "My Dashboard"}
              </span>
            </Link>
          )}

          {/* Authentication CTA or User Profile Menu */}
          {isAuthenticated && user ? (
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded-2xl text-xs font-semibold text-on-surface transition-all shadow-xs cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-[11px]">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="max-w-[100px] truncate">{user.name || "Diner"}</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed">
                  {user.role}
                </span>
                <span className="material-symbols-outlined text-sm">
                  {userMenuOpen ? "expand_less" : "expand_more"}
                </span>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-outline-variant">
                      <p className="text-xs font-bold text-on-surface truncate">{user.name}</p>
                      <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
                    </div>

                    <Link
                      href={
                        user.role === "ADMIN" || user.role === "SUPERADMIN"
                          ? "/dashboard/admin"
                          : user.role === "VENDOR"
                            ? "/dashboard/vendor"
                            : "/dashboard/customer"
                      }
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-base text-primary">dashboard</span>
                      <span>Go to Dashboard</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-error hover:bg-error-container/20 transition-colors text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              className="hidden md:inline-flex items-center px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-semibold text-xs transition-all shadow-md hover:shadow-lg cursor-pointer"
              href="/sign-in"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Trigger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label="Open mobile navigation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-3 text-on-surface-variant hover:text-primary rounded-2xl bg-surface-container/50 hover:bg-surface-container border border-outline-variant/40 transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </motion.button>
        </div>
      </motion.nav>

      {/* Fully Animated Mobile & Tablet Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto xl:hidden bg-surface-container-lowest/95 backdrop-blur-2xl border border-outline-variant mt-3 mx-2 sm:mx-6 rounded-3xl shadow-2xl overflow-hidden px-6 py-6 flex flex-col gap-5"
          >
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
              <span className="font-bold text-xs text-on-surface uppercase tracking-widest">Navigation Suite</span>
              <span className="text-[10px] bg-secondary/15 text-secondary px-2.5 py-1 rounded-full font-bold">Live Portal</span>
            </div>

            {/* Mobile Nav Links Component */}
            <NavLinks
              isMobile={true}
              onItemClick={() => setMobileMenuOpen(false)}
              openReservationModal={openReservationModal}
            />

            {/* Mobile Search Box */}
            <div className="pt-2 border-t border-outline-variant/60">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-base">search</span>
                </span>
                <input
                  className="w-full bg-surface-container border border-outline-variant/60 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary"
                  placeholder="Search restaurants, cuisines..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            {/* Mobile Authentication Button */}
            <div className="pt-2">
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container border border-outline-variant">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                        {user.name ? user.name[0].toUpperCase() : "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-on-surface">{user.name}</span>
                        <span className="text-[10px] text-on-surface-variant">{user.email}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    href={
                      user.role === "ADMIN"
                        ? "/dashboard/admin"
                        : user.role === "VENDOR"
                          ? "/dashboard/vendor"
                          : "/dashboard/customer"
                    }
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 bg-primary text-on-primary rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Open Dashboard</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full py-2 border border-outline-variant text-error rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-error-container/20 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 bg-primary text-on-primary rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Sign In / Register</span>
                  <span className="material-symbols-outlined text-sm">login</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}