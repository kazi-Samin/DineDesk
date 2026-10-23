import HeroSection from "@/components/home/HeroSection";
import FeaturedSection from "@/components/home/FeaturedSection";
import TopRatedSection from "@/components/home/TopRatedSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import EditorialCtaSection from "@/components/home/EditorialCtaSection";
import SponsorsSection from "@/components/home/SponsorsSection";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "DineDesk | Order Food Online & Reserve a Table",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <main className="w-full pt-20 bg-surface">
      <div className="flex flex-col w-full">
        <HeroSection />
        <FeaturedSection />
        <TopRatedSection />
        <CategoriesSection />
        <TestimonialsSection />
        <SponsorsSection></SponsorsSection>
        <EditorialCtaSection />
      </div>
    </main>
  );
}
