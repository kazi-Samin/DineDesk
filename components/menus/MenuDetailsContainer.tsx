"use client";

import { useState } from "react";
import MenuCategoriesNav from "@/components/menus/MenuCategoriesNav";
import MenuListSection from "@/components/menus/MenuListSection";
import DinerReviews from "@/components/menus/DinerReviews";
import TableBookingWidget from "@/components/menus/TableBookingWidget";
import LocationAccessMap from "@/components/menus/LocationAccessMap";
import OrderCartModal from "@/components/menus/OrderCartModal";
import { MenuItemProps } from "@/components/ui/MenuCard";

interface MenuDetailsContainerProps {
    menuData: MenuItemProps & { description?: string; price?: number; name?: string; restaurantName?: string };
}

export default function MenuDetailsContainer({ menuData }: MenuDetailsContainerProps) {
    const [activeTab, setActiveTab] = useState("starters");
    const [quantity, setQuantity] = useState<number>(1);

    const unitPrice = Number(menuData.price || 36.50);
    const restaurantName = menuData.restaurantName || "Sultan's Heritage Kitchen";

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Interactive Category Navigation Tabs */}
            <MenuCategoriesNav activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Main Content Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Menu Items & Reviews */}
                <div className="lg:col-span-8 flex flex-col gap-10">
                    <MenuListSection
                        currentItem={menuData}
                        activeTab={activeTab}
                        quantity={quantity}
                        setQuantity={setQuantity}
                    />
                    <DinerReviews />
                </div>

                {/* Right Column: Sticky Table Reservation & Map Widget */}
                <div className="lg:col-span-4 flex flex-col gap-6 sticky top-28">
                    <TableBookingWidget restaurantName={restaurantName} />
                    <LocationAccessMap
                        neighborhood={menuData.neighborhood}
                        restaurantName={restaurantName}
                    />
                </div>
            </div>

            {/* Floating Order Cart & Payment Modal Bar */}
            <OrderCartModal
                item={{
                    id: menuData.id,
                    name: menuData.menuName || menuData.name || "Gourmet Dish",
                    price: unitPrice,
                    image: menuData.image,
                }}
                quantity={quantity}
            />
        </div>
    );
}