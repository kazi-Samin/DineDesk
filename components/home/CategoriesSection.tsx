import Link from "next/link";
import { FOOD_CATEGORIES } from "@/data/restaurants";

export default function CategoriesSection() {
  return (
    <section className="w-full py-space-xl">
      <div className="max-w-[1440px] mx-auto px-margin">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-space-xl">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
            Categories
          </span>
          <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
            Browse by Cuisine
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Explore popular cuisines and local specialties across Dhaka.
          </p>
        </div>

        {/* 6 category photo tiles with subtle dark gradient overlay */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-space-md">
          {FOOD_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              className="group relative h-64 rounded-xl overflow-hidden shadow-xs border border-outline-variant/60 flex flex-col justify-end p-space-md"
              href={`/explore?cuisine=${category.categoryFilter}`}
            >
              <div className="absolute inset-0 bg-surface-container">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt={category.imageAlt}
                  src={category.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent"></div>
              </div>
              <div className="relative z-10 text-on-primary">
                <span className="text-[11px] font-medium text-[#f7dfd6] uppercase tracking-wider block">
                  {category.tagline}
                </span>
                <h3 className="font-headline-sm text-lg font-medium text-on-primary font-serif">
                  {category.title}
                </h3>
                <p className="font-body-sm text-[12px] text-on-primary/75 font-normal mt-0.5">
                  {category.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
