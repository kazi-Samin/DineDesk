"use client";

import Link from "next/link";

interface BackButtonProps {
    itemId: string;
}

export default function BackToExploreButton({ itemId }: BackButtonProps) {
    return (
        <div className="w-full flex items-center justify-between mb-4">
            <Link
                href={`/explore#card-${itemId}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 text-primary text-xs font-bold shadow-xs hover:bg-surface-container transition-all cursor-pointer group"
            >
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                    arrow_back
                </span>
                <span>Back to Explore</span>
            </Link>

            <span className="text-xs text-on-surface-variant font-medium hidden sm:inline-block">
                Item ID: <code className="font-mono text-[10px] bg-surface-container px-2 py-0.5 rounded text-primary">{itemId}</code>
            </span>
        </div>
    );
}