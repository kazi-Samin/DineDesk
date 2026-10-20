"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuItemProps } from "@/components/ui/MenuCard";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

interface MenuListSectionProps {
    currentItem: MenuItemProps & { description?: string; price?: number; name?: string; restaurantName?: string };
    activeTab?: string;
    quantity: number;
    setQuantity: React.Dispatch<React.SetStateAction<number>>;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop";

const CATEGORY_DETAILS: Record<string, { title: string; subtitle: string; sampleName: string; desc: string }> = {
    starters: {
        title: "Starters & Tandoor Specialities",
        subtitle: "Signature appetizers prepared over fire-harvested wood charcoal hearths.",
        sampleName: "Slow-Braised Lamb Shank with Rosemary Jus",
        desc: "Tender slow-cooked lamb shank infused with aromatic rosemary jus and exotic spices.",
    },
    mains: {
        title: "Heritage Mains & Chef Curations",
        subtitle: "Royal slow-cooked generational recipes served with aromatic basmati rice.",
        sampleName: "Special Mutton Kacchi Biryani",
        desc: "Century-old Old Dhaka royal recipe slow-cooked with premium aromatic rice and tender mutton.",
    },
    desserts: {
        title: "Desserts & Artisanal Drinks",
        subtitle: "Traditional sweet delicacies and handcrafted refreshing beverages.",
        sampleName: "Royal Shahi Tukrah & Saffron Lassi",
        desc: "Crispy fried bread soaked in cardamom-scented sugar syrup topped with rich thickened milk and nuts.",
    },
};

export default function MenuListSection({ currentItem, activeTab = "starters", quantity, setQuantity }: MenuListSectionProps) {
    const { addToCart, setIsCartOpen } = useCart() as any;
    const [imgSrc, setImgSrc] = useState(currentItem.image || FALLBACK_IMAGE);
    const [adding, setAdding] = useState(false);

    const unitPrice = Number(currentItem.price || 36.50);

    const handleDelta = (delta: number) => {
        setQuantity((prev) => Math.max(1, prev + delta));
    };

    const currentDetails = CATEGORY_DETAILS[activeTab] || CATEGORY_DETAILS.starters;
    const totalPrice = (unitPrice * quantity).toFixed(2);
    const dishName = currentItem.menuName || currentItem.name || "Gourmet Dish";

    const handleAddToCart = async () => {
        setAdding(true);

        const newItem = {
            id: currentItem.id,
            menuId: currentItem.id,
            name: dishName,
            price: unitPrice,
            image: imgSrc,
            restaurantName: currentItem.restaurantName || "Sultan's Heritage Kitchen",
            quantity: quantity,
        };

        // Simulate a brief, smooth loading experience for the "Adding..." state
        await new Promise((resolve) => setTimeout(resolve, 350));

        // 1. Update via Context if available
        if (typeof addToCart === "function") {
            await addToCart(newItem);
        }

        // 2. Direct localStorage update & event dispatch to guarantee sync
        const existingCart = JSON.parse(localStorage.getItem("dine_desk_cart") || "[]");
        const itemIndex = existingCart.findIndex((i: any) => i.id === newItem.id);

        if (itemIndex > -1) {
            existingCart[itemIndex].quantity += quantity;
        } else {
            existingCart.push(newItem);
        }

        localStorage.setItem("dine_desk_cart", JSON.stringify(existingCart));
        window.dispatchEvent(new Event("storage"));

        // 3. Force open the drawer
        if (typeof setIsCartOpen === "function") {
            setIsCartOpen(true);
        }

        toast.success(`Added ${quantity}x ${dishName} to cart!`);
        setAdding(false);
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Category Section Header */}
            <div className="flex flex-col gap-1 border-b border-outline-variant/60 pb-4">
                <h2 className="font-heading font-extrabold text-2xl text-primary tracking-tight">
                    {currentDetails.title}
                </h2>
                <p className="text-xs text-on-surface-variant font-medium">
                    {currentDetails.subtitle}
                </p>
            </div>

            {/* Primary Featured Item Details Card */}
            <div className="bg-surface-container-lowest border border-primary/40 rounded-3xl p-6 shadow-md flex flex-col sm:flex-row gap-6 items-center justify-between group">
                <img
                    src={imgSrc}
                    alt={currentItem.imageAlt || dishName}
                    onError={() => setImgSrc(FALLBACK_IMAGE)}
                    className="w-full sm:w-40 h-40 object-cover rounded-2xl shadow-sm shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between gap-4 w-full">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-primary/10 text-primary uppercase">
                                {currentItem.badge || "Chef's Signature"}
                            </span>
                            <span className="text-xs text-secondary font-bold">
                                {currentItem.cuisineCategory}
                            </span>
                        </div>
                        <h3 className="font-heading font-bold text-lg text-on-surface">
                            {activeTab === "starters" ? dishName : currentDetails.sampleName}
                        </h3>
                        <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                            {currentItem.description || currentDetails.desc}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <div className="flex flex-col">
                            <span className="text-base font-black text-primary">
                                ${totalPrice}
                            </span>
                            {quantity > 1 && (
                                <span className="text-[10px] text-on-surface-variant font-medium">
                                    (${unitPrice.toFixed(2)} each)
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Quantity Counter */}
                            <div className="flex items-center gap-3 bg-surface-container px-3 py-1.5 rounded-xl border border-outline-variant/60 shadow-inner">
                                <button
                                    onClick={() => handleDelta(-1)}
                                    className="text-on-surface hover:text-primary font-bold cursor-pointer w-5 h-5 flex items-center justify-center rounded-lg bg-surface-container-lowest shadow-2xs"
                                    type="button"
                                >
                                    -
                                </button>
                                <span className="text-xs font-black text-primary w-4 text-center">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => handleDelta(1)}
                                    className="text-on-surface hover:text-primary font-bold cursor-pointer w-5 h-5 flex items-center justify-center rounded-lg bg-surface-container-lowest shadow-2xs"
                                    type="button"
                                >
                                    +
                                </button>
                            </div>

                            {/* Add to Cart Action Button with Dynamic Loading State */}
                            <button
                                onClick={handleAddToCart}
                                disabled={adding}
                                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs uppercase tracking-wider shadow-md hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                type="button"
                            >
                                {adding ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                                        <span>Adding...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">shopping_cart_checkout</span>
                                        <span>Add to Cart</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sequential Menu Cards Stream */}
            <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between text-xs text-on-surface-variant">
                    <span>Showing curated database items for {activeTab}...</span>
                    <Link href="/explore" className="text-primary font-bold hover:underline">
                        View All in Explore →
                    </Link>
                </div>
            </div>
        </div>
    );
}