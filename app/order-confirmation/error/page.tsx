"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function PaymentErrorPage() {
    return (
        <main className="min-h-screen bg-[#f8f9f6] text-[#1b3b2b] pt-32 pb-24 px-4 sm:px-8 lg:px-16 flex items-center justify-center selection:bg-[#1b3b2b] selection:text-white">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring", damping: 25 }}
                className="w-full max-w-xl bg-white/90 backdrop-blur-2xl border border-[#1b3b2b]/15 p-8 sm:p-12 rounded-[2.5rem] shadow-[0_20px_60px_rgba(27,59,43,0.08)] flex flex-col items-center text-center gap-6"
            >
                {/* Error / Cancel Icon Badge */}
                <div className="w-20 h-20 rounded-3xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shadow-inner">
                    <span className="material-symbols-outlined text-4xl">error</span>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-[0.3em] text-red-600">
                        Payment Unsuccessful
                    </span>
                    <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1b3b2b] tracking-tight">
                        Checkout Interrupted
                    </h1>
                    <p className="text-sm text-[#1b3b2b]/70 font-medium max-w-md mx-auto mt-1">
                        Your payment session was cancelled or could not be completed. No charges have been made to your account.
                    </p>
                </div>

                {/* Info Pill */}
                <div className="w-full bg-[#f8f9f6] border border-[#1b3b2b]/15 p-4 rounded-2xl flex items-center justify-between text-xs font-bold">
                    <span className="text-[#1b3b2b]/60 uppercase tracking-wider text-[10px]">Gateway Status</span>
                    <span className="text-red-700 bg-red-100 px-3 py-1 rounded-full text-[11px] font-extrabold">
                        Session Cancelled ✕
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
                    <Link
                        href="/explore"
                        className="w-full py-4 rounded-2xl bg-[#1b3b2b] text-white font-bold text-xs uppercase tracking-wider shadow-xl hover:bg-[#1b3b2b]/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-sm">shopping_cart</span>
                        <span>Return to Menu &amp; Try Again</span>
                    </Link>

                    <Link
                        href="/"
                        className="w-full py-4 rounded-2xl bg-[#f8f9f6] border border-[#1b3b2b]/20 text-[#1b3b2b] font-bold text-xs uppercase tracking-wider hover:bg-[#1b3b2b]/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <span>Back to Home</span>
                        <span className="material-symbols-outlined text-sm">home</span>
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}