"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useReservation } from "@/context/ReservationContext";

export default function HeroSection() {
  const router = useRouter();
  const { openReservationModal } = useReservation();
  const [neighborhood, setNeighborhood] = useState("gulshan");
  const [dishQuery, setDishQuery] = useState("");

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
    <section className="relative w-full bg-surface-container-low overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-margin py-space-xl lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          {/* Text & Search Col */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg z-10">
            <div className="inline-flex items-center gap-space-xs px-3 py-1 bg-surface-container rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                Food Delivery &amp; Table Bookings
              </span>
              <span className="text-on-surface-variant font-label-sm text-label-sm">· Dhaka</span>
            </div>
            <div className="flex flex-col gap-space-sm">
              <h1 className="font-display text-display text-primary tracking-tight">
                Delicious Food, Delivered Fast
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                Order from Dhaka&apos;s best local restaurants or reserve a table for an unforgettable dining experience.
              </p>
            </div>

            {/* Quick Discovery Widget */}
            <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-outline-variant shadow-xs flex flex-col sm:flex-row gap-space-sm items-stretch">
              <div className="flex-1 flex items-center gap-space-sm bg-surface-container/70 border border-outline-variant/60 px-space-md py-space-sm rounded-md">
                <span className="material-symbols-outlined text-outline text-xl">location_on</span>
                <div className="flex flex-col flex-1">
                  <label
                    className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold tracking-wider"
                    htmlFor="neighborhood-select"
                  >
                    Neighborhood
                  </label>
                  <select
                    className="bg-transparent font-body-sm text-body-sm text-on-surface focus:outline-none cursor-pointer"
                    id="neighborhood-select"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                  >
                    <option value="gulshan">Gulshan 1 &amp; 2</option>
                    <option value="banani">Banani Avenue</option>
                    <option value="dhanmondi">Dhanmondi Satmasjid Rd</option>
                    <option value="uttara">Uttara Sectors</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-space-sm bg-surface-container/70 border border-outline-variant/60 px-space-md py-space-sm rounded-md">
                <span className="material-symbols-outlined text-outline text-xl">search</span>
                <div className="flex flex-col flex-1">
                  <label
                    className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold tracking-wider"
                    htmlFor="search-dish-input"
                  >
                    Dish or Kitchen
                  </label>
                  <input
                    className="bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
                    id="search-dish-input"
                    placeholder="Kacchi, Truffle Smash, Nigiri..."
                    type="text"
                    value={dishQuery}
                    onChange={(e) => setDishQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleFindFood();
                      }
                    }}
                  />
                </div>
              </div>
              <button
                onClick={handleFindFood}
                className="px-space-xl py-space-md bg-primary text-on-primary rounded-lg font-medium text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-space-xs shadow-xs cursor-pointer"
                type="button"
              >
                <span>Find Food</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>

            {/* CTAs & Micro stats */}
            <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
              <Link
                className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors inline-flex items-center gap-space-sm shadow-xs"
                href="/explore"
              >
                <span>Browse Restaurants</span>
                <span className="material-symbols-outlined text-base">restaurant</span>
              </Link>
              <button
                onClick={() => openReservationModal()}
                className="px-5 py-2.5 bg-surface-container border border-outline-variant text-primary rounded-lg font-medium text-sm hover:bg-surface-container-high transition-colors inline-flex items-center gap-space-sm cursor-pointer"
                type="button"
              >
                <span>Explore Reservations</span>
                <span className="material-symbols-outlined text-base">table_restaurant</span>
              </button>
              <div className="flex items-center gap-space-sm ml-auto pl-space-md text-on-surface-variant hidden md:flex">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-[11px] font-bold text-on-primary-fixed">
                    ★
                  </div>
                  <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-[11px] font-bold text-on-secondary-fixed">
                    ৳
                  </div>
                  <div className="w-7 h-7 rounded-full bg-tertiary-fixed flex items-center justify-center text-[11px] font-bold text-on-tertiary-fixed">
                    ♥
                  </div>
                </div>
                <span className="font-body-sm text-body-sm">4.8 avg table &amp; delivery score</span>
              </div>
            </div>
          </div>

          {/* Asymmetrical Hero Visual Mosaic */}
          <div className="lg:col-span-5 relative mt-space-xl lg:mt-0">
            <div className="relative w-full h-[460px] rounded-2xl overflow-hidden shadow-xs border border-outline-variant bg-surface-container">
              <img
                className="w-full h-full object-cover"
                alt="Lavish dining table setting with authentic Bengali spiced biryani steaming in brass handi, next to gourmet smash burgers on brioche buns, fresh microgreens, lime slices, and terracotta pottery, warm directional candlelight with natural dining room ambiance."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlhhPEr2cDpXnOpwRxfxyhGjcC1tdkCZGTsakYqncS4t91xT7NXEc2TgKC0SH56Gco8hQG9sOVkwjk-zs31C1xHLPVZuqvXIDvelU0rMOE0ULQFQz9cW7Gq5XeMD4s_do6simg9ATQsmPbN_PKUQ8gIUMp505r-UnylpT_mhfjmKxJU0D7kMoaCge6GDiCDd2XRvyz8hgy1Qy49ENqehe5NFD3-NXwLz1dU8_Dt8nV8J-Iy_lw9QLXWA"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent"></div>
              {/* Float Badges */}
              <div className="absolute bottom-space-md left-space-md right-space-md p-space-md bg-surface-container-lowest/95 backdrop-blur-md rounded-xl border border-outline-variant shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <span className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant/60 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-xl">verified</span>
                  </span>
                  <div>
                    <h4 className="font-medium text-on-surface text-sm leading-tight">
                      Verified Kitchens
                    </h4>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                      Real reviews, transparent pricing &amp; fast dispatch.
                    </p>
                  </div>
                </div>
                <span className="font-label-sm text-[11px] font-medium text-secondary uppercase bg-secondary-fixed/50 px-2 py-0.5 rounded-xs">
                  Top Rated
                </span>
              </div>
            </div>
            {/* Overlapping Decorative Plate Card */}
            <div className="hidden sm:flex absolute -top-space-md -left-space-md bg-surface-container-lowest p-3 rounded-xl border border-outline-variant shadow-xs items-center gap-2.5">
              <span className="material-symbols-outlined text-secondary text-2xl">timer</span>
              <div className="leading-tight">
                <p className="font-medium text-xs text-on-surface">Fast Delivery</p>
                <p className="font-body-sm text-xs text-on-surface-variant">25–35 mins</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
