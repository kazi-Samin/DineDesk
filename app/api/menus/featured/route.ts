import { NextResponse } from "next/server";

export async function GET() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://dine-desk-backend.vercel.app";
        const response = await fetch(`${baseUrl}/api/v1/menus/featured`, {
            cache: "no-store",
        });

        if (!response.ok) {
            return NextResponse.json([]);
        }

        const result = await response.json();

        // Handle backend structure { success: true, data: [...] } or direct array
        const rawData = result.success && Array.isArray(result.data)
            ? result.data
            : Array.isArray(result)
                ? result
                : [];

        // Map database fields to the exact properties your MenuCard expects
        const formattedMenus = rawData.map((item: any) => ({
            id: item.id || item._id,
            menuName: item.name || item.menuName || "Gourmet Dish",
            cuisineCategory: item.cuisineCategory || item.category || "gourmet",
            priceTier: item.priceTier || (Number(item.price) > 25 ? "$$$" : Number(item.price) > 15 ? "$$" : "$"),
            price: item.price || 18.50, // Properly passes actual item price for USD display
            rating: item.rating || 4.8,
            reviewCount: item.soldCount || item.reviewCount || 45,
            restaurantName: item.restaurantName || "DineDesk Kitchen",
            deliveryTime: item.deliveryTime || "25-30 mins",
            deliveryFee: item.deliveryFee || 5.00, // Standardized USD delivery fee
            image: item.imageUrl || item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
            imageAlt: item.name || "Menu item",
            badge: item.badge || (item.featured ? "Featured Top Pick" : null),
            neighborhood: item.neighborhood || "Gulshan, Dhaka",
            isOpen: item.isAvailable ?? true,
            isHalal: item.isHalal ?? true,
            isVegetarianFriendly: item.isVegetarianFriendly ?? false,
            isKidFriendly: item.isKidFriendly ?? true,
        }));

        return NextResponse.json(formattedMenus);
    } catch (error) {
        console.error("Failed to fetch featured menus from backend:", error);
        return NextResponse.json([]);
    }
}