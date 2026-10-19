"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useReservation } from "@/context/ReservationContext";

export default function TopRatedSection() {
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
          <div className="flex items-center gap-2 text-on-surface-variant text-xs sm:text-sm font-semibold bg-surface-container-lowest px-4 py-2.5 rounded-2xl border border-outline-variant/60 shadow-2xs">
            <span className="material-symbols-outlined text-secondary text-lg">verified_user</span>
            <span>Verified diner reviews &amp; ratings</span>
          </div>
        </motion.div>

        {/* Restaurant Cards Container */}
        <div className="flex flex-col gap-10">

          {/* Standout 1: Izumi Japanese Kitchen (Animates from LEFT to RIGHT) */}
          <motion.div
            initial={{ opacity: 0, x: -70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/80 shadow-md hover:shadow-2xl transition-all duration-500 grid grid-cols-1 lg:grid-cols-12 items-stretch group"
          >
            <Link
              href="/explore?q=Izumi"
              className="lg:col-span-6 relative h-72 lg:h-auto min-h-[340px] overflow-hidden block cursor-pointer"
            >
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="Japanese Omakase Sushi & Sashimi Platter"
                src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000&auto=format&fit=crop"
              />
              <div className="absolute top-4 left-4 bg-primary/95 backdrop-blur-md text-on-primary px-3 py-1.5 rounded-xl font-bold text-xs tracking-wide shadow-md">
                #1 Paris Fine Dining 2026
              </div>
            </Link>

            <div className="lg:col-span-6 p-8 lg:p-10 flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary uppercase tracking-widest font-extrabold">
                    Paris, France · Rue de Faubourg Saint-Honoré
                  </span>
                  <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-lg">
                    $$$$ · 3-Star Michelin
                  </span>
                </div>
                <Link href="/explore?q=Izumi">
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary group-hover:text-secondary transition-colors cursor-pointer">
                    Izumi Courtyard &amp; Robata Grill
                  </h3>
                </Link>
                <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                  Master Chef Hiroshi’s seasonal omakase, binchotan charcoal robatayaki skewers, and Europe’s freshest hamachi nigiri imports.
                </p>

                {/* Rating Bar */}
                <div className="bg-surface-container/60 p-4 rounded-2xl border border-outline-variant/60 my-2 flex items-center gap-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-2xl text-primary font-black">4.95</span>
                    <span className="text-xs text-on-surface-variant font-bold">/ 5.0</span>
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
                <button
                  onClick={() =>
                    openReservationModal({
                      id: "izumi-courtyard",
                      name: "Izumi Courtyard & Robata Grill",
                      neighborhood: "Paris · Faubourg Saint-Honoré",
                    })
                  }
                  className="px-6 py-3 bg-primary text-on-primary rounded-2xl font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
                  type="button"
                >
                  Book Table or Order
                </button>
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
              <div className="absolute top-4 right-4 bg-secondary text-on-primary px-3 py-1.5 rounded-xl font-bold text-xs tracking-wide shadow-md">
                Bologna Tradition · Est. 1971
              </div>
            </Link>

            <div className="lg:col-span-6 p-8 lg:p-10 flex flex-col justify-between lg:order-1">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary uppercase tracking-widest font-extrabold">
                    Bologna, Italy · Via dell'Indipendenza
                  </span>
                  <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-lg">
                    $$ · Prime Trattoria
                  </span>
                </div>
                <Link href="/explore?q=Midtown+Grille">
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary group-hover:text-secondary transition-colors cursor-pointer">
                    Midtown Grille &amp; Smokehouse
                  </h3>
                </Link>
                <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                  Uncompromising slow-roasted regional meats, tender heritage ribs, and fresh Italian artisan focaccia.
                </p>

                {/* Rating Bar */}
                <div className="bg-surface-container/60 p-4 rounded-2xl border border-outline-variant/60 my-2 flex items-center gap-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-2xl text-primary font-black">4.88</span>
                    <span className="text-xs text-on-surface-variant font-bold">/ 5.0</span>
                  </div>
                  <div className="h-8 w-px bg-outline-variant/60"></div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-bold text-on-surface">
                      <span>Authentic Flavor Score</span>
                      <span className="text-secondary font-black">98%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                      <div className="bg-secondary h-full w-[98%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/50">
                <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
                  <span className="material-symbols-outlined text-secondary text-base">local_shipping</span>
                  <span>Direct rapid insulated dispatch available</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      openReservationModal({
                        id: "star-kabab-heritage",
                        name: "Star Kabab & Heritage Biryani",
                        neighborhood: "Bologna · Via Indipendenza",
                      })
                    }
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
                <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                  45-day dry-aged USDA Prime bone-in ribeye, charred over mesquite wood, served with truffle butter and cast-iron creamed spinach.
                </p>

                {/* Rating Bar */}
                <div className="bg-surface-container/60 p-4 rounded-2xl border border-outline-variant/60 my-2 flex items-center gap-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-2xl text-primary font-black">4.96</span>
                    <span className="text-xs text-on-surface-variant font-bold">/ 5.0</span>
                  </div>
                  <div className="h-8 w-px bg-outline-variant/60"></div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-bold text-on-surface">
                      <span>Steak Perfection Score</span>
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
                <button
                  onClick={() =>
                    openReservationModal({
                      id: "manhattan-prime-steakhouse",
                      name: "Manhattan Prime Dry-Aged Steakhouse",
                      neighborhood: "New York · Broadway",
                    })
                  }
                  className="px-6 py-3 bg-primary text-on-primary rounded-2xl font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
                  type="button"
                >
                  Book Table or Order
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}