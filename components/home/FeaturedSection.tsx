import Link from "next/link";
import { FEATURED_RESTAURANTS } from "@/data/restaurants";

export default function FeaturedSection() {
  return (
    <section className="w-full py-space-xl">
      <div className="max-w-[1440px] mx-auto px-margin">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md pb-space-lg mb-space-lg">
          <div>
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
              Popular Spots
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Featured Restaurants
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Top restaurants and popular places to eat this week in Dhaka.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-space-xs font-label-lg text-label-lg text-primary hover:text-secondary transition-colors underline underline-offset-4 font-semibold"
            href="/explore"
          >
            <span>Explore all restaurants</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {/* 6 Card Grid (3 columns x 2 rows) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {FEATURED_RESTAURANTS.map((restaurant) => (
            <article
              key={restaurant.id}
              className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant shadow-xs flex flex-col group h-full justify-between"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-container">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={restaurant.imageAlt}
                  src={restaurant.image}
                />
                <div className="absolute top-2.5 left-2.5 bg-surface-container-lowest/90 backdrop-blur-xs px-2.5 py-1 rounded-sm text-primary font-label-sm text-xs font-medium border border-outline-variant/60">
                  {restaurant.badge}
                </div>
                <div className="absolute top-2.5 right-2.5 bg-primary/90 backdrop-blur-xs text-on-primary px-2.5 py-1 rounded-sm font-label-sm text-xs font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">star</span>
                  <span>{restaurant.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="p-space-md flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-space-xs mb-1">
                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                      {restaurant.neighborhood}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                      {restaurant.priceTier}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-primary tracking-tight line-clamp-1">
                    {restaurant.name}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-1">
                    {restaurant.cuisine}
                  </p>
                </div>
                <div className="pt-3 mt-4 border-t border-outline-variant/50 flex items-center justify-between text-xs text-on-surface-variant font-label-sm">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      {restaurant.deliveryTime.includes("Reservation") ? "table_bar" : "schedule"}
                    </span>
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                  <div className="text-right">
                    <span>
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
