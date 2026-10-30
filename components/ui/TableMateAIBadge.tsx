"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import DineDeskAILogo from "@/components/ai/DineDeskAILogo";

export default function TableMateAIBadge() {
  const pathname = usePathname();

  // Hide on dashboard, auth, or if already on DineDesk AI page
  if (
    pathname?.startsWith("/dashboard") ||
    pathname === "/sign-in" ||
    pathname === "/login" ||
    pathname === "/dinedesk-ai" ||
    pathname === "/ai"
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 group">
      {/* Floating Restaurant AI Logo Launcher - High-End Luxury Presentation */}
      <Link
        href="/dinedesk-ai"
        className="relative block rounded-[18px] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-transform duration-200 active:scale-95"
        aria-label="Open DineDesk AI Discovery"
      >
        <DineDeskAILogo size="fab" iconOnly={true} withLink={false} framed={true} />

        {/* Minimal luxury hover tooltip */}
        <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-[#0d2217]/95 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide px-3.5 py-1 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.35)] whitespace-nowrap border border-white/20 ring-1 ring-black/20">
          DineDesk AI
        </span>
      </Link>
    </div>
  );
}
