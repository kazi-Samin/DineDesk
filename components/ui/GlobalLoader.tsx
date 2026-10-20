"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalLoader() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Keeps the loader active for precisely 3.5 seconds
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: "blur(10px)" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed inset-0 z-[99999] flex flex-col items-center justify-center px-4 overflow-hidden select-none bg-[#f8f9f6] text-[#1b3b2b]"
                >
                    {/* Ambient Radial Luxury Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-tr from-[#1b3b2b]/10 via-[#C05621]/10 to-transparent rounded-full blur-[90px] pointer-events-none"></div>

                    {/* Central High-End Hospitality Monogram Loader */}
                    <div className="relative flex items-center justify-center w-36 h-36 sm:w-40 sm:h-40 mb-8">
                        {/* Outer Rotating Golden Orbital Ring */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C05621] border-r-[#1b3b2b]/40 shadow-[0_0_25px_rgba(192,86,33,0.15)]"
                        />

                        {/* Middle Counter-Rotating Emerald Ring */}
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-2 rounded-full border border-dashed border-[#1b3b2b]/25"
                        />

                        {/* Center Frosted Glass Crest with Elegant Silverware SVG */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, y: [0, -4, 0] }}
                            transition={{
                                scale: { duration: 0.5 },
                                opacity: { duration: 0.5 },
                                y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="relative z-10 w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-white/80 backdrop-blur-xl border border-[#1b3b2b]/15 shadow-[0_15px_35px_rgba(27,59,43,0.08)] flex items-center justify-center"
                        >
                            <svg
                                className="w-8 h-8 sm:w-9 sm:h-9 text-[#1b3b2b]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.03-.659-1.172-.879-1.172-2.303 0-3.182s3.07-.879 4.242 0L15 9M5 21V3m14 18V3"
                                />
                            </svg>
                        </motion.div>
                    </div>

                    {/* Brand Typography & Status */}
                    <div className="flex flex-col items-center gap-2 text-center z-10">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#C05621]"
                        >
                            Fine Dining &amp; Curation
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                            className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1b3b2b] tracking-tight"
                        >
                            DineDesk
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.7 }}
                            className="text-xs sm:text-sm text-[#1b3b2b]/70 font-medium tracking-wide mt-1"
                        >
                            Preparing your tables &amp; culinary suites...
                        </motion.p>
                    </div>

                    {/* Luxury Bottom Progress Shimmer Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#1b3b2b]/10 overflow-hidden">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 3.3, ease: "easeInOut" }}
                            className="h-full bg-gradient-to-r from-[#1b3b2b] via-[#C05621] to-[#1b3b2b]"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}