import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") || "1";
        const limit = searchParams.get("limit") || "12";

        const response = await fetch(`https://dine-desk-backend.vercel.app/api/v1/menus?page=${page}&limit=${limit}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch from backend" }, { status: response.status });
        }

        const result = await response.json();
        const rawMenus = result.data || result.menus || [];

        const menus = rawMenus.map((item: any) => ({
            id: item.id || item._id,
            name: item.name || item.menuName,
            restaurantName: item.restaurantName || "DineDesk Partner Kitchen",
            restaurantId: item.restaurantId || "partner-kitchen",
            price: Number(item.price) || 0,
            description: item.description || "Freshly prepared gourmet specialty.",
            // Fallback image if missing
            image: item.image && item.image.startsWith("http") ? item.image : "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
            imageAlt: item.imageAlt || item.name || "Menu item",
            cuisineCategory: item.cuisineCategory || item.cuisineKey || "global",
            rating: Number(item.rating) || 4.8,
            isSaved: Boolean(item.isSaved),
            isFavorite: Boolean(item.isFavorite),
        }));

        return NextResponse.json({
            success: true,
            menus,
            totalPages: result.totalPages || Math.ceil((result.totalCount || 400) / Number(limit)) || 34,
            currentPage: Number(page),
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Proxy Error" }, { status: 500 });
    }
}