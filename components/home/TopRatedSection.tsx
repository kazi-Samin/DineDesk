"use client";

import Link from "next/link";
import { TOP_RATED_RESTAURANTS } from "@/data/restaurants";
import { useReservation } from "@/context/ReservationContext";

export default function TopRatedSection() {
  const { openReservationModal } = useReservation();
  return (
    <section className="w-full py-space-xl bg-surface-container-low">
      <div className="max-w-[1440px] mx-auto px-margin">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg mb-space-lg">
          <div>
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
              Highest Rated
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Top Rated Restaurants
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Top-rated dining institutions with consistently excellent reviews and dining experiences.
            </p>
          </div>
          <div className="flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-secondary">verified_user</span>
            <span>Verified diner reviews &amp; ratings</span>
          </div>
        </div>
        <div className="flex flex-col gap-space-lg">
          {/* Standout 1: Izumi Japanese Kitchen */}
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-0">
            <Link
              href="/explore?q=Izumi"
              className="lg:col-span-6 relative h-64 lg:h-auto min-h-[300px] overflow-hidden block cursor-pointer group"
            >
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt="Zen Japanese courtyard dining room at dusk with bonsai garden views, candle-lit wooden dining tables, and delicate ceramic dinnerware in a serene luxury atmosphere."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwR7Fo5YJjNmW_NKP5D14s88pIB4JQ_I6MoJ8lb1oqr9vwIybya15y0go_w-i_PHTqmVe8JthIaSmw66qGh6UUvWaq8JKAj37X60PhTz2VABbcymBNMUPjcVuDDwNnugDPshPIMmqJFZqltz4ESdIrx1eMTOnLpKF-QFlrXL2HsRRbzzI2AYJ-ZylkMcgdWbSW_WtjHvIcMKiOUsAuVLCFpFgmbcccsIMa1JzxXTaAoR-XvxrKOoMtFg"
              />
              <div className="absolute top-space-md left-space-md bg-primary/90 backdrop-blur-xs text-on-primary px-2.5 py-1 rounded-sm font-medium text-xs">
                #1 Fine Dining 2025
              </div>
            </Link>
            <div className="lg:col-span-6 p-space-xl flex flex-col justify-between">
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                    Downtown Detroit · Woodward Ave
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    $$$$ · Fine Dining
                  </span>
                </div>
                <Link href="/explore?q=Izumi">
                  <h3 className="font-headline-lg text-headline-lg text-primary hover:text-secondary transition-colors cursor-pointer">
                    Izumi Courtyard &amp; Robata Grill
                  </h3>
                </Link>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Master Chef Hiroshi’s seasonal omakase, binchotan charcoal robatayaki skewers, and Detroit’s freshest hamachi nigiri imports.
                </p>
                {/* Star breakdown bar */}
                <div className="bg-surface-container p-3.5 rounded-lg border border-outline-variant/60 my-space-xs flex items-center gap-space-md">
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline-lg text-headline-lg text-primary font-bold">4.95</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">/ 5.0</span>
                  </div>
                  <div className="h-8 w-px bg-outline-variant"></div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between font-label-sm text-label-sm text-on-surface">
                      <span>Culinary Consistency</span>
                      <span className="font-bold">99%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-full w-[99%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-space-md flex flex-wrap items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                  <span>Table reservations booking 3 days ahead</span>
                </div>
                <div className="flex items-center gap-space-sm">
                  <button
                    onClick={() =>
                      openReservationModal({
                        id: "izumi-courtyard",
                        name: "Izumi Courtyard & Robata Grill",
                        neighborhood: "Gulshan 2 · Park Road",
                      })
                    }
                    className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                    type="button"
                  >
                    Book Table or Order
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Standout 2: Star Kabab & Biryani Heritage */}
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-0">
            <Link
              href="/explore?q=Star+Kabab"
              className="lg:col-span-6 relative h-64 lg:h-auto min-h-[300px] overflow-hidden lg:order-2 block cursor-pointer group"
            >
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt="Generous platter of authentic spicy mutton leg roast, flaky parathas, aromatic korma gravy, and steaming rumali roti served in a vibrant traditional South Asian banquet setting."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5FN-_BR45jsuDhvdSshnAr2pEit2Tq4aRrAllopeGVmfAjAn3ud92R-chU6Oj40F_OS4mJ1TnT5RG4-HI11E3lkDAilyXDyC1hVL1M-_vovopzH9D80s9ovcsRn4Kl5yCwSfPtoKxPoHGIqe3k2YG1YKzn5buabgqd7h4uCcIcYgwX5MtT9lqEYK5SkwDwJM21-_5NJGe8aHaynuY2QgSLHI24sdREqRAxaDfTI6JPQuV36RfP8RNSQ"
              />
              <div className="absolute top-space-md right-space-md bg-secondary text-on-primary px-2.5 py-1 rounded-sm font-medium text-xs">
                Heritage Legend · Est. 1971
              </div>
            </Link>
            <div className="lg:col-span-6 p-space-xl flex flex-col justify-between lg:order-1">
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                    Midtown Detroit
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    $$ · Prime Smokehouse
                  </span>
                </div>
                <Link href="/explore?q=Midtown+Grille">
                  <h3 className="font-headline-lg text-headline-lg text-primary hover:text-secondary transition-colors cursor-pointer">
                    Midtown Grille &amp; Smokehouse
                  </h3>
                </Link>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Uncompromising post-oak smoked brisket, tender baby back ribs, and fresh cast-iron skillet cornbread.
                </p>
                <div className="bg-surface-container p-3.5 rounded-lg border border-outline-variant/60 my-space-xs flex items-center gap-space-md">
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline-lg text-headline-lg text-primary font-bold">4.88</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">/ 5.0</span>
                  </div>
                  <div className="h-8 w-px bg-outline-variant"></div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between font-label-sm text-label-sm text-on-surface">
                      <span>Authentic Flavor Score</span>
                      <span className="font-bold">98%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                      <div className="bg-secondary h-full w-[98%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-space-md flex flex-wrap items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-secondary text-base">local_shipping</span>
                  <span>Direct rapid insulated dispatch available</span>
                </div>
                <div className="flex items-center gap-space-sm">
                  <button
                    onClick={() =>
                      openReservationModal({
                        id: "star-kabab-heritage",
                        name: "Star Kabab & Heritage Biryani",
                        neighborhood: "Dhanmondi 2",
                      })
                    }
                    className="px-4 py-2.5 border border-outline-variant text-primary rounded-lg font-medium text-sm hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Reserve Table
                  </button>
                  <Link
                    className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shadow-xs"
                    href="/explore"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Standout 3: Le Sourdough Bistro */}
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-6 relative h-64 lg:h-auto min-h-[300px] overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="Rustic wooden table showcasing woodfired blistered sourdough pizza topped with burrata, prosciutto, fresh basil leaves, and balsamic reduction in an airy natural daylight trattoria."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuADTtnoBGSlHW_dmf0GQpaiJojCC_ywFbfy8626ID1Z376SakdGAgJaWsFaYiktM8TLLNQYaZQQQn6Pdb7alsRXY7tQtycePfyWviLfpHdfMdjaW1Dqyq0FSwdaLzNcIbxdoErzfYU95l3t2ANB43arYzU-ZQoBLTDkseIX--rSxfJPs82dhoIIUsgsBv7fbwqJSXAjwtj-Lzi1lwNep1waXDkALofdMhCFHUTefC5_3_y4LvkFWK7rxg"
              />
              <div className="absolute top-space-md left-space-md bg-primary/90 backdrop-blur-xs text-on-primary px-2.5 py-1 rounded-sm font-medium text-xs">
                Dhaka Gastronomy Choice
              </div>
            </div>
            <div className="lg:col-span-6 p-space-xl flex flex-col justify-between">
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                    Corktown · Michigan Ave
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    $$$ · Mediterranean Bistro
                  </span>
                </div>
                <h3 className="font-headline-lg text-headline-lg text-primary">
                  Le Sourdough Bistro &amp; Woodfire
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  72-hour naturally fermented sourdough pizzas, handmade tagliatelle with porcini mushrooms, and garden terrace seating.
                </p>
                <div className="bg-surface-container p-3.5 rounded-lg border border-outline-variant/60 my-space-xs flex items-center gap-space-md">
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline-lg text-headline-lg text-primary font-bold">4.91</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">/ 5.0</span>
                  </div>
                  <div className="h-8 w-px bg-outline-variant"></div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between font-label-sm text-label-sm text-on-surface">
                      <span>Ingredient Provenance</span>
                      <span className="font-bold">96%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-full w-[96%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-space-md flex flex-wrap items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-primary text-base">deck</span>
                  <span>Open garden patio tables available tonight</span>
                </div>
                <div className="flex items-center gap-space-sm">
                  <button
                    onClick={() =>
                      openReservationModal({
                        id: "le-sourdough-bistro",
                        name: "Le Sourdough Bistro & Woodfire",
                        neighborhood: "Banani Rd 10",
                      })
                    }
                    className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                    type="button"
                  >
                    Book Table or Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
