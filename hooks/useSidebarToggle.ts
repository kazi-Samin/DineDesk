"use client";

import { useState, useEffect, useCallback } from "react";

export function useSidebarToggle(storageKey = "dinedesk_sidebar_open") {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        if (window.innerWidth < 1024) {
          // Mobile screens default to closed
          setIsSidebarOpen(false);
          return;
        }

        const saved = localStorage.getItem(storageKey);
        if (saved !== null) {
          setIsSidebarOpen(saved === "true");
        } else {
          // Desktop screens default to open
          setIsSidebarOpen(true);
        }
      }
    } catch {
      // LocalStorage access fallback
      setIsSidebarOpen(true);
    }
  }, [storageKey]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {}
      return next;
    });
  }, [storageKey]);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    try {
      localStorage.setItem(storageKey, "false");
    } catch {}
  }, [storageKey]);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
    try {
      localStorage.setItem(storageKey, "true");
    } catch {}
  }, [storageKey]);

  return { isSidebarOpen, toggleSidebar, closeSidebar, openSidebar, setIsSidebarOpen };
}

