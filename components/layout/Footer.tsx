"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  EDIT THESE IF NEEDED                                               */
/* ------------------------------------------------------------------ */
const CONTACT_EMAIL = "hello@dinedesk.com"; // <- replace with your real DineDesk email
const COMPANY = "DevCore Solutions";
const COMPANY_URL = "#"; // <- DevCore Solutions website / LinkedIn, if any
const FOUNDERS = [
  { name: "Kazi Mehedi Hasan", role: "Co-Founder" },
  { name: "Fourkan Bin Ilias", role: "Co-Founder" },
];
// public/assets/DineDesk Monogram.png (tip: rename to DineDesk-Monogram.png to avoid the space)
const MONOGRAM = "/assets/DineDesk%20Monogram.png";

const FAQS = [
  {
    q: "How do I book a table?",
    a: "Open Browse Restaurants, pick a restaurant, choose your date, time and party size, then confirm your reservation.",
  },
  {
    q: "How does food delivery work?",
    a: "Add dishes to your cart from any restaurant and check out. Delivery time depends on the restaurant and your location, and the estimate is shown before you order.",
  },
  {
    q: "I own a restaurant. How do I join?",
    a: "Choose “Host with DineDesk” in the footer or email us, and our team will help you get set up.",
  },
];
/* ------------------------------------------------------------------ */

const linkClass =
  "group/link relative inline-flex w-fit items-center font-body-sm text-body-sm text-on-surface-variant transition-all duration-300 hover:text-primary hover:translate-x-1";

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const inner = (
    <>
      <span className="absolute -left-3 h-1 w-1 rounded-full bg-primary opacity-0 transition-opacity duration-300 group-hover/link:opacity-100" />
      {children}
    </>
  );
  return href.startsWith("/") ? (
    <Link className={linkClass} href={href}>
      {inner}
    </Link>
  ) : (
    <a className={linkClass} href={href}>
      {inner}
    </a>
  );
}

export default function Footer() {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pathname]);

  if (
    pathname?.startsWith("/dashboard") ||
    pathname === "/sign-in" ||
    pathname === "/login"
  ) {
    return null;
  }

  const reveal = (delay: number) =>
    ({
      animationDelay: `${delay}ms`,
    }) as React.CSSProperties;
  const rv = visible ? "dd-reveal" : "opacity-0";

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: connect to your newsletter API
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer
      ref={ref}
      className="relative w-full overflow-hidden bg-surface-container-low border-t border-outline-variant mt-16"
    >
      <style>{`
        @keyframes dd-float { 0%,100% { transform: translateY(0) rotate(-2deg) } 50% { transform: translateY(-10px) rotate(2deg) } }
        @keyframes dd-spin { to { transform: rotate(360deg) } }
        @keyframes dd-pulse { 0%,100% { opacity:.5; transform: scale(1) } 50% { opacity:1; transform: scale(1.08) } }
        @keyframes dd-up { from { opacity:0; transform: translateY(28px) } to { opacity:1; transform: translateY(0) } }
        @keyframes dd-shine { to { background-position: 200% center } }
        @keyframes dd-ping { 0% { transform: scale(1); opacity:.6 } 80%,100% { transform: scale(1.5); opacity:0 } }
        .dd-float { animation: dd-float 8s ease-in-out infinite }
        .dd-spin { animation: dd-spin 50s linear infinite }
        .dd-pulse { animation: dd-pulse 6s ease-in-out infinite }
        .dd-ping { animation: dd-ping 2.6s cubic-bezier(0,0,.2,1) infinite }
        .dd-reveal { opacity:0; animation: dd-up .8s cubic-bezier(.2,.7,.2,1) forwards }
        .dd-brand-grad {
          background: linear-gradient(90deg, #1f4d36 0%, #c08a2e 50%, #1f4d36 100%);
          background-size: 200% auto; -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
          animation: dd-shine 5s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .dd-reveal, .dd-float, .dd-spin, .dd-pulse, .dd-ping, .dd-brand-grad { animation: none !important; opacity: 1 !important }
        }
      `}</style>

      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

      {/* Animated monogram (the only image) - soft, low-opacity ring, desktop only */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[8.5rem] right-4 hidden h-[190px] w-[190px] md:block lg:right-10 mb-6"
      >
        <div className="dd-pulse absolute inset-8 rounded-full bg-primary/[0.06] blur-2xl" />
        <div className="dd-spin absolute inset-0 rounded-full border border-dashed border-primary/10" />
        <div className="dd-float absolute inset-0 flex items-center justify-center p-8">
          <Image
            height={300}
            width={300}
            src={MONOGRAM}
            alt="MONOGRAM"
            className="h-full w-full object-contain opacity-60" />
        </div>
      </div>

      <div className="relative max-w-[1440px] mx-auto px-margin py-space-xl">
        {/* Feedback / queries band */}
        <div
          className={`${rv} mb-space-xl rounded-2xl border border-outline-variant/70 bg-surface-container-lowest/70 p-space-lg backdrop-blur`}
          style={reveal(0)}
        >
          <div className="flex flex-col gap-space-md md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-headline-md text-headline-md font-semibold text-on-surface">
                Questions or feedback? <span className="dd-brand-grad">We&apos;re listening.</span>
              </h3>
              <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                Tell us what you love, what to improve, or ask anything about DineDesk.
              </p>
            </div>
            <div className="flex flex-wrap gap-space-sm">
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("DineDesk Feedback")}`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-space-lg py-2.5 font-label-md text-label-md font-medium text-on-primary shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
              >
                <span className="material-symbols-outlined text-lg">rate_review</span>
                Share feedback
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("DineDesk Question")}`}
                className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-space-lg py-2.5 font-label-md text-label-md font-medium text-on-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
              >
                <span className="material-symbols-outlined text-lg">help</span>
                Ask a question
              </a>
            </div>
          </div>

          {/* Quick Q&A */}
          <div className="mt-space-lg grid grid-cols-1 gap-space-sm border-t border-outline-variant/60 pt-space-md md:grid-cols-3">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={f.q}
                  className={`rounded-xl border px-space-md py-3 transition-all duration-300 ${open
                    ? "border-primary/40 bg-primary/5"
                    : "border-outline-variant/60 hover:border-primary/30"
                    }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 text-left font-label-md text-label-md font-medium text-on-surface"
                  >
                    {f.q}
                    <span
                      className={`material-symbols-outlined text-lg text-primary transition-transform duration-300 ${open ? "rotate-45" : ""
                        }`}
                    >
                      add
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
                      }`}
                  >
                    <p className="overflow-hidden font-body-sm text-body-sm text-on-surface-variant">{f.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-gutter border-b border-outline-variant/60 pb-space-xl md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className={`${rv} lg:col-span-2 flex flex-col gap-space-md`} style={reveal(120)}>
            <Link href="/" className="group/brand flex w-fit items-center gap-3">
              <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-on-primary shadow-lg shadow-primary/25 transition-transform duration-500 group-hover/brand:rotate-6 group-hover/brand:scale-105">
                <span className="material-symbols-outlined text-[24px]">restaurant</span>
                <span className="dd-ping absolute inset-0 rounded-xl ring-2 ring-primary/40" />
              </span>
              <span className="flex flex-col leading-none ml-1">
                <span className="font-serif text-[32px] font-bold tracking-tight">
                  <span className="text-on-surface">Dine</span>
                  <span className="dd-brand-grad">Desk</span>
                </span>
                <span className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.3em] text-on-surface-variant">
                  Dine · Book · Delight
                </span>
                <span className="mt-2 h-px w-10 bg-gradient-to-r from-primary to-transparent transition-all duration-500 group-hover/brand:w-full" />
              </span>
            </Link>

            <p className="max-w-sm font-body-sm text-body-sm text-on-surface-variant mt-2">
              Online food delivery and table reservations for Dhaka&apos;s best restaurants and dining spots.
            </p>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="group/mail inline-flex w-fit items-center gap-2 font-label-md text-label-md text-on-surface transition-colors hover:text-primary"
            >
              <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover/mail:-rotate-12 group-hover/mail:scale-110">
                mail
              </span>
              {CONTACT_EMAIL}
            </a>

            <div className="pt-space-sm">
              <p className="mb-space-sm font-label-md text-label-md font-medium text-on-surface">
                Subscribe for local restaurant guides and exclusive offers:
              </p>
              <form onSubmit={onSubscribe} className="flex max-w-md items-center gap-space-xs">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-space-md py-2.5 font-body-sm text-body-sm text-on-surface transition-all placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                  placeholder="Your email address"
                  type="email"
                />
                <button
                  className="cursor-pointer rounded-lg bg-primary px-space-lg py-2.5 font-label-md text-label-md font-medium text-on-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0"
                  type="submit"
                >
                  Subscribe
                </button>
              </form>
              <p
                className={`mt-2 font-body-sm text-body-sm text-primary transition-all duration-500 ${subscribed ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
                  }`}
                aria-live="polite"
              >
                Thank you! You&apos;re on the list.
              </p>
            </div>
          </div>

          {/* Columns */}
          <div className={`${rv} flex flex-col gap-space-sm`} style={reveal(220)}>
            <span className="font-label-lg text-label-lg font-semibold uppercase tracking-wider text-on-surface">
              About DineDesk
            </span>
            <div className="flex flex-col gap-space-xs pl-3">
              <FooterLink href="#">Our Heritage</FooterLink>
              <FooterLink href="#">Culinary Manifesto</FooterLink>
              <FooterLink href="#">Press &amp; News</FooterLink>
              <FooterLink href="#">Careers</FooterLink>
            </div>
          </div>

          <div className={`${rv} flex flex-col gap-space-sm`} style={reveal(320)}>
            <span className="font-label-lg text-label-lg font-semibold uppercase tracking-wider text-on-surface">
              For Diners
            </span>
            <div className="flex flex-col gap-space-xs pl-3">
              <FooterLink href="/explore">Discover Bistros</FooterLink>
              <FooterLink href="/explore">Table Booking</FooterLink>
              <FooterLink href="#">Private Dining</FooterLink>
              <FooterLink href="#">Guest Concierge</FooterLink>
            </div>
          </div>

          <div className={`${rv} flex flex-col gap-space-sm`} style={reveal(420)}>
            <span className="font-label-lg text-label-lg font-semibold uppercase tracking-wider text-on-surface">
              For Restaurants &amp; Legal
            </span>
            <div className="flex flex-col gap-space-xs pl-3">
              <FooterLink href="#">Host with DineDesk</FooterLink>
              <FooterLink href="#">Floor Plan Software</FooterLink>
              <FooterLink href="#">Terms of Service</FooterLink>
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Cookie Directives</FooterLink>
            </div>
          </div>
        </div>

        {/* Company / founders */}
        <div
          className={`${rv} flex flex-col gap-space-md pt-space-lg md:flex-row md:items-center md:justify-between`}
          style={reveal(520)}
        >
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Built with care by{" "}
            <a href={COMPANY_URL} className="font-semibold text-on-surface transition-colors hover:text-primary">
              {COMPANY}
            </a>
            <span className="mx-2 opacity-40">•</span>
            Founded by{" "}
            {FOUNDERS.map((f, i) => (
              <span key={f.name}>
                <span className="font-medium text-on-surface">{f.name}</span>
                {i < FOUNDERS.length - 1 ? " & " : ""}
              </span>
            ))}
          </p>

          <div className="relative z-10 flex items-center gap-space-md">
            {[
              { label: "Dining feed", icon: "restaurant_menu", href: "#" },
              { label: "Community", icon: "forum", href: "#" },
              { label: "Support", icon: "mail", href: `mailto:${CONTACT_EMAIL}` },
            ].map((s) => (
              <a
                key={s.label}
                aria-label={s.label}
                href={s.href}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary hover:text-on-primary hover:shadow-lg hover:shadow-primary/30"
              >
                <span className="material-symbols-outlined text-lg">{s.icon}</span>
              </a>
            ))}
            <button
              aria-label="Back to top"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary text-on-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30"
            >
              <span className="material-symbols-outlined text-lg">arrow_upward</span>
            </button>
          </div>
        </div>

        <p
          className={`${rv} mt-space-lg border-t border-outline-variant/60 pt-space-md text-center font-body-sm text-body-sm text-on-surface-variant md:text-left`}
          style={reveal(620)}
        >
          © {new Date().getFullYear()} DineDesk Technologies Ltd. Dhaka, Bangladesh. All rights reserved.
        </p>
      </div>
    </footer>
  );
}