// app/dashboard/admin/not-found.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminNotFound() {
    return (
        <div className="w-full min-h-[calc(100vh-160px)] flex flex-col items-center justify-center p-6 bg-[#FBFBFA]">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="max-w-md w-full text-center flex flex-col items-center"
            >
                {/* Subtle Watermark Code */}
                <span className="text-7xl sm:text-8xl font-black text-[#1b3b2b]/8 select-none font-mono tracking-tighter leading-none mb-[-28px]">
                    404
                </span>

                {/* Shield Icon Badge */}
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-white border border-[#1b3b2b]/15 shadow-md shadow-[#1b3b2b]/5 flex items-center justify-center text-[#1b3b2b] mb-4">
                    <span className="material-symbols-outlined text-3xl text-amber-800">
                        search_off
                    </span>
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#E2B774] border-2 border-white" />
                </div>

                {/* Context Tag */}
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                        Route Unmapped
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E2B774]" />
                    <span className="text-[11px] text-neutral-500 font-mono">
                        STATUS 404_NOT_FOUND
                    </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-[#1b3b2b] tracking-tight">
                    Executive Telemetry Endpoint Missing
                </h1>

                <p className="text-xs sm:text-sm text-neutral-500 mt-2 leading-relaxed">
                    The requested administrative module or governance ledger route does not exist in this deployment cluster.
                </p>

                {/* Action Controls */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-7 w-full sm:w-auto">
                    <Link
                        href="/dashboard/admin"
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b3b2b] text-white hover:bg-[#152e22] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-base text-[#E2B774]">
                            dashboard
                        </span>
                        <span>Return to Overview</span>
                    </Link>

                    <Link
                        href="/dashboard/admin/audit-logs"
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-50 text-[#1b3b2b] text-xs font-semibold border border-[#1b3b2b]/15 shadow-xs transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-base">history</span>
                        <span>Inspect Audit Stream</span>
                    </Link>
                </div>

                <span className="text-[10px] font-mono text-neutral-400 mt-8">
                    Audit Node: 0x94B_ERR_UNMAPPED_DISPATCH
                </span>
            </motion.div>
        </div>
    );
}