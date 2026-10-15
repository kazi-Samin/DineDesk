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
            <Link
              className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors py-space-xs"
              href={selectedRole === "Restaurant Owner" ? "/dashboard/vendor/orders" : "/dashboard/orders"}
            >
              Dashboard
            </Link>
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
          {/* Role Switcher Pill / Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container text-xs font-medium text-on-surface transition-colors"
              title="Switch user role / dashboard"
            >
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              <span className="hidden sm:inline text-on-surface-variant">Role:</span>
              <span className="font-semibold text-primary">{selectedRole}</span>
              <span className="material-symbols-outlined text-sm text-on-surface-variant">expand_more</span>
            </button>

            {roleSwitcherOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_12px_32px_rgba(30,27,22,0.12)] py-2 z-50 animate-in fade-in slide-in-from-top-1"
              >
                <div className="px-3 py-1 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  Switch Active Role
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("Diner");
                    setRoleSwitcherOpen(false);
                    router.push("/dashboard/orders");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors text-left ${
                    selectedRole === "Diner" ? "bg-primary-container/10 text-primary font-semibold" : "text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex flex-col">
                    <span>🍽️ Customer (Diner)</span>
                    <span className="text-[10px] text-on-surface-variant">Track orders & history</span>
                  </div>
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
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors text-left ${
                    selectedRole === "Restaurant Owner" ? "bg-primary-container/10 text-primary font-semibold" : "text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex flex-col">
                    <span>🏪 Restaurant Owner</span>
                    <span className="text-[10px] text-on-surface-variant">Incoming orders & kitchen</span>
                  </div>
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
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors text-left ${
                    selectedRole === "System Admin" ? "bg-primary-container/10 text-primary font-semibold" : "text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex flex-col">
                    <span>⚙️ System Admin</span>
                    <span className="text-[10px] text-on-surface-variant">Platform oversight</span>
                  </div>
                  {selectedRole === "System Admin" && (
                    <span className="material-symbols-outlined text-sm text-primary-container">check</span>
                  )}
                </button>
              </div>
            )}
          </div>

          <Link
            className="hidden md:inline-flex items-center px-space-md py-space-sm border border-primary-container text-primary-container hover:bg-primary-container/5 rounded font-label-md text-label-md transition-colors"
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
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openReservationModal();
            }}
            type="button"
            className="py-2 text-sm font-medium text-left text-on-surface-variant hover:text-primary"
          >
            Reserve a Table
          </button>
          
          <div className="pt-2 border-t border-outline-variant flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Dashboards & Portals
            </span>
            <Link
              href="/dashboard/vendor/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg bg-primary/5 hover:bg-primary/10 text-sm font-semibold text-primary flex items-center justify-between"
            >
              <span>🏪 Restaurant Owner (Incoming Orders)</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
            <Link
              href="/dashboard/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-surface-container-low text-sm font-medium text-on-surface flex items-center justify-between"
            >
              <span>🍽️ Customer Order History</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

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
