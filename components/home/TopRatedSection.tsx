"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useReservation } from "@/context/ReservationContext";

export default function TopRatedSection() {
  const router = useRouter();
  const { openReservationModal } = useReservation();

  return (
    <section className="w-full py-20 bg-surface-container-low overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 mb-12 border-b border-outline-variant/40"
        >
          <div>
            <span className="text-xs uppercase tracking-widest text-secondary font-extrabold">
              Highest Rated
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary tracking-tight mt-1">
              Top Rated Items
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant mt-2 max-w-xl font-medium">
              Top-rated Michelin-starred dining institutions with consistently excellent reviews and unforgettable culinary experiences.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:text-secondary transition-colors group cursor-pointer"
          >
            <span>Explore All Kitchens</span>
            <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </motion.div>

        {/* 3 Standout Culinary Items */}
        <div className="flex flex-col gap-10">

          {/* Standout 1: Izumi Courtyard (Items-stretch enforced - Animates from LEFT to RIGHT) */}
          <motion.div
            initial={{ opacity: 0, x: -70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/80 shadow-md hover:shadow-2xl transition-all duration-500 grid grid-cols-1 lg:grid-cols-12 items-stretch group"
          >
            <Link
              href="/explore"
              className="lg:col-span-6 relative h-72 lg:h-auto min-h-[340px] overflow-hidden block cursor-pointer"
            >
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="Omakase Nigiri Sushi Experience"
                src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000&auto=format&fit=crop"
              />
              <div className="absolute top-4 left-4 bg-primary/95 backdrop-blur-md text-on-primary px-3 py-1.5 rounded-xl font-bold text-xs tracking-wide shadow-md">
                Master Omakase Showcase
              </div>
            </Link>

            <div className="lg:col-span-6 p-8 lg:p-10 flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary uppercase tracking-widest font-extrabold">
                    Paris, France · Rue de Faubourg
                  </span>
                  <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-lg">
                    $$$$ · Robata &amp; Raw Bar
                  </span>
                </div>
                <Link href="/explore">
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary group-hover:text-secondary transition-colors cursor-pointer">
                    Izumi Courtyard &amp; Robata Grill
                  </h3>
                </Link>
                <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed font-medium">
                  Experience authentic artisanal robata grilling and pristine sashimi crafted daily by seasoned Tokyo sushi artisans. Signature dry-aged bluefin and heritage A5 Wagyu.
                </p>

                {/* Score Indicators */}
                <div className="flex items-center gap-6 pt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-500 font-black text-base">★</span>
                    <span className="font-heading font-black text-on-surface text-sm">4.95</span>
                    <span className="text-on-surface-variant text-xs font-medium">(1,420+ ratings)</span>
                  </div>
                  <div className="h-8 w-px bg-outline-variant/60"></div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-bold text-on-surface">
                      <span>Culinary Consistency</span>
                      <span className="text-primary font-black">99%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-full w-[99%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/50">
                <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
                  <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                  <span>Table reservations booking 3 days ahead</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      openReservationModal({
                        id: "izumi-courtyard",
                        name: "Izumi Courtyard & Robata Grill",
                        neighborhood: "Paris · Faubourg Saint-Honoré",
                      });
                      router.push("/reservations");
                    }}
                    className="px-4 py-3 border border-outline-variant text-primary rounded-2xl font-bold text-xs sm:text-sm hover:bg-surface-container transition-all cursor-pointer"
                    type="button"
                  >
                    Reserve Table
                  </button>
                  <Link
                    className="px-5 py-3 bg-primary text-on-primary rounded-2xl font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-md active:scale-95"
                    href="/explore?q=Izumi"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Standout 2: Midtown Grille (Animates from RIGHT to LEFT) */}
          <motion.div
            initial={{ opacity: 0, x: 70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/80 shadow-md hover:shadow-2xl transition-all duration-500 grid grid-cols-1 lg:grid-cols-12 items-stretch group"
          >
            <Link
              href="/explore?q=Star+Kabab"
              className="lg:col-span-6 relative h-72 lg:h-auto min-h-[340px] overflow-hidden lg:order-2 block cursor-pointer"
            >
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="Texas-Style Hickory Smoked BBQ Pork Ribs & Brisket"
                src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000&auto=format&fit=crop"
              />
              <div className="absolute top-4 left-4 bg-secondary text-on-secondary px-3 py-1.5 rounded-xl font-bold text-xs tracking-wide shadow-md">
                Authentic Heritage Woodfire
              </div>
            </Link>

            <div className="lg:col-span-6 p-8 lg:p-10 flex flex-col justify-between lg:order-1">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary uppercase tracking-widest font-extrabold">
                    Austin, Texas · Red River District
                  </span>
                  <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-lg">
                    $$$ · Slow-Smoked BBQ
                  </span>
                </div>
                <Link href="/explore?q=Star+Kabab">
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary group-hover:text-secondary transition-colors cursor-pointer">
                    Star Kabab &amp; Heritage Biryani
                  </h3>
                </Link>
                <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed font-medium">
                  Slow-pit smoked for 16 hours over aged post oak embers. Infused with aromatic spice blends and served alongside house-baked sourdough cornbread and sweet slaw.
                </p>

                {/* Score Indicators */}
                <div className="flex items-center gap-6 pt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-500 font-black text-base">★</span>
                    <span className="font-heading font-black text-on-surface text-sm">4.89</span>
                    <span className="text-on-surface-variant text-xs font-medium">(2,110+ ratings)</span>
                  </div>
                  <div className="h-8 w-px bg-outline-variant/60"></div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-bold text-on-surface">
                      <span>Smoker Accuracy</span>
                      <span className="text-primary font-black">98%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-full w-[98%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/50">
                <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
                  <span className="material-symbols-outlined text-primary text-base">local_shipping</span>
                  <span>Direct door dispatch under 30 mins</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      openReservationModal({
                        id: "star-kabab-heritage",
                        name: "Star Kabab & Heritage Biryani",
                        neighborhood: "Bologna · Via Indipendenza",
                      });
                      router.push("/reservations");
                    }}
                    className="px-4 py-3 border border-outline-variant text-primary rounded-2xl font-bold text-xs sm:text-sm hover:bg-surface-container transition-all cursor-pointer"
                    type="button"
                  >
                    Reserve Table
                  </button>
                  <Link
                    className="px-5 py-3 bg-primary text-on-primary rounded-2xl font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-md active:scale-95"
                    href="/explore"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Standout 3: Manhattan Prime Steakhouse (Items-stretch enforced - Animates from LEFT to RIGHT) */}
          <motion.div
            initial={{ opacity: 0, x: -70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/80 shadow-md hover:shadow-2xl transition-all duration-500 grid grid-cols-1 lg:grid-cols-12 items-stretch group"
          >
            <Link
              href="/explore"
              className="lg:col-span-6 relative h-72 lg:h-auto min-h-[340px] overflow-hidden block cursor-pointer"
            >
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="American Prime Dry-Aged Ribeye Steak"
                src="https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=1000&auto=format&fit=crop"
              />
              <div className="absolute top-4 left-4 bg-primary/95 backdrop-blur-md text-on-primary px-3 py-1.5 rounded-xl font-bold text-xs tracking-wide shadow-md">
                New York Steakhouse Legend
              </div>
            </Link>

            <div className="lg:col-span-6 p-8 lg:p-10 flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary uppercase tracking-widest font-extrabold">
                    New York, USA · Broadway &amp; 46th St
                  </span>
                  <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-lg">
                    $$$$ · Prime American Steakhouse
                  </span>
                </div>
                <Link href="/explore">
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary group-hover:text-secondary transition-colors cursor-pointer">
                    Manhattan Prime Dry-Aged Steakhouse
                  </h3>
                </Link>
                <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed font-medium">
                  USDA Prime beef aged for a minimum of 45 days in Himalayan salt-tiled dry-aging lockers. Seared at 1,800°F to create an impeccably caramelized crust.
                </p>

                {/* Score Indicators */}
                <div className="flex items-center gap-6 pt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-500 font-black text-base">★</span>
                    <span className="font-heading font-black text-on-surface text-sm">4.92</span>
                    <span className="text-on-surface-variant text-xs font-medium">(980+ ratings)</span>
                  </div>
                  <div className="h-8 w-px bg-outline-variant/60"></div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-bold text-on-surface">
                      <span>Aging Standards</span>
                      <span className="text-primary font-black">99%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-full w-[99%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/50">
                <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
                  <span className="material-symbols-outlined text-primary text-base">local_fire_department</span>
                  <span>Chef's reserve tables available tonight</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      openReservationModal({
                        id: "manhattan-prime-steakhouse",
                        name: "Manhattan Prime Dry-Aged Steakhouse",
                        neighborhood: "New York · Broadway",
                      });
                      router.push("/reservations");
                    }}
                    className="px-4 py-3 border border-outline-variant text-primary rounded-2xl font-bold text-xs sm:text-sm hover:bg-surface-container transition-all cursor-pointer"
                    type="button"
                  >
                    Reserve Table
                  </button>
                  <Link
                    className="px-5 py-3 bg-primary text-on-primary rounded-2xl font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-md active:scale-95"
                    href="/explore?q=Manhattan+Prime"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
