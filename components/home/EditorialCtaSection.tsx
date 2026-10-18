"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function EditorialCtaSection() {
  return (
    <section className="w-full py-16">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-primary rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl border border-primary/30 relative overflow-hidden"
        >
          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left Text Col */}
          <div className="relative z-10 max-w-xl flex flex-col gap-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#f7dfd6]/15 border border-[#f7dfd6]/30 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
              <span className="text-xs text-[#f7dfd6] uppercase tracking-wider font-bold">
                For Restaurant Owners &amp; Vendors
              </span>
            </div>

            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-on-primary tracking-tight leading-tight">
              Partner with DineDesk
            </h2>

            <p className="text-sm sm:text-base text-on-primary/85 leading-relaxed">
              Grow your restaurant business in Dhaka with DevCore Solutions architecture. Get reliable food delivery dispatch, easy table reservations management, and transparent weekly payouts.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  className="px-6 py-3.5 bg-surface-container-lowest text-primary rounded-2xl font-bold text-xs sm:text-sm hover:bg-white transition-all shadow-lg inline-flex items-center gap-2"
                  href="/dashboard/vendor/orders"
                >
                  <span>Partner With DineDesk</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </motion.div>

              <Link
                className="px-5 py-3.5 text-on-primary/90 hover:text-on-primary font-semibold text-xs sm:text-sm transition-colors inline-flex items-center gap-1.5 group"
                href="/explore"
              >
                <span>Explore Restaurants</span>
                <span className="material-symbols-outlined text-sm transform group-hover:translate-x-1 transition-transform">east</span>
              </Link>
            </div>
          </div>

          {/* Right Floating Stats Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative z-10 w-full lg:w-80 p-6 bg-[#172e20]/90 backdrop-blur-xl border border-white/15 rounded-3xl flex flex-col gap-4 text-on-primary shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#f7dfd6] font-bold uppercase tracking-wider">
                Dhaka Network Growth
              </span>
              <span className="w-8 h-8 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-base">trending_up</span>
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-on-primary tracking-tight">120+</span>
              <span className="text-xs text-on-primary/70 font-semibold uppercase">Verified Kitchens</span>
            </div>

            <div className="pt-3 border-t border-white/10">
              <p className="text-xs text-on-primary/80 leading-relaxed font-medium">
                4.9 average diner rating across 85,000+ completed orders and table reservations.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}