"use client";

interface MenuCategoriesNavProps {
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
}

const CATEGORIES = [
    { id: "starters", label: "Starters & Tandoor (3)" },
    { id: "mains", label: "Heritage Mains (3)" },
    { id: "desserts", label: "Desserts & Drinks (2)" },
];

export default function MenuCategoriesNav({ activeTab = "starters", onTabChange }: MenuCategoriesNavProps) {
    return (
        <div className="sticky top-20 z-30 bg-surface/90 backdrop-blur-md py-3 border-b border-outline-variant/60">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                {CATEGORIES.map((cat) => {
                    const isActive = activeTab === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => {
                                if (onTabChange) {
                                    onTabChange(cat.id);
                                }
                            }}
                            type="button"
                            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${isActive
                                    ? "bg-primary text-on-primary shadow-md scale-105"
                                    : "bg-surface-container-low text-on-surface-variant hover:text-primary border border-outline-variant/60"
                                }`}
                        >
                            {cat.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}