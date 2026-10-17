import Link from "next/link";

export default function EditorialCtaSection() {
  return (
    <section className="w-full py-space-xl">
      <div className="max-w-[1440px] mx-auto px-margin">
        <div className="bg-primary rounded-2xl p-space-xl lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-space-xl shadow-lg border border-primary/20 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl flex flex-col gap-space-md">
            <span className="font-label-sm text-xs text-[#f7dfd6] uppercase tracking-wider font-medium">
              For Restaurant Owners
            </span>
            <h2 className="font-headline-lg text-3xl sm:text-4xl text-on-primary tracking-tight font-medium font-serif leading-tight">
              Partner with DineDesk
            </h2>
            <p className="font-body-lg text-base sm:text-lg text-on-primary/80 font-normal leading-relaxed max-w-xl">
              Grow your restaurant business in Dhaka. Get reliable food delivery dispatch, easy table reservations management, and transparent weekly payouts.
            </p>
            <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
              <Link
                className="px-6 py-3 bg-[#f7f7f4] text-primary rounded-lg font-medium text-sm hover:bg-white transition-all shadow-sm"
                href="/dashboard/vendor/orders"
              >
                Partner With DineDesk
              </Link>
              <Link
                className="px-4 py-3 text-on-primary/85 hover:text-on-primary font-medium text-sm underline underline-offset-4 transition-colors"
                href="/explore"
              >
                Explore Restaurants
              </Link>
            </div>
          </div>
          <div className="relative z-10 w-full lg:w-80 p-6 bg-[#172e20] border border-white/10 rounded-xl flex flex-col gap-3 text-on-primary shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#f7dfd6] font-medium uppercase tracking-wider">
                Dhaka Network Growth
              </span>
              <span className="material-symbols-outlined text-base text-[#f7dfd6]">trending_up</span>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="text-4xl font-display font-medium text-on-primary">120+</span>
              <span className="text-xs text-on-primary/70 font-normal">Verified Kitchens</span>
            </div>
            <p className="text-xs text-on-primary/75 font-normal leading-relaxed">
              4.9 average diner rating across 85,000+ completed orders and reservations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
