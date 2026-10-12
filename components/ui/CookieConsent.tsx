"use client";

import { useState } from "react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside className="fixed bottom-space-lg left-space-lg z-40 max-w-sm bg-surface-container-lowest border border-outline-variant rounded p-space-md shadow-[0_8px_24px_rgba(30,27,22,0.08)] flex flex-col gap-space-sm">
      <div className="flex items-start justify-between gap-space-sm">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          We use essential cookies to enhance your dining and reservation experience.
        </p>
        <button
          aria-label="Dismiss"
          onClick={() => setIsVisible(false)}
          className="text-outline hover:text-on-surface shrink-0 p-0.5"
          type="button"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
      <div className="flex items-center gap-space-sm pt-space-xs">
        <button
          onClick={() => setIsVisible(false)}
          className="px-space-md py-1.5 bg-primary-container text-on-primary rounded font-label-sm text-label-sm hover:bg-primary transition-colors"
          type="button"
        >
          Accept
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="px-space-md py-1.5 border border-outline-variant text-on-surface-variant rounded font-label-sm text-label-sm hover:border-primary-container hover:text-primary transition-colors"
          type="button"
        >
          Preferences
        </button>
      </div>
    </aside>
  );
}
