"use client";

import { motion } from "framer-motion";

export default function DashboardLoader() {
    return (
        <div className="min-h-[75vh] w-full flex flex-col items-center justify-center gap-8 bg-[#f8f9f6] px-4">
            <div className="relative flex items-center justify-center">
                {/* Pulsing Outer Aura */}
                <motion.div
                    animate={{
                        scale: [1, 1.35, 1],
                        opacity: [0.15, 0.4, 0.15],
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute w-32 h-32 rounded-full bg-[#1b3b2b]/15 blur-2xl"
                />

                {/* Outer Spinning Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="w-20 h-20 rounded-3xl border-2 border-dashed border-[#1b3b2b]/30 flex items-center justify-center"
                />

                {/* Inner Counter-Spinning Core */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute w-12 h-12 rounded-2xl bg-[#1b3b2b] shadow-xl flex items-center justify-center text-white"
                >
                    <span className="material-symbols-outlined text-xl text-[#C05621]">
                        bolt
                    </span>
                </motion.div>
            </div>

            <div className="flex flex-col items-center gap-3 text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.35em] text-[#C05621] bg-[#C05621]/10 px-3.5 py-1.5 rounded-full border border-[#C05621]/20">
                    DineDesk Telemetry
                </span>
                <h3 className="font-heading font-extrabold text-base text-[#1b3b2b] tracking-tight">
                    Synchronizing Customer Ledger
                </h3>
                <p className="text-xs font-medium text-[#1b3b2b]/60 max-w-xs">
                    Fetching live orders, active table reservations, and loyalty rewards from database...
                </p>

                {/* Bouncing Dots Indicator */}
                <div className="flex items-center gap-1.5 mt-2">
                    {[0, 1, 2].map((i) => (
                        <motion.span
                            key={i}
                            animate={{
                                y: [0, -6, 0],
                                backgroundColor: ["#1b3b2b", "#C05621", "#1b3b2b"],
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: "easeInOut",
                            }}
                            className="w-2 h-2 rounded-full"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}