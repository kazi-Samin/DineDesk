"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service if needed
    console.error("DineDesk Application Error:", error);
  }, [error]);

  return (
    <main className="w-full pt-28 pb-20 bg-background min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto px-margin text-center">
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-2xs border border-outline-variant">
          <div className="w-16 h-16 rounded-full bg-surface-container text-secondary mx-auto flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-4xl">error_outline</span>
          </div>
          <h1 className="font-headline-lg text-primary text-2xl font-medium">Something went wrong</h1>
          <p className="font-body-md text-on-surface-variant mt-2 text-sm leading-relaxed">
            An unexpected error occurred while loading this culinary experience. Please try refreshing or return to the main lobby.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => reset()}
              type="button"
              className="px-5 py-2.5 bg-primary-container text-on-primary rounded-lg font-medium text-sm hover:bg-primary transition-colors shadow-2xs cursor-pointer"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 bg-surface-container border border-outline-variant text-on-surface rounded-lg font-medium text-sm hover:bg-surface-container-high transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
