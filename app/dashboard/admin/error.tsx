// app/dashboard/admin/error.tsx
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Console error dispatch for operational loggers
        console.error("DineDesk Admin Subsystem Failure:", error);
    }, [error]);

    return (
        <div className="w-full min-h-[calc(100vh-160px)] flex flex-col items-center justify-center p-6 bg-[#FBFBFA]">
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="max-w-lg w-full bg-white rounded-3xl border border-[#1b3b2b]/10 shadow-xl shadow-[#1b3b2b]/5 p-6 sm:p-8 text-center flex flex-col items-center"
            >
                {/* Warning Icon Badge */}
                <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl">
                        warning
                    </span>
                </div>

                {/* Heading & Meta */}
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                        Runtime Exception
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    <span className="text-[11px] text-neutral-500 font-mono">
                        FAULT_ISOLATED
                    </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-[#1b3b2b] tracking-tight">
                    Subsystem Telemetry Interrupted
                </h2>

                <p className="text-xs sm:text-sm text-neutral-500 mt-2 leading-relaxed">
                    An operational exception occurred while resolving administrative ledger states. The error has been captured for security review.
                </p>

                {/* Error Digest Box */}
                <div className="w-full bg-[#f4f7f5] rounded-xl p-3 my-5 border border-[#1b3b2b]/10 text-left font-mono text-[11px] text-neutral-600 break-all select-all">
                    <div className="flex items-center justify-between text-neutral-400 mb-1 font-bold text-[10px] uppercase">
                        <span>Exception Digest</span>
                        <span>DET-1</span>
                    </div>
                    {error.digest ? `ID: ${error.digest}` : error.message || "Unknown runtime fault."}
                </div>

                {/* Remediation Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b3b2b] text-white hover:bg-[#152e22] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-base text-[#E2B774]">
                            refresh
                        </span>
                        <span>Re-initialize Subsystem</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => window.location.assign("/dashboard/admin")}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-50 text-[#1b3b2b] text-xs font-semibold border border-[#1b3b2b]/15 shadow-xs transition-colors cursor-pointer"
                    >
                        <span>Safe Admin Mode</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}