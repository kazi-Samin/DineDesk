"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useReservation } from "@/context/ReservationContext";

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

  const isHome = pathname === "/";
  const isExplore = pathname === "/explore";
  const isVendor = pathname?.startsWith("/dashboard/vendor");

  if (isVendor) {
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-outline-variant">
      <div className="h-20 max-w-[1440px] mx-auto px-margin flex items-center justify-between gap-space-md">
        {/* Brand & Desktop Navigation */}
        <div className="flex items-center gap-space-lg shrink-0">
          <Link className="flex items-center" href="/">
            <img
              alt="DineDesk"
              className="h-9 w-auto object-contain"
              src="/logo.png"
            />
          </Link>
          <nav className="hidden xl:flex items-center gap-space-lg">
            <Link
              href="/"
              className={`transition-colors py-space-xs ${
                isHome
                  ? "text-primary font-semibold underline underline-offset-8 decoration-2 decoration-primary-container"
                  : "font-label-lg text-label-lg text-on-surface-variant hover:text-primary"
              }`}
            >
              Home
            </Link>
            <Link
              href="/explore"
              className={`transition-colors py-space-xs ${
                isExplore
                  ? "text-primary font-semibold underline underline-offset-8 decoration-2 decoration-primary-container"
                  : "font-label-lg text-label-lg text-on-surface-variant hover:text-primary"
              }`}
            >
              Browse Restaurants
            </Link>
            <button
              onClick={() => openReservationModal()}
              className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors py-space-xs cursor-pointer"
              type="button"
            >
              Reserve a Table
            </button>
            <div className="relative flex items-center gap-space-xs group">
              <Link
                className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors py-space-xs"
                href="/dashboard/orders"
              >
                Dashboard
              </Link>
              <button
                aria-label="Switch role"
                className="text-on-surface-variant hover:text-primary flex items-center focus:outline-none"
                type="button"
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              >
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
              {/* Role Switcher Menu */}
              <div
                className={`${
                  roleSwitcherOpen ? "block" : "hidden group-hover:block"
                } absolute top-full left-0 mt-space-xs w-48 bg-surface-container-lowest border border-outline-variant rounded shadow-[0_8px_24px_rgba(30,27,22,0.08)] py-space-xs z-50`}
              >
                <span className="block px-space-md py-space-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Role Switcher
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("Diner");
                    setRoleSwitcherOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-space-md py-space-sm font-label-md text-label-md text-on-surface hover:bg-surface-container hover:text-on-surface text-left"
                >
                  <span>Diner</span>
                  {selectedRole === "Diner" && (
                    <span className="material-symbols-outlined text-sm text-primary-container">check</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("Restaurant Owner");
                    setRoleSwitcherOpen(false);
                    router.push("/dashboard/vendor/orders");
                  }}
                  className="w-full flex items-center justify-between px-space-md py-space-sm font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface text-left"
                >
                  <span>Restaurant Owner</span>
                  {selectedRole === "Restaurant Owner" && (
                    <span className="material-symbols-outlined text-sm text-primary-container">check</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("System Admin");
                    setRoleSwitcherOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-space-md py-space-sm font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface text-left"
                >
                  <span>System Admin</span>
                  {selectedRole === "System Admin" && (
                    <span className="material-symbols-outlined text-sm text-primary-container">check</span>
                  )}
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-space-sm">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-space-md pointer-events-none text-outline">
              <span className="material-symbols-outlined text-lg">search</span>
            </span>
            <input
              className="w-full bg-surface-container-low border border-outline-variant rounded py-space-sm pl-10 pr-space-md font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:bg-surface-container-lowest transition-all"
              placeholder="Search restaurants, dishes (biryani, smash burger)..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-space-md shrink-0">
          <button
            aria-label="View cart"
            onClick={toggleDrawer}
            className="relative p-space-sm text-on-surface-variant hover:text-primary rounded transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">shopping_bag</span>
            {totalItemCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-secondary text-on-secondary rounded-full font-label-sm text-[10px] leading-4 text-center font-bold">
                {totalItemCount}
              </span>
            )}
          </button>
          <button
            aria-label="Toggle theme"
            onClick={toggleDarkMode}
            className="p-space-sm text-on-surface-variant hover:text-primary rounded transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">
              {isDarkMode ? "dark_mode" : "light_mode"}
            </span>
          </button>
          <Link
            className="hidden sm:inline-flex items-center px-space-md py-space-sm border border-primary-container text-primary-container hover:bg-primary-container/5 rounded font-label-md text-label-md transition-colors"
            href="#"
          >
            Sign In / Register
          </Link>
          {/* Mobile hamburger button */}
          <button
            aria-label="Open mobile navigation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-space-sm text-on-surface-variant hover:text-primary rounded transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-surface-container-lowest border-b border-outline-variant px-margin py-space-md flex flex-col gap-space-sm">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`py-2 text-sm font-medium ${isHome ? "text-primary font-semibold" : "text-on-surface-variant"}`}
          >
            Home
          </Link>
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className={`py-2 text-sm font-medium ${isExplore ? "text-primary font-semibold" : "text-on-surface-variant"}`}
          >
            Browse Restaurants
          </Link>
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 text-sm font-medium text-on-surface-variant"
          >
            Reserve a Table
          </Link>
          <div className="pt-2 border-t border-outline-variant">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-outline">
                <span className="material-symbols-outlined text-base">search</span>
              </span>
              <input
                className="w-full bg-surface-container-low border border-outline-variant rounded py-1.5 pl-9 pr-3 text-xs text-on-surface placeholder:text-outline focus:outline-none"
                placeholder="Search restaurants, dishes..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
