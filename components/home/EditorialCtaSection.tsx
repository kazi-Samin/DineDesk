import Link from "next/link";

export default function EditorialCtaSection() {
  return (
    <section className="w-full py-space-xl">
      <div className="max-w-[1440px] mx-auto px-margin">
        <div className="bg-primary text-on-primary rounded-xl p-space-xl lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-space-xl shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl flex flex-col gap-space-md">
            <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-widest font-semibold">
              For Independent Restaurateurs
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-primary tracking-tight">
              Host Your Culinary Craft on DineDesk
            </h2>
            <p className="font-body-lg text-body-lg text-inverse-on-surface/80">
              Join Dhaka’s curated network of passionate chefs, authentic bistros, and heritage kitchens. Transparent commission, zero table gouging, and bespoke floor plan stewardship.
            </p>
            <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
              <a
                className="px-space-xl py-3 bg-on-primary text-primary rounded font-label-lg text-label-lg hover:bg-surface-bright transition-colors font-semibold"
                href="#"
              >
                Partner With DineDesk
              </a>
              <a
                className="px-space-lg py-3 text-on-primary font-label-lg text-label-lg hover:text-secondary-fixed transition-colors underline underline-offset-4"
                href="#"
              >
                Read Our Standards Manifesto
              </a>
            </div>
          </div>
          <div className="relative z-10 w-full lg:w-80 p-space-lg bg-primary-container rounded-lg flex flex-col gap-space-md text-on-primary">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary-fixed font-bold uppercase">
                Dhaka Network Growth
              </span>
              <span className="material-symbols-outlined text-secondary-fixed">trending_up</span>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-display text-display font-bold">120+</span>
              <span className="font-body-sm text-body-sm text-on-primary/70">Verified Kitchens</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-primary/80">
              4.9 Avg diner rating across 85,000+ fulfilled covers this quarter.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
