"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useReservation } from "@/context/ReservationContext";
import { motion, AnimatePresence } from "framer-motion";

const HERO_SLIDES = [
  {
    id: 1,
    tag: "Food Delivery & Table Bookings · Michigan Avenue",
    title: "Delicious Food, Delivered Fast",
    description: "Order from Michigan's finest local restaurants or reserve a table for an unforgettable dining experience.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
    badgeTitle: "Verified Kitchens",
    badgeSub: "Real reviews, transparent pricing & fast dispatch.",
    tagType: "Top Rated"
  },
  {
    id: 2,
    tag: "Exclusive Dining · Broadway & Bourbon",
    title: "Handcrafted Table Reservations",
    description: "Secure VIP seating at prime dining spots instantly with live floor planning and concierge assistance.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop",
    badgeTitle: "VIP Table Booking",
    badgeSub: "Zero booking fees & complimentary welcome drinks.",
    tagType: "Instant Confirm"
  },
  {
    id: 3,
    tag: "DevCore Solutions Architecture",
    title: "Chef's Special & Cloud Kitchens",
    description: "Explore exclusive cloud kitchens and secret recipes curated by top culinary masters across Dhanmondi & Uttara.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
    badgeTitle: "DevCore Curated",
    badgeSub: "Crafted with precision & premium ingredients.",
    tagType: "Chef's Special"
  },
  {
    id: 4,
    tag: "Gourmet Experience · DineDesk Live",
    title: "Taste Luxury at Your Doorstep",
    description: "Real-time order tracking, live kitchen status updates, and exclusive loyalty rewards on every order.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
    badgeTitle: "Express Dispatch",
    badgeSub: "Live rider tracking with simulated GPS updates.",
    tagType: "Live Tracking"
  }
];

export default function HeroSection() {
  const router = useRouter();
  const { openReservationModal } = useReservation();
  const [neighborhood, setNeighborhood] = useState("wenceslas");
  const [dishQuery, setDishQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide rotation every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  const handleFindFood = () => {
    const params = new URLSearchParams();
    if (dishQuery.trim()) {
      params.set("q", dishQuery.trim());
    }
    if (neighborhood) {
      params.set("neighborhood", neighborhood);
    }
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <section className="relative w-full bg-surface-container-low overflow-hidden pt-28 pb-16">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* Text & Search Col with Slide Animation */}
          <div className="lg:col-span-7 flex flex-col gap-6 z-10">

            {/* Tag & Animated Panda Mascot */}
            <div className="flex items-center gap-3 flex-wrap">
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                key={slide.id}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-full shadow-2xs"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-secondary font-semibold uppercase tracking-wider">
                  {slide.tag}
                </span>
              </motion.div>

              {/* Compact Panda Chef's Pick Badge */}
              <Link href="/explore">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-fixed text-on-primary-fixed rounded-full text-xs font-bold border border-primary/20 shadow-2xs cursor-pointer hover:bg-primary-fixed-dim transition-colors"
                >
                  <span className="text-sm">🐼</span>
                  <span>Panda Chef&apos;s Pick</span>
                </motion.div>
              </Link>
            </div>

            {/* Dynamic Sliding Headings */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide.id}
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col gap-3"
              >
                <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-primary tracking-tight leading-[1.1]">
                  {slide.title}
                </h1>
                <p className="text-base sm:text-lg text-on-surface-variant max-w-xl leading-relaxed">
                  {slide.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Quick Discovery Search Widget */}
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-surface-container-lowest p-4 sm:p-5 rounded-3xl border border-outline-variant shadow-xl flex flex-col sm:flex-row gap-3 items-stretch backdrop-blur-xl"
            >
              <div className="flex-1 flex items-center gap-3 bg-surface-container/60 border border-outline-variant/60 px-4 py-3 rounded-2xl">
                <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                <div className="flex flex-col flex-1">
                  <label
                    className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider"
                    htmlFor="neighborhood-select"
                  >
                    Neighborhood
                  </label>
                  <select
                    className="bg-transparent text-xs sm:text-sm font-semibold text-on-surface focus:outline-none cursor-pointer pt-0.5"
                    id="neighborhood-select"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                  >
                    <option value="wenceslas">Wenceslas Square</option>
                    <option value="bakerStreet">Baker Street 1 &amp; 2</option>
                    <option value="carnaby">Carnaby Street</option>
                    <option value="unterDenLinden">Unter den Linden</option>
                    <option value="fifthAvenue">Fifth Avenue</option>
                    <option value="madisonAvenue">Madison Avenue</option>
                  </select>
                </div>
              </div>

              <div className="flex-1 flex items-center gap-3 bg-surface-container/60 border border-outline-variant/60 px-4 py-3 rounded-2xl">
                <span className="material-symbols-outlined text-primary text-xl">search</span>
                <div className="flex flex-col flex-1">
                  <label
                    className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider"
                    htmlFor="search-dish-input"
                  >
                    Dish or Kitchen
                  </label>
                  <input
                    className="bg-transparent text-xs sm:text-sm font-semibold text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none pt-0.5"
                    id="search-dish-input"
                    placeholder="Kacchi, Truffle Smash, Sushi..."
                    type="text"
                    value={dishQuery}
                    onChange={(e) => setDishQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleFindFood();
                    }}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFindFood}
                className="px-6 py-3.5 bg-primary text-on-primary rounded-2xl font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                type="button"
              >
                <span>Find Food</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </motion.button>
            </motion.div>

            {/* CTAs & Micro stats */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                className="px-5 py-3.5 bg-primary text-on-primary rounded-2xl font-semibold text-xs sm:text-sm hover:bg-primary/90 transition-all inline-flex items-center gap-2 shadow-md"
                href="/explore"
              >
                <span>Browse Menu</span>
                <span className="material-symbols-outlined text-base">restaurant</span>
              </Link>

              <button
                onClick={() => openReservationModal()}
                className="px-5 py-3.5 bg-surface-container-lowest border border-outline-variant text-primary rounded-2xl font-semibold text-xs sm:text-sm hover:bg-surface-container transition-all inline-flex items-center gap-2 cursor-pointer shadow-2xs"
                type="button"
              >
                <span>Explore Reservations</span>
                <span className="material-symbols-outlined text-base">table_restaurant</span>
              </button>

              <div className="flex items-center gap-3 ml-auto pl-4 text-on-surface-variant hidden md:flex">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-[10px] font-bold text-on-primary-fixed shadow-xs">★</div>
                  <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-[10px] font-bold text-on-secondary-fixed shadow-xs">৳</div>
                  <div className="w-7 h-7 rounded-full bg-tertiary-fixed flex items-center justify-center text-[10px] font-bold text-on-tertiary-fixed shadow-xs">♥</div>
                </div>
                <span className="text-xs font-medium">4.8 avg table &amp; delivery score</span>
              </div>
            </div>

            {/* Slide Indicator Dots */}
            <div className="flex items-center gap-2 pt-2">
              {HERO_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${currentSlide === idx ? "w-10 bg-primary" : "w-2.5 bg-outline-variant"
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Asymmetrical Hero Visual Mosaic with Slide Animation & Compact Stats Cards */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide.id}
                initial={false}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-outline-variant bg-surface-container"
              >
                <img
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  alt={slide.title}
                  src={slide.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/20 to-transparent" />

                {/* Float Badge inside Image */}
                <div className="absolute bottom-4 left-4 right-4 p-4 bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl border border-outline-variant shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                      <span className="material-symbols-outlined text-xl">verified</span>
                    </span>
                    <div>
                      <h4 className="font-bold text-on-surface text-sm leading-tight">
                        {slide.badgeTitle}
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {slide.badgeSub}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-secondary uppercase bg-secondary-fixed/70 px-2.5 py-1 rounded-lg">
                    {slide.tagType}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Floating Panda Feast Status Card (Compact & Animated) */}
            <Link href="/explore">
              <motion.div
                whileHover={{ scale: 1.05 }}
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="absolute -top-5 right-2 bg-surface-container-lowest px-3.5 py-2.5 rounded-2xl border border-outline-variant shadow-xl flex items-center gap-2.5 backdrop-blur-xl z-20 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-primary-fixed border border-primary/20 flex items-center justify-center text-lg shadow-inner">
                  🐼
                </div>
                <div className="leading-tight pr-1">
                  <p className="font-bold text-[11px] text-primary">Panda&apos;s Feast</p>
                  <p className="text-[10px] text-on-surface-variant">Ordering live!</p>
                </div>
              </motion.div>
            </Link>

            {/* Floating Fast Dispatch Status Card (Compact & Animated) */}
            <Link href="/explore">
              <motion.div
                whileHover={{ scale: 1.05 }}
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
                className="absolute -top-5 left-2 bg-surface-container-lowest px-3.5 py-2.5 rounded-2xl border border-outline-variant shadow-xl flex items-center gap-2.5 backdrop-blur-xl z-20 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-base">timer</span>
                </div>
                <div className="leading-tight pr-1">
                  <p className="font-bold text-[11px] text-on-surface">Fast Dispatch</p>
                  <p className="text-[10px] text-on-surface-variant">25–35 mins</p>
                </div>
              </motion.div>
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}