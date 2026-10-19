import { Suspense } from "react";
import { notFound } from "next/navigation";
import BackToExploreButton from "@/components/menus/BackToExploreButton";
import MenuHero from "@/components/menus/MenuHero";
import MenuDetailsContainer from "@/components/menus/MenuDetailsContainer";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getMenuDetails(id: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://dine-desk-backend.vercel.app";

        // Fetch the full list of menus from the working public endpoint
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
}

export default async function MenuDetailsPage({ params }: PageProps) {
    const resolvedParams = await params;
    const rawData = await getMenuDetails(resolvedParams.id);

    if (!rawData) {
        notFound();
    }

    // Sanitize data and provide premium fallbacks so empty database fields never show raw/missing data
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

                {/* Step 4: Responsive Back to Explore Dynamic Button */}
                <BackToExploreButton itemId={resolvedParams.id} />

                {/* 1. Immersive Hero & Restaurant Banner */}
                <MenuHero
                    restaurantName={menuData.restaurantName}
                    neighborhood={menuData.neighborhood}
                    rating={menuData.rating}
                    reviewCount={menuData.reviewCount}
                />

                {/* Step 2: Interactive Container managing state between MenuCategoriesNav, MenuListSection, and OrderCartModal */}
                <MenuDetailsContainer menuData={menuData} />

            </div>
        </main>
    );
}