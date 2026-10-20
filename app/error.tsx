"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("DineDesk Error Boundary caught:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#f8f9f6] text-[#1b3b2b] flex items-center justify-center px-6 relative overflow-hidden select-none">
      {/* Ambient Radial Luxury Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#C05621]/10 via-[#1b3b2b]/10 to-transparent rounded-full blur-[110px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-lg w-full bg-white/80 backdrop-blur-2xl border border-[#1b3b2b]/15 p-8 sm:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(27,59,43,0.08)] text-center flex flex-col items-center gap-6"
      >
        {/* Frosted Icon Crest */}
        <div className="w-20 h-20 rounded-3xl bg-[#C05621]/10 border border-[#C05621]/30 flex items-center justify-center text-[#C05621] shadow-inner">
          <span className="material-symbols-outlined text-4xl">error</span>
        </div>

        {/* Typography */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#C05621]">
            Culinary Interruption
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1b3b2b] tracking-tight">
            An Unexpected Error Occurred
          </h1>
          <p className="text-xs sm:text-sm text-[#1b3b2b]/70 font-medium leading-relaxed mt-1">
            We encountered a temporary disruption while curating your request. Our culinary stewards are on it.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
          <button
            onClick={reset}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-[#1b3b2b] text-[#f8f9f6] font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-[#1b3b2b]/90 transition-all cursor-pointer flex items-center justify-center gap-2"
            type="button"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-[#f8f9f6] border border-[#1b3b2b]/20 text-[#1b3b2b] font-bold text-xs uppercase tracking-wider hover:bg-[#1b3b2b]/5 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            <span>Return Home</span>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}