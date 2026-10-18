"use client";

import { motion } from "framer-motion";

const SPONSORS = [
    // Row 1: Financial & Payment Gateways
    {
        name: "Visa Secure",
        category: "Global Payment",
        logoText: "💳",
        badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        desc: "Worldwide Cards"
    },
    {
        name: "Mastercard",
        category: "Payment Gateway",
        logoText: "🌐",
        badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        desc: "Secure Processing"
    },
    {
        name: "American Express",
        category: "Premium Credit",
        logoText: "⚜️",
        badgeColor: "bg-blue-600/10 text-blue-700 border-blue-600/20",
        desc: "VIP Concierge Pay"
    },
    {
        name: "Stripe",
        category: "Checkout API",
        logoText: "⚡",
        badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
        desc: "Encrypted Transactions"
    },
    {
        name: "bKash & Nagad",
        category: "Mobile Banking",
        logoText: "📱",
        badgeColor: "bg-pink-500/10 text-pink-600 border-pink-500/20",
        desc: "Instant MFS Gateway"
    },

    // Row 2: International 5-Star Restaurant Partners & Tech
    {
        name: "Burj Al Arab Dining",
        category: "Dubai, UAE 5-Star",
        logoText: "🏨",
        badgeColor: "bg-secondary/10 text-secondary border-secondary/20",
        desc: "Luxury Hospitality"
    },
    {
        name: "Le Bernardin Network",
        category: "New York, USA",
        logoText: "⭐",
        badgeColor: "bg-primary/10 text-primary border-primary/20",
        desc: "Michelin-Starred Partner"
    },
    {
        name: "Osteria Francescana",
        category: "Modena, Italy",
        logoText: "🍷",
        badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        desc: "European Gastronomy"
    },
    {
        name: "DevCore Solutions",
        category: "System Architecture",
        logoText: "💻",
        badgeColor: "bg-primary/10 text-primary border-primary/20",
        desc: "Full-Stack Framework"
    },
    {
        name: "Global Culinary Guild",
        category: "International Network",
        logoText: "🌍",
        badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
        desc: "Cross-Border Dining"
    }
];

export default function SponsorsSection() {
    return (
        <section className="w-full py-16 bg-surface-container-low border-y border-outline-variant/60">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

                {/* Section Header */}
                <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-10">
                    <span className="text-xs font-bold text-secondary uppercase tracking-widest">
                        Global Ecosystem &amp; Network
                    </span>
                    <h2 className="mt-2 mb-1 font-heading font-extrabold text-3xl sm:text-4xl text-primary tracking-tight">
                        National &amp; International Networks
                    </h2>
                    <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                        Trusted by world-class financial institutions and Michelin-starred dining partners across USA, Europe, and UAE.
                    </p>
                </div>

                {/* 2-Row Grid with 5 Cards per Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {SPONSORS.map((sponsor, index) => (
                        <motion.div
                            key={sponsor.name}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ y: -3, scale: 1.02 }}
                            className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/80 shadow-2xs hover:border-primary/40 hover:shadow-md transition-all flex items-center gap-3.5 group"
                        >
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl border ${sponsor.badgeColor} shadow-inner shrink-0`}>
                                {sponsor.logoText}
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <h3 className="font-heading font-bold text-xs text-on-surface group-hover:text-primary transition-colors truncate">
                                    {sponsor.name}
                                </h3>
                                <p className="text-[10px] text-on-surface-variant font-medium truncate mt-0.5">
                                    {sponsor.desc}
                                </p>
                                <p className="text-[9px] text-secondary font-semibold uppercase tracking-wider mt-0.5 truncate">
                                    {sponsor.category}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}