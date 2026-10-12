import Link from "next/link";
import { FEATURED_RESTAURANTS } from "@/data/restaurants";

export default function FeaturedSection() {
  return (
    <section className="w-full py-space-xl">
      <div className="max-w-[1440px] mx-auto px-margin">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md pb-space-lg mb-space-lg">
          <div>
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold">
              Handpicked Curation
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Featured Restaurants
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Locally celebrated kitchens curated this week across Dhaka.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-space-xs font-label-lg text-label-lg text-primary hover:text-secondary transition-colors underline underline-offset-4 font-semibold"
            href="/explore"
          >
            <span>View all (48)</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {/* 6 Card Grid (3 columns x 2 rows) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {FEATURED_RESTAURANTS.map((restaurant) => (
            <article
              key={restaurant.id}
              className="bg-surface-container-lowest rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group"
            >
              <div className="relative h-52 w-full overflow-hidden bg-surface-container">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={restaurant.imageAlt}
                  src={restaurant.image}
                />
                <div className="absolute top-space-sm left-space-sm bg-surface-container-lowest/90 backdrop-blur px-space-sm py-1 rounded text-primary font-label-sm text-label-sm font-semibold">
                  {restaurant.badge}
                </div>
                <div className="absolute top-space-sm right-space-sm bg-primary-container text-on-primary px-space-sm py-1 rounded font-label-sm text-label-sm font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">star</span>
                  <span>{restaurant.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="p-space-lg flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-space-xs mb-1">
                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                      {restaurant.neighborhood}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                      {restaurant.priceTier}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-primary tracking-tight">
                    {restaurant.name}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    {restaurant.cuisine}
                  </p>
                </div>
                <div className="pt-space-md mt-space-md flex items-center justify-between bg-surface-container-low p-space-sm rounded">
                  <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-sm">
                      {restaurant.deliveryTime.includes("Reservation") ? "table_bar" : "schedule"}
                    </span>
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {restaurant.reviewCount}+ {restaurant.id === "sultans-heritage" ? "verified reviews" : "reviews"}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
