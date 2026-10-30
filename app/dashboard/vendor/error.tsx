"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function VendorError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Vendor Dashboard Error:", error);
    }, [error]);

    return (
        <div className="min-h-[80vh] w-full flex items-center justify-center p-6 bg-[#FBFBFA]">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-200 shadow-sm text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl">error_outline</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100/60 px-2.5 py-0.5 rounded-full mb-2">
                    Operations Halted
                </span>
                <h2 className="text-xl font-bold text-[#1b3b2b]">Kitchen Console Error</h2>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    We encountered an unexpected operational failure while synchronizing your live kitchen data.
                </p>
                <div className="flex items-center gap-3 mt-6 w-full">
                    <button
                        onClick={() => reset()}
                        className="flex-1 py-2.5 bg-[#1b3b2b] text-white rounded-xl text-xs font-bold hover:bg-[#1b3b2b]/90 transition-all shadow-xs cursor-pointer"
                    >
                        Retry Connection
                    </button>
                    <Link
                        href="/dashboard/vendor"
                        className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-xl text-xs font-bold transition-all text-center"
                    >
                        Console Reset
                    </Link>
                </div>
            </div>
        </div>
    );
}