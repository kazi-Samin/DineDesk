// components/admin/AdminFooter.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function AdminFooter() {
    const currentYear = new Date().getFullYear();
    const [currentTimeUTC, setCurrentTimeUTC] = useState<string>("");

    // Sync clock to display live operational UTC telemetry
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTimeUTC(now.toISOString().substring(11, 19) + " UTC");
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="w-full bg-[#f4f7f5] text-[#1b3b2b] border-t border-[#1b3b2b]/10 relative overflow-hidden transition-all duration-300 mt-auto">
            {/* Soft Ambient Champagne & Forest Green Tint Aura */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_bottom_left,_rgba(226,183,116,0.18),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(27,59,43,0.06),_transparent_45%)]" />

            <div className="w-full px-4 sm:px-6 lg:px-8 py-6 relative z-10 space-y-5">
                {/* TOP LEVEL: Large Floating Animated Logo, Status Pills & Operational Quick-Actions */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-[#1b3b2b]/10">
                    {/* Brand + Moving Monogram (Enlarged) */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="flex items-center group transition-transform duration-200"
                            title="Return to DineDesk Home"
                        >
                            <motion.div
                                animate={{
                                    y: [0, -3, 0, 3, 0],
                                    rotate: [0, -0.6, 0, 0.6, 0],
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                whileHover={{
                                    scale: 1.05,
                                    y: -2,
                                    transition: { duration: 0.25 },
                                }}
                                className="h-10 sm:h-11 w-auto flex items-center justify-center relative cursor-pointer"
                            >
                                {/* Soft ambient aura */}
                                <div className="absolute inset-0 bg-[#E2B774]/25 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                <Image
                                    alt="DineDesk Logo"
                                    className="h-full w-auto object-contain relative z-10 drop-shadow-xs"
                                    src="/assets/DineDesk Monogram.png"
                                    width={180}
                                    height={44}
                                    priority
                                />
                            </motion.div>
                        </Link>

                        <div className="h-5 w-px bg-[#1b3b2b]/15 hidden sm:block" />

                        <div className="hidden sm:flex flex-col">
                            <span className="text-[11px] font-bold text-[#1b3b2b] uppercase tracking-wider">
                                Governance Hub
                            </span>
                            <span className="text-[10px] text-neutral-500 font-medium">
                                Node DET-1 • v2.14.0
                            </span>
                        </div>
                    </div>

                    {/* Real-Time Diagnostics & Infrastructure Telemetry */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs">
                        {/* Live Status Pill */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-semibold shadow-2xs">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                            </span>
                            <span className="text-[11px]">Database Healthy</span>
                        </div>

                        {/* Live Clock Pill */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-[#1b3b2b]/10 text-[#1b3b2b] text-[11px] font-mono shadow-2xs">
                            <span className="material-symbols-outlined text-xs text-[#E2B774]">
                                schedule
                            </span>
                            <span>{currentTimeUTC || "00:00:00 UTC"}</span>
                        </div>

                        {/* Back to top button */}
                        <button
                            type="button"
                            onClick={scrollToTop}
                            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/80 hover:bg-[#1b3b2b] text-[#1b3b2b] hover:text-white border border-[#1b3b2b]/10 hover:border-[#1b3b2b] transition-all flex items-center gap-1 text-[11px] font-bold cursor-pointer shadow-2xs"
                            title="Scroll to Top"
                        >
                            <span className="material-symbols-outlined text-sm">
                                arrow_upward
                            </span>
                            <span className="hidden sm:inline">Top</span>
                        </button>
                    </div>
                </div>

                {/* BOTTOM LEVEL: Clean Governance Links & Cryptographic / Encrypted Compliance */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                    {/* Fast Navigation Jumps */}
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-semibold text-[#1b3b2b]/80">
                        <Link
                            href="/dashboard/admin"
                            className="hover:text-[#1b3b2b] transition-colors"
                        >
                            Overview
                        </Link>
                        <Link
                            href="/dashboard/admin/analytics"
                            className="hover:text-[#1b3b2b] transition-colors"
                        >
                            Analytics
                        </Link>
                        <Link
                            href="/dashboard/admin/users"
                            className="hover:text-[#1b3b2b] transition-colors"
                        >
                            Patrons &amp; Merchants
                        </Link>
                        <Link
                            href="/dashboard/admin#audits"
                            className="hover:text-[#1b3b2b] transition-colors"
                        >
                            Audit Stream
                        </Link>
                        <Link
                            href="/dashboard/admin/settings"
                            className="hover:text-[#1b3b2b] transition-colors"
                        >
                            System Settings
                        </Link>
                        <Link
                            href="/"
                            className="hover:text-[#1b3b2b] text-neutral-400 transition-colors"
                        >
                            Public Storefront
                        </Link>
                    </div>

                    {/* Security Standard & Copyright */}
                    <div className="flex items-center gap-3 text-[11px] text-[#1b3b2b]/60 font-medium">
                        <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold">
                            <span className="material-symbols-outlined text-xs text-[#E2B774]">
                                verified_user
                            </span>
                            TLS 1.3 Immutable Ledger
                        </span>
                        <span>•</span>
                        <span>&copy; {currentYear} DineDesk Inc.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}