// lib/events.ts
export const notifyOrderSync = () => {
    if (typeof window !== "undefined") {
        // 1. Dispatch custom events for all components active in the current tab
        window.dispatchEvent(new Event("order-updated"));
        window.dispatchEvent(new Event("dinedesk-points-updated"));
        window.dispatchEvent(new Event("profile-updated"));

        // 2. Notify any other open browser tabs via storage event
        localStorage.setItem("dinedesk_last_sync_timestamp", Date.now().toString());
    }
};