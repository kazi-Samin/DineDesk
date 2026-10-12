import Link from "next/link";
import { TOP_RATED_RESTAURANTS } from "@/data/restaurants";

export default function TopRatedSection() {
  return (
    <section className="w-full py-space-xl bg-surface-container-low">
      <div className="max-w-[1440px] mx-auto px-margin">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg mb-space-lg">
          <div>
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold">
              The Gold Standard
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Top Rated Restaurants
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Dhaka’s premier dining institutions with sustained five-star patron ratings.
            </p>
          </div>
          <div className="flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-secondary">verified_user</span>
            <span>Verified DineDesk dining audits</span>
          </div>
        </div>
        <div className="flex flex-col gap-space-lg">
          {/* Standout 1: Izumi Japanese Kitchen */}
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-md grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-6 relative h-64 lg:h-auto min-h-[300px] overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="Zen Japanese courtyard dining room at dusk with bonsai garden views, candle-lit wooden dining tables, and delicate ceramic dinnerware in a serene luxury atmosphere."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwR7Fo5YJjNmW_NKP5D14s88pIB4JQ_I6MoJ8lb1oqr9vwIybya15y0go_w-i_PHTqmVe8JthIaSmw66qGh6UUvWaq8JKAj37X60PhTz2VABbcymBNMUPjcVuDDwNnugDPshPIMmqJFZqltz4ESdIrx1eMTOnLpKF-QFlrXL2HsRRbzzI2AYJ-ZylkMcgdWbSW_WtjHvIcMKiOUsAuVLCFpFgmbcccsIMa1JzxXTaAoR-XvxrKOoMtFg"
              />
              <div className="absolute top-space-md left-space-md bg-primary-container text-on-primary px-space-md py-1 rounded font-label-md text-label-md font-semibold">
                #1 Fine Dining 2025
              </div>
            </div>
            <div className="lg:col-span-6 p-space-xl flex flex-col justify-between">
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                    Gulshan 2 · Park Road
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    ৳৳৳৳ · Fine Dining
                  </span>
                </div>
                <h3 className="font-headline-lg text-headline-lg text-primary">
                  Izumi Courtyard &amp; Robata Grill
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Master Chef Hiroshi’s seasonal omakase, binchotan charcoal robatayaki skewers, and Dhaka’s cleanest hamachi nigiri imports.
                </p>
                {/* Star breakdown bar */}
                <div className="bg-surface-container-low p-space-md rounded my-space-xs flex items-center gap-space-md">
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
                      <div className="bg-primary-container h-full w-[99%]"></div>
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
                  <Link
                    className="px-space-lg py-space-sm bg-primary-container text-on-primary rounded font-label-md text-label-md hover:bg-primary transition-colors"
                    href="/explore"
                  >
                    Book Table or Order
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Standout 2: Star Kabab & Biryani Heritage */}
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-md grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-6 relative h-64 lg:h-auto min-h-[300px] overflow-hidden lg:order-2">
              <img
                className="w-full h-full object-cover"
                alt="Generous platter of authentic spicy mutton leg roast, flaky parathas, aromatic korma gravy, and steaming rumali roti served in a vibrant traditional South Asian banquet setting."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5FN-_BR45jsuDhvdSshnAr2pEit2Tq4aRrAllopeGVmfAjAn3ud92R-chU6Oj40F_OS4mJ1TnT5RG4-HI11E3lkDAilyXDyC1hVL1M-_vovopzH9D80s9ovcsRn4Kl5yCwSfPtoKxPoHGIqe3k2YG1YKzn5buabgqd7h4uCcIcYgwX5MtT9lqEYK5SkwDwJM21-_5NJGe8aHaynuY2QgSLHI24sdREqRAxaDfTI6JPQuV36RfP8RNSQ"
              />
              <div className="absolute top-space-md right-space-md bg-secondary text-on-secondary px-space-md py-1 rounded font-label-md text-label-md font-semibold">
                Heritage Legend · Est. 1971
              </div>
            </div>
            <div className="lg:col-span-6 p-space-xl flex flex-col justify-between lg:order-1">
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                    Dhanmondi 2
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    ৳৳ · Authentic Bengali
                  </span>
                </div>
                <h3 className="font-headline-lg text-headline-lg text-primary">
                  Star Kabab &amp; Heritage Biryani
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Uncompromising century-old recipes: spiced mutton leg roast, fall-off-the-bone khasi kacchi, and freshly spun lassi jugs.
                </p>
                <div className="bg-surface-container-low p-space-md rounded my-space-xs flex items-center gap-space-md">
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
                      <div className="bg-secondary h-full w-[98%]"></div>
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
                  <Link
                    className="px-space-lg py-space-sm bg-primary-container text-on-primary rounded font-label-md text-label-md hover:bg-primary transition-colors"
                    href="/explore"
                  >
                    Book Table or Order
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Standout 3: Le Sourdough Bistro */}
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-md grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-6 relative h-64 lg:h-auto min-h-[300px] overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="Rustic wooden table showcasing woodfired blistered sourdough pizza topped with burrata, prosciutto, fresh basil leaves, and balsamic reduction in an airy natural daylight trattoria."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuADTtnoBGSlHW_dmf0GQpaiJojCC_ywFbfy8626ID1Z376SakdGAgJaWsFaYiktM8TLLNQYaZQQQn6Pdb7alsRXY7tQtycePfyWviLfpHdfMdjaW1Dqyq0FSwdaLzNcIbxdoErzfYU95l3t2ANB43arYzU-ZQoBLTDkseIX--rSxfJPs82dhoIIUsgsBv7fbwqJSXAjwtj-Lzi1lwNep1waXDkALofdMhCFHUTefC5_3_y4LvkFWK7rxg"
              />
              <div className="absolute top-space-md left-space-md bg-primary-container text-on-primary px-space-md py-1 rounded font-label-md text-label-md font-semibold">
                Dhaka Gastronomy Choice
              </div>
            </div>
            <div className="lg:col-span-6 p-space-xl flex flex-col justify-between">
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                    Banani Rd 10
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    ৳৳৳ · Mediterranean Bistro
                  </span>
                </div>
                <h3 className="font-headline-lg text-headline-lg text-primary">
                  Le Sourdough Bistro &amp; Woodfire
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  72-hour naturally fermented sourdough pizzas, handmade tagliatelle with porcini mushrooms, and garden terrace seating.
                </p>
                <div className="bg-surface-container-low p-space-md rounded my-space-xs flex items-center gap-space-md">
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
                      <div className="bg-primary-container h-full w-[96%]"></div>
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
                  <Link
                    className="px-space-lg py-space-sm bg-primary-container text-on-primary rounded font-label-md text-label-md hover:bg-primary transition-colors"
                    href="/explore"
                  >
                    Book Table or Order
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
