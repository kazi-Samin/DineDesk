"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

export default function TableMateAIBadge() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (
    pathname?.startsWith("/dashboard") ||
    pathname === "/sign-in" ||
    pathname === "/login"
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-space-lg right-space-lg z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-space-sm px-space-lg py-space-md bg-surface-container-lowest border border-outline-variant rounded-full text-primary-container shadow-[0_4px_16px_rgba(30,27,22,0.06)] hover:border-primary-container transition-all group"
        type="button"
        aria-label="TableMate AI Assistant"
      >
        <span className="material-symbols-outlined text-xl text-primary-container group-hover:scale-110 transition-transform">
          auto_awesome
        </span>
        <span className="font-label-lg text-label-lg font-medium tracking-tight text-on-surface">
          TableMate AI
        </span>
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_12px_36px_rgba(30,27,22,0.12)] p-space-md flex flex-col gap-space-sm">
          <div className="flex items-center justify-between border-b border-outline-variant pb-space-xs">
            <div className="flex items-center gap-space-xs text-primary">
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              <span className="font-label-md font-semibold">TableMate AI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-on-surface-variant hover:text-on-surface"
              aria-label="Close assistant"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
          <p className="font-body-sm text-[13px] text-on-surface-variant">
            Craving recommendations or need help picking Dhaka’s best table tonight?
          </p>
          <div className="flex flex-col gap-1 text-[12px]">
            <button
              onClick={() => setIsOpen(false)}
              className="text-left p-1.5 rounded bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors"
            >
              &ldquo;Find the best Mughlai kacchi in Gulshan&rdquo;
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-left p-1.5 rounded bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors"
            >
              &ldquo;Where can I book an open garden table?&rdquo;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
