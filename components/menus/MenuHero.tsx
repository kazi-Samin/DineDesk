"use client";

import { useState, useEffect } from "react";

interface MenuHeroProps {
    restaurantName: string;
    neighborhood: string;
    rating: number;
    reviewCount: number;
}

// World's Top 5-Star Luxury Restaurant & Fine Dining Imagery
const SLIDESHOW_IMAGES = [
    {
        url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1400&auto=format&fit=crop",
        alt: "World-Class Luxury Fine Dining Interior",
    },
    {
        url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1400&auto=format&fit=crop",
        alt: "Exquisite 5-Star Restaurant Lounge & Bar",
    },
    {
        url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1400&auto=format&fit=crop",
        alt: "Michelin Star Fine Dining Table Setup",
    },
    {
        url: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=1400&auto=format&fit=crop",
        alt: "Grand Luxury Dining Hall Architecture",
    },
    {
        url: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1400&auto=format&fit=crop",
        alt: "Exclusive Designer Restaurant Ambiance",
    },
];

export default function MenuHero({ restaurantName, neighborhood, rating, reviewCount }: MenuHeroProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Automatic slideshow timer (changes every 5 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % SLIDESHOW_IMAGES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full rounded-3xl overflow-hidden shadow-xl bg-surface-container-high border border-outline-variant/60 group">

            {/* Big Active Slideshow Image Banner */}
            <div className="relative w-full h-[360px] sm:h-[440px] lg:h-[480px] overflow-hidden">
                {SLIDESHOW_IMAGES.map((slide, idx) => (
                    <img
                        key={idx}
                        src={slide.url}
                        alt={slide.alt}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
                            }`}
                    />
                ))}

                {/* Dark Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-6 left-6 flex items-center gap-3">
                    <span className="px-3 py-1.5 rounded-xl bg-surface-container-lowest/90 backdrop-blur-md text-xs font-extrabold text-primary shadow-md border border-outline-variant/40 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                            verified
                        </span>
                        Grand 5-Star Dine-In Rating
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md">
                        Global Elite Venue
                    </span>
                </div>

                {/* Left/Right Slideshow Navigation Arrows on Hover */}
                <button
                    onClick={() => setCurrentIndex((prev) => (prev === 0 ? SLIDESHOW_IMAGES.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    type="button"
                >
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % SLIDESHOW_IMAGES.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    type="button"
                >
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>

                {/* Bottom Right Slideshow Thumbnails */}
                <div className="absolute bottom-6 right-6 flex items-center gap-2.5 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-lg">
                    {SLIDESHOW_IMAGES.map((slide, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative w-14 h-12 rounded-xl overflow-hidden transition-all cursor-pointer ${idx === currentIndex
                                    ? "ring-2 ring-primary scale-105 opacity-100 shadow-md"
                                    : "opacity-60 hover:opacity-100"
                                }`}
                            type="button"
                        >
                            <img src={slide.url} alt={slide.alt} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
}