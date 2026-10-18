"use client";

import { CUSTOMER_REVIEWS } from "@/data/restaurants";
import { motion } from "framer-motion";

export default function TestimonialsSection() {
  return (
    <section className="w-full py-20 bg-surface-container-low overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 mb-12 border-b border-outline-variant/60">
          <div>
            <span className="text-xs text-secondary uppercase tracking-widest font-bold">
              Customer Reviews
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary tracking-tight mt-1">
              What Diners Say
            </h2>
            <p className="text-sm text-on-surface-variant mt-2">
              Real feedback from food lovers and regular diners in Dhaka.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant/60 rounded-2xl text-secondary font-semibold text-xs shadow-2xs">
            <span className="material-symbols-outlined text-base">forum</span>
            <span>Over 14,000 reservations &amp; orders completed</span>
          </div>
        </div>

        {/* Animated Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CUSTOMER_REVIEWS.map((review, index) => (
            <motion.article
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant shadow-lg flex flex-col justify-between transition-all group hover:border-primary/40 hover:shadow-xl"
            >
              <div>
                <div className="flex items-center gap-1 text-secondary mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm font-bold">
                      star
                    </span>
                  ))}
                </div>
                <blockquote className="font-serif italic text-primary text-base sm:text-lg leading-relaxed">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
              </div>

              <div className="pt-6 mt-6 flex items-center gap-3.5 bg-surface-container/60 p-4 rounded-2xl border border-outline-variant/40 group-hover:bg-surface-container transition-colors">
                <div
                  className={`w-11 h-11 rounded-2xl ${review.badgeColorClass} flex items-center justify-center font-bold ${review.textColorClass} text-sm shadow-sm`}
                >
                  {review.authorInitials}
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-on-surface font-bold">
                    {review.authorName}
                  </p>
                  <p className="text-[11px] text-on-surface-variant font-medium">
                    {review.authorLocation}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}