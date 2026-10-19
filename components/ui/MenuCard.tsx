"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export interface MenuItemProps {
    id: string;
    menuName: string;
    cuisineCategory: string;
    priceTier: string;
    price?: number | string;
    rating: number;
    reviewCount: number;
    restaurantName: string;
    deliveryTime: string;
    deliveryFee?: number | string;
    image: string;
    imageAlt: string;
    badge?: string | null;
    neighborhood: string;
    isOpen?: boolean;
    isHalal?: boolean;
    isVegetarianFriendly?: boolean;
    isKidFriendly?: boolean;
}

interface MenuCardProps {
    item: MenuItemProps;
    viewMode?: "grid" | "list";
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop";

export default function MenuCard({ item, viewMode = "grid" }: MenuCardProps) {
    const isOpen = item.isOpen ?? true;
    const [imgSrc, setImgSrc] = useState(item.image || FALLBACK_IMAGE);

    // Extract clean name (removes "Menu Item #X:" prefix if present)
    const cleanDishName = item.menuName
        ? item.menuName.replace(/^Menu Item #\d+:\s*/, '')
        : "Gourmet Culinary Masterpiece";

    // Extract item serial badge number from ID or name
    const itemNumberMatch = item.menuName?.match(/#(\d+)/);
    const itemSerialTag = itemNumberMatch ? `#${itemNumberMatch[1]}` : item.id ? `#${item.id.slice(-4).toUpperCase()}` : '#001';

    // Format item price safely
    const itemPrice = item.price ? Number(item.price).toFixed(2) : "18.50";

    if (viewMode === "list") {
        return (
            <motion.article
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -3 }}
                className={`group bg-surface-container-lowest border border-outline-variant hover:border-primary/60 rounded-3xl flex flex-col md:flex-row transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl md:h-[220px] w-full ${!isOpen ? "opacity-90" : ""
                    }`}
            >
                {/* Left Image Section - Fixed rigid dimensions for uniform shape */}
                <div className="relative w-full h-56 md:h-full md:w-[320px] shrink-0 bg-surface-container-high overflow-hidden">
                    <img
                        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${!isOpen ? "grayscale-[30%]" : ""
                            }`}
                        alt={item.imageAlt || cleanDishName}
                        src={imgSrc}
                        onError={() => setImgSrc(FALLBACK_IMAGE)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {!isOpen && <div className="absolute inset-0 bg-inverse-surface/30 backdrop-blur-[2px]" />}

                    {/* Rating Pill */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface-container-lowest/95 backdrop-blur-md border border-outline-variant/60 text-xs font-bold text-primary shadow-md">
                        <span className="material-symbols-outlined text-sm text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                        </span>
                        <span>{item.rating?.toFixed(1) || "4.8"}</span>
                        <span className="text-on-surface-variant font-medium">({item.reviewCount || 45}+)</span>
                    </div>

                    {/* Badge */}
                    {item.badge && (
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-xl font-bold text-[10px] tracking-wider uppercase bg-primary text-on-primary shadow-md">
                            {item.badge}
                        </div>
                    )}

                    {/* Neighborhood Tag */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-surface-container-lowest/90 backdrop-blur-md text-primary font-bold text-[10px] tracking-wide shadow-sm">
                            {item.neighborhood || "Gulshan, Dhaka"}
                        </span>
                        {item.isHalal && (
                            <span className="px-2 py-1 rounded-lg bg-emerald-500 text-white font-bold text-[10px] shadow-sm">
                                Halal
                            </span>
                        )}
                    </div>
                </div>

                {/* Right Info Section */}
                <div className="p-6 flex flex-col flex-1 justify-between gap-4 overflow-hidden">
                    <div>
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-container text-primary uppercase tracking-widest border border-outline-variant/40">
                                        {itemSerialTag}
                                    </span>
                                    <span className="text-xs text-secondary uppercase tracking-widest font-extrabold truncate max-w-[200px]">
                                        {item.restaurantName}
                                    </span>
                                </div>
                                <h3 className="font-heading font-bold text-lg sm:text-xl text-on-surface group-hover:text-primary transition-colors mt-0.5 truncate max-w-md">
                                    {cleanDishName}
                                </h3>
                            </div>
                            <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-sm font-extrabold tracking-tight shrink-0">
                                ${itemPrice}
                            </span>
                        </div>

                        <p className="text-xs text-on-surface-variant font-medium mt-2 capitalize flex items-center gap-2">
                            <span>Cuisine: {item.cuisineCategory}</span>
                        </p>
                    </div>

                    <div className="pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant font-semibold">
                        <span className="flex items-center gap-1.5 text-primary">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {item.deliveryTime || "25 mins"}
                        </span>
                        <span className="flex items-center gap-1.5 text-secondary font-bold">
                            <span className="material-symbols-outlined text-sm">moped</span>
                            ${item.deliveryFee || 5.00} Delivery
                        </span>
                    </div>
                </div>
            </motion.article>
        );
    }

    // Grid View Mode (Default)
    return (
        <motion.article
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className={`group bg-surface-container-lowest border border-outline-variant hover:border-primary/50 rounded-3xl flex flex-col transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl h-full justify-between ${!isOpen ? "opacity-90" : ""
                }`}
        >
            {/* Top Image Banner */}
            <div className="relative w-full aspect-[16/10] bg-surface-container-high overflow-hidden">
                <img
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${!isOpen ? "grayscale-[30%]" : ""
                        }`}
                    alt={item.imageAlt || cleanDishName}
                    src={imgSrc}
                    onError={() => setImgSrc(FALLBACK_IMAGE)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {!isOpen && <div className="absolute inset-0 bg-inverse-surface/30 backdrop-blur-[2px]" />}

                {/* Rating Pill */}
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface-container-lowest/95 backdrop-blur-md border border-outline-variant/60 text-xs font-bold text-primary shadow-md">
                    <span className="material-symbols-outlined text-sm text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                    </span>
                    <span>{item.rating?.toFixed(1) || "4.8"}</span>
                    <span className="text-on-surface-variant font-medium">({item.reviewCount || 45}+)</span>
                </div>

                {/* Badge */}
                {item.badge && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-xl font-bold text-[10px] tracking-wider uppercase bg-primary text-on-primary shadow-md">
                        {item.badge}
                    </div>
                )}

                {/* Bottom Image Tags (Neighborhood & Halal) */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-surface-container-lowest/90 backdrop-blur-md text-primary font-bold text-[10px] tracking-wide shadow-sm">
                        {item.neighborhood || "Gulshan, Dhaka"}
                    </span>
                    {item.isHalal && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/90 backdrop-blur-md text-white font-bold text-[10px] shadow-sm">
                            Halal Certified
                        </span>
                    )}
                </div>
            </div>

            {/* Card Body Information */}
            <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-container text-primary uppercase tracking-wider border border-outline-variant/40 shadow-2xs">
                                {itemSerialTag}
                            </span>
                            <span className="text-xs text-secondary uppercase tracking-wider font-extrabold truncate max-w-[130px]">
                                {item.restaurantName}
                            </span>
                        </div>
                        {/* Replaced priceTier with actual formatted dish price */}
                        <span className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-xs font-extrabold tracking-tight">
                            ${itemPrice}
                        </span>
                    </div>

                    <h3 className="font-heading font-bold text-lg text-primary tracking-tight line-clamp-1 group-hover:text-secondary transition-colors">
                        {cleanDishName}
                    </h3>

                    <p className="text-xs text-on-surface-variant font-medium mt-1 capitalize">
                        Category: {item.cuisineCategory}
                    </p>
                </div>

                {/* Footer Meta Status Bar */}
                <div className="pt-4 border-t border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant font-semibold">
                    <span className="flex items-center gap-1.5 text-primary font-bold">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {item.deliveryTime || "25 mins"}
                    </span>
                    <span className="flex items-center gap-1 text-secondary font-bold">
                        <span className="material-symbols-outlined text-sm">moped</span>
                        ${item.deliveryFee || 5.00} Delivery
                    </span>
                </div>
            </div>
        </motion.article>
    );
}