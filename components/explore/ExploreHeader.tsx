"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface ExploreHeaderProps {
    totalCount: number;
}

export default function ExploreHeader({ totalCount }: ExploreHeaderProps) {
    return (
        <div className="w-full bg-surface-bright py-12 border-b border-outline-variant/40 relative overflow-hidden">
            {/* Background Decorative Glow */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
                <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-3 uppercase tracking-wider font-bold">
                    <Link className="hover:text-primary transition-colors" href="/">
                        Home
                    </Link>
                    <span className="text-outline">/</span>
                    <span className="text-primary font-semibold">Explore Menus</span>
                </nav>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-baseline gap-3">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="font-heading font-extrabold text-3xl sm:text-5xl text-primary tracking-tight bg-gradient-to-r from-primary via-primary/90 to-secondary bg-clip-text text-transparent"
                            >
                                Explore Global Culinary Masterpieces
                            </motion.h1>
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black tracking-wide border border-primary/20 shadow-xs"
                            >
                                {totalCount} Items Live
                            </motion.span>
                        </div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                            className="text-sm sm:text-base text-on-surface-variant max-w-2xl font-medium"
                        >
                            Handcrafted serially organized gourmet dishes with instant lightning-fast delivery across premier neighborhoods.
                        </motion.p>
                    </div>
                </div>
            </div>
        </div>
    );
}