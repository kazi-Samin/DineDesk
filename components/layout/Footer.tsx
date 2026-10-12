"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low border-t border-outline-variant mt-margin">
      <div className="max-w-[1440px] mx-auto px-margin py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter pb-space-xl border-b border-outline-variant">
          <div className="lg:col-span-2 flex flex-col gap-space-md">
            <Link className="flex items-center" href="/">
              <img
                alt="DineDesk"
                className="h-8 w-auto object-contain"
                src="/logo.png"
              />
            </Link>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
              Handcrafted reservation workflows, authentic regional dining directories, and editorial table stewardship for discerning gourmands.
            </p>
            <div className="pt-space-sm">
              <p className="font-label-md text-label-md text-on-surface mb-space-sm">
                Receive curated seasonal dining chronicles:
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-space-xs max-w-md">
                <input
                  className="flex-1 bg-surface-container-lowest border border-outline-variant rounded px-space-md py-space-sm font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container"
                  placeholder="Your email address"
                  type="email"
                />
                <button
                  className="px-space-lg py-space-sm bg-primary-container text-on-primary rounded font-label-md text-label-md hover:bg-primary transition-colors"
                  type="submit"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div className="flex flex-col gap-space-sm">
            <span className="font-label-lg text-label-lg text-on-surface font-semibold uppercase tracking-wider">
              About DineDesk
            </span>
            <div className="flex flex-col gap-space-xs">
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
                Our Heritage
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
                Culinary Manifesto
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
                Press &amp; News
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
                Careers
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-space-sm">
            <span className="font-label-lg text-label-lg text-on-surface font-semibold uppercase tracking-wider">
              For Diners
            </span>
            <div className="flex flex-col gap-space-xs">
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/explore">
                Discover Bistros
              </Link>
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/explore">
                Table Booking
              </Link>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
                Private Dining
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
                Guest Concierge
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-space-sm">
            <span className="font-label-lg text-label-lg text-on-surface font-semibold uppercase tracking-wider">
              For Restaurants &amp; Legal
            </span>
            <div className="flex flex-col gap-space-xs">
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
                Host with DineDesk
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
                Floor Plan Software
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
                Terms of Service
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
                Privacy Policy
              </a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
                Cookie Directives
              </a>
            </div>
          </div>
        </div>
        <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant">
          <p className="font-body-sm text-body-sm">© 2025 DineDesk Technologies Ltd. Dhaka, Bangladesh. All rights reserved.</p>
          <div className="flex items-center gap-space-md">
            <a aria-label="Dining feed" className="text-on-surface-variant hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined text-lg">restaurant_menu</span>
            </a>
            <a aria-label="Community" className="text-on-surface-variant hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined text-lg">forum</span>
            </a>
            <a aria-label="Support" className="text-on-surface-variant hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined text-lg">mail</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
