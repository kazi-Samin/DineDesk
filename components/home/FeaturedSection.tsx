"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import MenuCard, { MenuItemProps } from "@/components/ui/MenuCard";

export default function FeaturedSection() {
  const [mounted, setMounted] = useState(false);
  const [featuredMenus, setFeaturedMenus] = useState<MenuItemProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetch("/api/menus/featured")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFeaturedMenus(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load featured menus:", err);
        setLoading(false);
      });
  }, []);

  // Prevent server/client markup mismatch during initial hydration
  if (!mounted) {
    return (
      <section className="w-full py-28 bg-surface-container-low overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-16 xl:px-24">
          <div className="h-96" />
        </div>
      </section>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  return (
    <section className="w-full py-28 bg-surface-container-low overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-16 xl:px-24">

        {/* Premium Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 mb-16 relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <span className="text-sm text-secondary uppercase tracking-[0.25em] font-bold bg-secondary-container/30 px-3 py-1 rounded-full">
              Gastronomy
            </span>
            <h2 className="font-heading font-extrabold text-4xl sm:text-5xl text-primary tracking-tighter mt-5 leading-[1.1]">
              Curated Culinary Masterpieces
            </h2>
            <p className="text-lg text-on-surface-variant mt-6 font-medium max-w-xl">
              Indulge in an exquisite selection of top-tier restaurants and most celebrated dishes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="shrink-0"
          >
            <Link
              className="group relative overflow-hidden inline-flex items-center justify-center gap-2.5 sm:gap-3 px-5 py-3 sm:px-8 sm:py-4 bg-primary text-on-primary rounded-2xl text-sm sm:text-base font-bold shadow-lg shadow-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 active:scale-95"
              href="/explore"
            >
              {/* Responsive Text: Short on mobile, full text on tablets/desktops */}
              <span className="relative z-10 sm:hidden">Explore All</span>
              <span className="relative z-10 hidden sm:inline">Explore Full Collection</span>

              {/* Animated Arrow Icon Box */}
              <span className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/10 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                <span className="material-symbols-outlined text-base sm:text-lg">
                  arrow_forward
                </span>
              </span>
            </Link>
          </motion.div>

          <div className="absolute -bottom-px left-0 right-0 h-[1px] bg-gradient-to-r from-amber-500/50 via-outline-variant to-transparent" />
        </div>

        {/* 6 Card Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col h-[520px] rounded-3xl bg-surface-container overflow-hidden shadow-xl animate-pulse">
                <div className="h-64 bg-surface-container-high w-full" />
                <div className="p-7 flex flex-col justify-between flex-1">
                  <div className="space-y-4">
                    <div className="h-7 bg-surface-container-high rounded-md w-3/4" />
                    <div className="h-5 bg-surface-container-high rounded-sm w-1/2" />
                  </div>
                  <div className="h-12 bg-surface-container-high rounded-2xl w-full mt-6" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredMenus.length === 0 ? (
          <div className="text-center py-24 text-on-surface-variant/80 font-semibold text-base border-2 border-dashed border-outline-variant rounded-3xl">
            <span className="material-symbols-outlined text-5xl mb-4 block opacity-60">restaurant_menu</span>
            Currently, No menus are being featured. Please check back later.
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {featuredMenus.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <MenuCard item={item} viewMode="grid" />
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </section>
  );
}