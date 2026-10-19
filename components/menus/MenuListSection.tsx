"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuItemProps } from "@/components/ui/MenuCard";

interface MenuListSectionProps {
    currentItem: MenuItemProps & { description?: string; price?: number; name?: string };
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
    const [imgSrc, setImgSrc] = useState(currentItem.image || FALLBACK_IMAGE);
    const unitPrice = Number(currentItem.price || 36.50);

    const handleDelta = (delta: number) => {
        setQuantity((prev) => Math.max(1, prev + delta));
    };

    const currentDetails = CATEGORY_DETAILS[activeTab] || CATEGORY_DETAILS.starters;
    const totalPrice = (unitPrice * quantity).toFixed(2);
    const dishName = currentItem.menuName || currentItem.name || "Gourmet Dish";

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
                <div className="flex-1 flex flex-col justify-between gap-2 w-full">
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

                    <div className="flex items-center justify-between pt-2">
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