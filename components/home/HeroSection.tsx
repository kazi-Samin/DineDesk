"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HeroSection() {
  const router = useRouter();
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
            <div className="inline-flex items-center gap-space-xs px-space-sm py-1 bg-surface-container rounded w-fit">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                Dhaka Culinary Dispatch
              </span>
              <span className="text-on-surface-variant font-label-sm text-label-sm">· Autumn Edition</span>
            </div>
            <div className="flex flex-col gap-space-sm">
              <h1 className="font-display text-display text-primary tracking-tight">
                Delicious Food, Delivered Fast
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                Handcrafted biryanis, artisanal sourdough smash burgers, and table bookings at Dhaka’s finest independent dining spots.
              </p>
            </div>

            {/* Quick Discovery Widget */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-md flex flex-col sm:flex-row gap-space-sm items-stretch">
              <div className="flex-1 flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded">
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
              <div className="flex-1 flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded">
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
                className="px-space-xl py-space-md bg-primary-container text-on-primary rounded font-label-lg text-label-lg hover:bg-primary transition-all flex items-center justify-center gap-space-xs shadow-sm cursor-pointer"
                type="button"
              >
                <span>Find Food</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>

            {/* CTAs & Micro stats */}
            <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
              <Link
                className="px-space-lg py-3 bg-primary-container text-on-primary rounded font-label-lg text-label-lg hover:bg-primary transition-colors inline-flex items-center gap-space-sm"
                href="/explore"
              >
                <span>Browse Restaurants</span>
                <span className="material-symbols-outlined text-base">restaurant</span>
              </Link>
              <Link
                className="px-space-lg py-3 bg-surface-container-high text-primary rounded font-label-lg text-label-lg hover:bg-surface-container-highest transition-colors inline-flex items-center gap-space-sm"
                href="/explore"
              >
                <span>Explore Reservations</span>
                <span className="material-symbols-outlined text-base">table_restaurant</span>
              </Link>
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
            <div className="relative w-full h-[460px] rounded-xl overflow-hidden shadow-xl bg-surface-container">
              <img
                className="w-full h-full object-cover"
                alt="Lavish dining table setting with authentic Bengali spiced biryani steaming in brass handi, next to gourmet smash burgers on brioche buns, fresh microgreens, lime slices, and terracotta pottery, warm directional candlelight with natural dining room ambiance."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlhhPEr2cDpXnOpwRxfxyhGjcC1tdkCZGTsakYqncS4t91xT7NXEc2TgKC0SH56Gco8hQG9sOVkwjk-zs31C1xHLPVZuqvXIDvelU0rMOE0ULQFQz9cW7Gq5XeMD4s_do6simg9ATQsmPbN_PKUQ8gIUMp505r-UnylpT_mhfjmKxJU0D7kMoaCge6GDiCDd2XRvyz8hgy1Qy49ENqehe5NFD3-NXwLz1dU8_Dt8nV8J-Iy_lw9QLXWA"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent"></div>
              {/* Float Badges */}
              <div className="absolute bottom-space-md left-space-md right-space-md p-space-md bg-surface-container-lowest/95 backdrop-blur rounded shadow-md flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <span className="w-10 h-10 rounded bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">verified</span>
                  </span>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                      Curated Local Kitchens
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Zero hidden surcharges. Direct kitchen dispatch.
                    </p>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm font-semibold text-secondary uppercase bg-secondary-fixed/50 px-space-xs py-0.5 rounded">
                  Dhaka Verified
                </span>
              </div>
            </div>
            {/* Overlapping Decorative Plate Card */}
            <div className="hidden sm:flex absolute -top-space-md -left-space-md bg-surface-container-lowest p-space-sm rounded-lg shadow-lg items-center gap-space-sm">
              <span className="material-symbols-outlined text-secondary text-2xl">timer</span>
              <div className="leading-none">
                <p className="font-label-sm text-label-sm text-on-surface font-bold">Avg. Dispatch</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">28-35 mins</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
