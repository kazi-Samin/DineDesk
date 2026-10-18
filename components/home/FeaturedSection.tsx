"use client";

import Link from "next/link";
import { FEATURED_RESTAURANTS } from "@/data/restaurants";
import { motion } from "framer-motion";

export default function FeaturedSection() {
  return (
    <section className="w-full py-20 bg-surface-container-low">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 mb-12 border-b border-outline-variant/60">
          <div>
            <span className="text-xs text-secondary uppercase tracking-widest font-bold">
              Popular Spots
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary tracking-tight mt-1">
              Featured Restaurants
            </h2>
            <p className="text-sm text-on-surface-variant mt-2">
              Top restaurants and popular places to eat this week in Dhaka.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              className="group inline-flex items-center gap-3 px-5 py-2.5 bg-surface-container-lowest hover:bg-primary text-primary hover:text-on-primary border border-outline-variant/80 hover:border-primary rounded-2xl text-xs sm:text-sm font-bold shadow-sm transition-all duration-300"
              href="/explore"
            >
              <span>Explore all restaurants</span>
              <span className="w-6 h-6 rounded-xl bg-surface-container group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-xs transform group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </span>
            </Link>
          </motion.div>
        </div>

        {/* 6 Card Grid (3 columns x 2 rows) with Framer Motion */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURED_RESTAURANTS.map((restaurant, index) => (
            <motion.article
              key={restaurant.id}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant shadow-lg flex flex-col group h-full justify-between transition-all hover:border-primary/40 hover:shadow-xl"
            >
              {/* Image Banner */}
              <Link
                href={`/explore?q=${encodeURIComponent(restaurant.name)}`}
                className="relative aspect-[16/10] w-full overflow-hidden bg-surface-container block cursor-pointer"
              >
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt={restaurant.imageAlt}
                  src={restaurant.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 bg-surface-container-lowest/95 backdrop-blur-md px-3 py-1 rounded-xl text-primary font-bold text-xs border border-outline-variant/60 shadow-sm">
                  {restaurant.badge}
                </div>

                <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-md text-on-primary px-3 py-1 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-xs text-secondary-fixed">star</span>
                  <span>{restaurant.rating.toFixed(1)}</span>
                </div>
              </Link>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs text-secondary uppercase tracking-wider font-extrabold">
                      {restaurant.neighborhood}
                    </span>
                    <span className="text-xs text-on-surface-variant font-bold px-2 py-0.5 rounded-lg bg-surface-container">
                      {restaurant.priceTier}
                    </span>
                  </div>

                  <Link href={`/explore?q=${encodeURIComponent(restaurant.name)}`}>
                    <h3 className="font-heading font-bold text-lg text-primary tracking-tight line-clamp-1 hover:text-secondary transition-colors">
                      {restaurant.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-on-surface-variant mt-1 line-clamp-1 font-medium">
                    {restaurant.cuisine}
                  </p>
                </div>

                {/* Footer Meta */}
                <div className="pt-4 mt-5 border-t border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">
                      {restaurant.deliveryTime.includes("Reservation") ? "table_bar" : "schedule"}
                    </span>
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                  <div>
                    <span className="text-on-surface font-bold">
                      {restaurant.reviewCount}+
                    </span>{" "}
                    <span className="text-on-surface-variant">reviews</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}