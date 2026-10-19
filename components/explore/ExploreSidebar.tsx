"use client";

interface ExploreSidebarProps {
    openKitchensOnly: boolean;
    setOpenKitchensOnly: (val: boolean) => void;
    serviceMode: "delivery" | "dine-in";
    setServiceMode: (mode: "delivery" | "dine-in") => void;
    selectedCuisines: string[];
    toggleCuisine: (key: string) => void;
    selectedPriceTiers: string[];
    togglePriceTier: (tier: string) => void;
    minRating: number;
    setMinRating: (rating: number) => void;
    dietaryFilters: { halal: boolean; vegetarian: boolean; kidFriendly: boolean };
    setDietaryFilters: React.Dispatch<React.SetStateAction<{ halal: boolean; vegetarian: boolean; kidFriendly: boolean }>>;
    handleResetAll: () => void;
    isMobileDrawer?: boolean;
    onCloseMobileDrawer?: () => void;
}

export default function ExploreSidebar({
    openKitchensOnly,
    setOpenKitchensOnly,
    serviceMode,
    setServiceMode,
    selectedCuisines,
    toggleCuisine,
    selectedPriceTiers,
    togglePriceTier,
    minRating,
    setMinRating,
    dietaryFilters,
    setDietaryFilters,
    handleResetAll,
    isMobileDrawer = false,
    onCloseMobileDrawer,
}: ExploreSidebarProps) {
    const content = (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/60">
                <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-lg">filter_alt</span>
                    <span className="text-xs font-black uppercase tracking-widest">Filters</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleResetAll} className="text-xs text-secondary hover:underline font-bold cursor-pointer" type="button">
                        Reset All
                    </button>
                    {isMobileDrawer && onCloseMobileDrawer && (
                        <button onClick={onCloseMobileDrawer} className="p-1 rounded-full bg-surface-container text-on-surface hover:text-primary" type="button">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Open Kitchens Toggle */}
            <div className="flex items-center justify-between py-1 bg-surface-container-low/40 p-3 rounded-2xl border border-outline-variant/40">
                <div>
                    <span className="block text-xs font-bold text-on-surface">Open Kitchens Only</span>
                    <span className="block text-[11px] text-on-surface-variant font-medium">Ready for instant delivery</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input checked={openKitchensOnly} onChange={(e) => setOpenKitchensOnly(e.target.checked)} className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>

            {/* Service Mode Selector */}
            <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-extrabold">Service Mode</span>
                <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-1 rounded-2xl border border-outline-variant/60">
                    <button
                        type="button"
                        onClick={() => setServiceMode("delivery")}
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${serviceMode === "delivery" ? "bg-surface-container-lowest text-primary shadow-xs" : "text-on-surface-variant hover:text-primary"
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">delivery_dining</span> Delivery
                    </button>
                    <button
                        type="button"
                        onClick={() => setServiceMode("dine-in")}
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${serviceMode === "dine-in" ? "bg-surface-container-lowest text-primary shadow-xs" : "text-on-surface-variant hover:text-primary"
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">table_restaurant</span> Dine-in
                    </button>
                </div>
            </div>

            {/* Cuisines Categories */}
            <div className="flex flex-col gap-3 pt-3 border-t border-outline-variant/60">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-extrabold">Cuisine Categories</span>
                <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                    {[
                        { key: "all", label: "All Cuisines" },
                        { key: "desi", label: "Desi & Biryani" },
                        { key: "burger", label: "Artisan Burgers" },
                        { key: "italian", label: "Italian & Woodfired" },
                        { key: "sushi", label: "Japanese & Sushi" },
                        { key: "european", label: "European Gourmet" },
                        { key: "desserts", label: "Patisserie & Desserts" },
                    ].map((c) => (
                        <label key={c.key} className="flex items-center gap-3 text-xs text-on-surface cursor-pointer select-none font-medium hover:text-primary transition-colors">
                            <input
                                checked={c.key === "all" ? selectedCuisines.length === 0 : selectedCuisines.includes(c.key)}
                                onChange={() => toggleCuisine(c.key)}
                                className="w-4 h-4 rounded border-outline-variant text-primary accent-primary cursor-pointer"
                                type="checkbox"
                            />
                            <span className="flex-1">{c.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Tier */}
            <div className="flex flex-col gap-3 pt-3 border-t border-outline-variant/60">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-extrabold">Price Tier</span>
                <div className="grid grid-cols-3 gap-2">
                    {(["$", "$$", "$$$"] as const).map((tier) => {
                        const isSelected = selectedPriceTiers.includes(tier);
                        return (
                            <button
                                key={tier}
                                type="button"
                                onClick={() => togglePriceTier(tier)}
                                className={`py-2 border rounded-xl text-xs font-bold transition-all ${isSelected ? "border-primary bg-primary text-on-primary shadow-xs" : "border-outline-variant/70 text-on-surface hover:border-primary"
                                    }`}
                            >
                                {tier}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Minimum Rating */}
            <div className="flex flex-col gap-3 pt-3 border-t border-outline-variant/60">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-extrabold">Minimum Rating</span>
                <div className="flex flex-col gap-2">
                    {[4.5, 4.0, 3.5].map((rating) => (
                        <label
                            key={rating}
                            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${minRating === rating ? "border-primary bg-primary/5 font-bold shadow-2xs" : "border-outline-variant/50 hover:bg-surface-container-low"
                                }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <input checked={minRating === rating} onChange={() => setMinRating(rating)} className="accent-primary cursor-pointer" name="rating-filter" type="radio" />
                                <span className="text-xs text-on-surface">{rating}+ ★ & Above</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Dietary Ethos */}
            <div className="flex flex-col gap-3 pt-3 border-t border-outline-variant/60">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-extrabold">Special Dietary &amp; Ethos</span>
                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-3 text-xs text-on-surface cursor-pointer font-medium hover:text-primary">
                        <input
                            checked={dietaryFilters.halal}
                            onChange={(e) => setDietaryFilters({ ...dietaryFilters, halal: e.target.checked })}
                            className="w-4 h-4 rounded border-outline-variant accent-primary cursor-pointer"
                            type="checkbox"
                        />
                        <span>Halal Certified</span>
                    </label>
                    <label className="flex items-center gap-3 text-xs text-on-surface cursor-pointer font-medium hover:text-primary">
                        <input
                            checked={dietaryFilters.vegetarian}
                            onChange={(e) => setDietaryFilters({ ...dietaryFilters, vegetarian: e.target.checked })}
                            className="w-4 h-4 rounded border-outline-variant accent-primary cursor-pointer"
                            type="checkbox"
                        />
                        <span>Vegetarian Friendly</span>
                    </label>
                    <label className="flex items-center gap-3 text-xs text-on-surface cursor-pointer font-medium hover:text-primary">
                        <input
                            checked={dietaryFilters.kidFriendly}
                            onChange={(e) => setDietaryFilters({ ...dietaryFilters, kidFriendly: e.target.checked })}
                            className="w-4 h-4 rounded border-outline-variant accent-primary cursor-pointer"
                            type="checkbox"
                        />
                        <span>Kid &amp; Family Friendly</span>
                    </label>
                </div>
            </div>
        </div>
    );

    if (isMobileDrawer) {
        return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end lg:hidden animate-fade-in">
                <div className="w-full max-w-xs h-full bg-surface-container-lowest overflow-y-auto p-6 shadow-2xl flex flex-col justify-between">
                    {content}
                </div>
            </div>
        );
    }

    return (
        <aside className="w-full lg:w-[300px] shrink-0 sticky top-28 bg-surface-container-lowest border border-outline-variant/80 rounded-3xl p-6 flex flex-col gap-6 shadow-sm self-start">
            {content}
        </aside>
    );
}