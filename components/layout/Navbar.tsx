"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useReservation } from "@/context/ReservationContext";
import { motion, AnimatePresence } from "framer-motion";
import NavLinks from "../NavLinks";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleDrawer, totalItemCount } = useCart();
  const { openReservationModal } = useReservation();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Diner");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Dynamic scroll listener for liquid glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 lg:px-16 pt-4 pointer-events-none">
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`pointer-events-auto max-w-[1400px] mx-auto h-20 px-5 sm:px-8 flex items-center justify-between gap-4 transition-all duration-500 rounded-3xl border shadow-xl ${scrolled
          ? "bg-surface-container-lowest/85 backdrop-blur-2xl border-outline-variant/60 shadow-[0_12px_40px_rgba(31,61,43,0.08)] scale-[0.99]"
          : "bg-surface-container-low/90 backdrop-blur-xl border-outline-variant/80 shadow-[0_8px_30px_rgba(31,61,43,0.04)] scale-100"
          }`}
      >
        {/* Brand Logo Image & Desktop Navigation Links */}
        <div className="flex items-center gap-8 shrink-0">
          <Link
            className="flex items-center group transition-transform duration-300 hover:scale-105"
            href="/"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="h-16 sm:h-18 w-auto flex items-center justify-center overflow-hidden py-1"
            >
              <Image
                alt="DineDesk Logo"
                className="h-full w-auto object-contain"
                src="/assets/DineDesk Monogram.png"
                width={220}
                height={51}
              />
            </motion.div>
          </Link>

          <NavLinks openReservationModal={openReservationModal} selectedRole={selectedRole} />
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

          {/* Theme Switcher */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Toggle theme"
            onClick={toggleDarkMode}
            className="p-3 text-on-surface-variant hover:text-primary rounded-2xl bg-surface-container/50 hover:bg-surface-container border border-outline-variant/40 transition-colors cursor-pointer shadow-2xs"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">
              {isDarkMode ? "dark_mode" : "light_mode"}
            </span>
          </motion.button>

          {/* Role Switcher Pill */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-outline-variant/60 bg-surface-container/70 hover:bg-surface-container text-xs font-semibold text-on-surface transition-all cursor-pointer shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
              <span className="hidden sm:inline text-on-surface-variant font-medium">Role:</span>
              <span className="text-primary font-bold">{selectedRole}</span>
              <span className="material-symbols-outlined text-sm text-on-surface-variant">expand_more</span>
            </motion.button>

            <AnimatePresence>
              {roleSwitcherOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.94 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-3 w-64 bg-surface-container-lowest border border-outline-variant rounded-3xl shadow-2xl py-3 z-50 overflow-hidden backdrop-blur-xl"
                >
                  <div className="px-4 py-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    Switch Access Portal
                  </div>
                  <div className="my-1.5 border-t border-outline-variant/60" />

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("Diner");
                      setRoleSwitcherOpen(false);
                      router.push("/dashboard/orders");
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-xs font-medium transition-colors text-left ${selectedRole === "Diner" ? "bg-primary/10 text-primary font-bold" : "text-on-surface hover:bg-surface-container-low"
                      }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">🍽️ Customer (Diner)</span>
                      <span className="text-[10px] text-on-surface-variant">Track orders & bookings</span>
                    </div>
                    {selectedRole === "Diner" && <span className="material-symbols-outlined text-sm text-primary">check_circle</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("Restaurant Owner");
                      setRoleSwitcherOpen(false);
                      router.push("/dashboard/vendor/orders");
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-xs font-medium transition-colors text-left ${selectedRole === "Restaurant Owner" ? "bg-primary/10 text-primary font-bold" : "text-on-surface hover:bg-surface-container-low"
                      }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">🏪 Restaurant Owner</span>
                      <span className="text-[10px] text-on-surface-variant">Manage kitchen queue</span>
                    </div>
                    {selectedRole === "Restaurant Owner" && <span className="material-symbols-outlined text-sm text-primary">check_circle</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("System Admin");
                      setRoleSwitcherOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-xs font-medium transition-colors text-left ${selectedRole === "System Admin" ? "bg-primary/10 text-primary font-bold" : "text-on-surface hover:bg-surface-container-low"
                      }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">⚙️ System Admin</span>
                      <span className="text-[10px] text-on-surface-variant">Platform wide governance</span>
                    </div>
                    {selectedRole === "System Admin" && <span className="material-symbols-outlined text-sm text-primary">check_circle</span>}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Authentication CTA */}
          <Link
            className="hidden md:inline-flex items-center px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-semibold text-xs transition-all shadow-md hover:shadow-lg cursor-pointer"
            href="#"
          >
            Sign In
          </Link>

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
              selectedRole={selectedRole}
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
              <Link
                href="#"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 bg-primary text-on-primary rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <span>Sign In / Secure Register</span>
                <span className="material-symbols-outlined text-sm">login</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}