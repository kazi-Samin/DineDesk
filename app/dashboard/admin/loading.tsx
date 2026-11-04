// app/dashboard/admin/loading.tsx
"use client";

import { motion } from "framer-motion";

export default function AdminLoading() {
    return (
        <div className="w-full min-h-[calc(100vh-160px)] flex flex-col items-center justify-center p-6 bg-[#FBFBFA] select-none">
            <div className="relative flex flex-col items-center">
                {/* Ambient Gold Glow Aura */}
                <div className="absolute w-44 h-44 rounded-full bg-[#E2B774]/15 blur-3xl pointer-events-none -top-6" />

                {/* Multi-Ring Telemetry Spinner */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                    {/* Outer Pulsing Radar Ring */}
                    <motion.div
                        animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.25, 0.5, 0.25],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute inset-0 rounded-full border border-[#1b3b2b]/15"
                    />

                    {/* Clockwise Outer Dash Ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="absolute inset-1 rounded-full border-2 border-dashed border-[#1b3b2b]/30"
                    />

                    {/* Counter-Clockwise Champagne Gold Arc Ring */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="absolute inset-3 rounded-full border-2 border-transparent border-t-[#E2B774] border-r-[#E2B774]/40"
                    />

                    {/* Central Monogram Emblem */}
                    <motion.div
                        animate={{
                            scale: [0.95, 1.05, 0.95],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="relative z-10 w-14 h-14 rounded-2xl bg-[#1b3b2b] border border-[#E2B774]/40 shadow-lg shadow-[#1b3b2b]/20 flex items-center justify-center text-[#E2B774]"
                    >
                        <span className="material-symbols-outlined text-2xl animate-pulse">
                            shield_person
                        </span>
                    </motion.div>
                </div>

                {/* Telemetry Status Labels */}
                <div className="mt-7 flex flex-col items-center text-center">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-amber-800">
                            Platform Telemetry Handshake
                        </span>
                    </div>

                    <h3 className="text-base font-bold text-[#1b3b2b] tracking-tight">
                        Synchronizing Operational Ledger
                    </h3>

                    <p className="text-xs text-neutral-500 mt-1 max-w-xs font-medium">
                        Fetching cryptographic audit trails, floor allocations, and live transaction nodes...
                    </p>

                    {/* Animated Progress Meter */}
                    <div className="w-52 h-1 bg-neutral-200/80 rounded-full overflow-hidden mt-4">
                        <motion.div
                            animate={{
                                x: ["-100%", "100%"],
                            }}
                            transition={{
                                duration: 1.4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#E2B774] to-transparent rounded-full"
                        />
                    </div>

                    <span className="text-[10px] font-mono text-neutral-400 mt-2.5">
                        CLUSTER DET-1 • SECURE SHA-256
                    </span>
                </div>
            </div>
        </div>
    );
}