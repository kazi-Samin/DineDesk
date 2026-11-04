// app/dashboard/admin/unauthorized.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function AdminUnauthorized() {
    const { user, logout } = useAuth();

    return (
        <div className="w-full min-h-[calc(100vh-160px)] flex flex-col items-center justify-center p-6 bg-[#FBFBFA]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="max-w-md w-full bg-white rounded-3xl border border-[#1b3b2b]/15 shadow-xl shadow-[#1b3b2b]/5 p-6 sm:p-8 text-center flex flex-col items-center"
            >
                {/* Shield Lock Emblem */}
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl text-amber-800">
                        gavel
                    </span>
                </div>

                {/* Security Tag */}
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                        Governance Policy
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E2B774]" />
                    <span className="text-[11px] text-neutral-500 font-mono">
                        403_ACCESS_DENIED
                    </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-[#1b3b2b] tracking-tight">
                    Super Admin Privilege Required
                </h1>

                <p className="text-xs sm:text-sm text-neutral-500 mt-2 leading-relaxed">
                    Your active credentials do not have the required RBAC clearance level to inspect or modify this platform governance partition.
                </p>

                {/* User Credential Chip */}
                <div className="w-full bg-[#f4f7f5] rounded-xl p-3 my-5 border border-[#1b3b2b]/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#1b3b2b] text-[#E2B774] flex items-center justify-center font-bold text-[10px]">
                            {(user as any)?.name ? (user as any).name[0] : "U"}
                        </div>
                        <div className="text-left truncate">
                            <span className="font-bold text-[#1b3b2b] block truncate text-[11px]">
                                {(user as any)?.name || "Current Operator"}
                            </span>
                            <span className="text-[10px] text-neutral-400 block truncate font-mono">
                                {(user as any)?.email || "unauthenticated"}
                            </span>
                        </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] shrink-0">
                        Standard Tier
                    </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                    <Link
                        href="/"
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-50 text-[#1b3b2b] text-xs font-semibold border border-[#1b3b2b]/15 shadow-xs transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-base">storefront</span>
                        <span>Storefront</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => logout()}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b3b2b] text-white hover:bg-[#152e22] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-base text-[#E2B774]">
                            switch_account
                        </span>
                        <span>Switch Identity</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}