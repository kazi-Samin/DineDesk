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
      {/* Floating Restaurant AI Logo Launcher - EXACT MATCHING LOGO BADGE */}
      <Link
        href="/dinedesk-ai"
        className="relative block rounded-[1.35rem] focus:outline-none"
        aria-label="Open DineDesk AI Discovery"
      >
        <DineDeskAILogo size="fab" iconOnly={true} withLink={false} framed={true} />

        {/* Minimal luxury hover tooltip */}
        <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-[#132d20] text-white text-[11px] font-bold px-3 py-1 rounded-xl shadow-lg whitespace-nowrap border border-[#FFAA40]/30">
          DineDesk AI
        </span>
      </Link>
    </div>
  );
}
