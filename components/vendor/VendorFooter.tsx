"use client";

import Link from "next/link";
import Image from "next/image";

export default function VendorFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-white/95 backdrop-blur-md border-t border-[#1b3b2b]/10 py-5 px-6 sm:px-10 mt-auto">
            <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 text-xs">

                {/* Brand Real Logo & Meta */}
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">

                    {/* Prominent Responsive Logo Wrapper with Smooth Moving Animation */}
                    <div className="relative h-12 w-36 sm:h-14 sm:w-44 shrink-0 flex items-center justify-center sm:justify-start">
                        {/* Soft luminous ambient aura reacting to the animation */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-[#C05621]/10 to-transparent blur-lg rounded-full animate-pulse pointer-events-none" />

                        <div className="relative w-full h-full flex items-center justify-center sm:justify-start animate-[float_6s_ease-in-out_infinite]">
                            <Image
                                src="/assets/DineDesk Monogram.png"
                                alt="DineDesk"
                                width={260}
                                height={70}
                                className="w-full h-full object-contain object-center sm:object-left drop-shadow-sm transition-transform duration-500 hover:scale-105"
                                priority
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                        <span className="md:mr-8 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-[#1b3b2b]/5 text-[#1b3b2b] border border-[#1b3b2b]/10 select-none">
                            Vendor Portal
                        </span>
                        <span className="hidden sm:inline text-neutral-300">•</span>
                        <span className="text-neutral-500 font-medium text-[11px]">
                            &copy; {currentYear} DineDesk Hospitality Systems
                        </span>
                    </div>
                </div>

                {/* Live Operational Status */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-bold text-[11px] shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Kitchen POS &amp; Order Sync Online</span>
                </div>

                {/* Essential Navigation Links */}
                <div className="flex items-center gap-5 text-[11px] font-bold text-neutral-600 shrink-0">
                    <Link href="/dashboard/vendor/orders" className="hover:text-[#1b3b2b] transition-colors">
                        Orders
                    </Link>
                    <Link href="/dashboard/vendor/reservations" className="hover:text-[#1b3b2b] transition-colors">
                        Seating
                    </Link>
                    <Link href="/dashboard/vendor/manage-profile" className="hover:text-[#1b3b2b] transition-colors">
                        Settings
                    </Link>
                    <Link href="/privacy" className="hover:text-[#1b3b2b] transition-colors">
                        Privacy
                    </Link>
                </div>

            </div>
        </footer>
    );
}