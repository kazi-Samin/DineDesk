// app/menus/[id]/page.tsx


import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BackToExploreButton from "@/components/menus/BackToExploreButton";
import MenuHero from "@/components/menus/MenuHero";
import MenuDetailsContainer from "@/components/menus/MenuDetailsContainer";

interface PageProps {
    params: Promise<{ id: string }>;
}

// Wrap getMenuDetails with React cache() to prevent duplicate fetches between generateMetadata and the page component
const getMenuDetails = cache(async (id: string) => {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://dine-desk-backend.vercel.app";

        const res = await fetch(`${baseUrl}/api/v1/menus/featured`, {
            cache: "no-store",
        });

        if (!res.ok) return null;
        const json = await res.json();

        const allMenus = json.success ? json.data : (Array.isArray(json) ? json : []);
        const matchedItem = allMenus.find((item: any) => item.id === id);

        if (!matchedItem) {
            const exploreRes = await fetch(`${baseUrl}/api/v1/menus`, { cache: "no-store" });
            if (exploreRes.ok) {
                const exploreJson = await exploreRes.json();
                const exploreMenus = exploreJson.success ? exploreJson.data : (Array.isArray(exploreJson) ? exploreJson : []);
                return exploreMenus.find((item: any) => item.id === id) || null;
            }
        }

        return matchedItem || null;
    } catch (error) {
        console.error("Failed to fetch menu details:", error);
        return null;
    }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const rawData = await getMenuDetails(id);

    if (!rawData) {
        return {
            title: "Restaurant Not Found",
            robots: { index: false, follow: false },
        };
    }

    const name = rawData.restaurantName || rawData.name || "DineDesk Restaurant";
    const cuisine = rawData.cuisineCategory || rawData.category || "Fine Dining";
    const city = rawData.neighborhood || "Dhaka";
    const image = rawData.image || rawData.imageUrl || "/og-image.png";

    return {
        title: `${name} Menu & Table Booking`,
        description: `See the ${name} menu, read reviews, order online or reserve a table. ${cuisine} cuisine in ${city}.`,
        alternates: { canonical: `/menus/${id}` },
        openGraph: { images: [image] },
    };
}

export default async function MenuDetailsPage({ params }: PageProps) {
    const resolvedParams = await params;
    const rawData = await getMenuDetails(resolvedParams.id);

    if (!rawData) {
        notFound();
    }

    const menuData = {
        ...rawData,
        restaurantName: rawData.restaurantName || "Sultan's Heritage Kitchen",
        menuName: rawData.menuName || rawData.name || "Special Mutton Kaacchi Biryani",
        neighborhood: rawData.neighborhood || "Banani Avenue, Dhaka 1213",
        rating: Number(rawData.rating) || 4.9,
        reviewCount: Number(rawData.reviewCount) || 628,
        cuisineCategory: rawData.cuisineCategory || rawData.category || "Authentic Mughlai & Old Dhaka Cuisine",
        description: rawData.description || "Century-old Old Dhaka royal recipes slow-cooked in copper degulates.",
        price: Number(rawData.price) || 36.50,
        image: rawData.image || rawData.imageUrl || "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
    };

    return (
        <main className="w-full min-h-screen bg-surface pb-32 pt-28 lg:pt-32">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col gap-6">

                <BackToExploreButton itemId={resolvedParams.id} />

                <MenuHero
                    restaurantName={menuData.restaurantName}
                    neighborhood={menuData.neighborhood}
                    rating={menuData.rating}
                    reviewCount={menuData.reviewCount}
                />

                <MenuDetailsContainer menuData={menuData} />

            </div>
        </main>
    );
}