"use client";

import React, { ReactNode } from "react";
import VendorHeader from "@/components/vendor/VendorHeader";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorFooter from "@/components/vendor/VendorFooter";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { useAuth } from "@/context/AuthContext";

export default function VendorLayoutClient({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle(
        "dinedesk_vendor_sidebar"
    );

    return (
        <div className="min-h-screen bg-[#FBFBFA] text-[#1b3b2b] flex flex-col font-body-md antialiased selection:bg-[#1b3b2b] selection:text-white">
            {/* Fixed Top Header */}
            <VendorHeader
                userName={user?.name || "Kitchen Manager"}
                restaurantName={
                    (user as any)?.restaurant?.name ||
                    (user as any)?.restaurantName ||
                    "DineDesk Kitchen Partner"
                }
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={toggleSidebar}
            />

            {/* Main Structural Area */}
            <div className="flex pt-16 flex-1 min-h-[calc(100vh-4rem)] relative overflow-x-hidden">
                {/* Fixed Left Sidebar */}
                <VendorSidebar
                    isOpen={isSidebarOpen}
                    onClose={closeSidebar}
                    onToggle={toggleSidebar}
                    restaurantName={
                        (user as any)?.restaurant?.name ||
                        (user as any)?.restaurantName ||
                        "DineDesk Culinary Outlet"
                    }
                />

                {/* Viewport Wrapper: pushes both content & footer past sidebar */}
                <div
                    className={`flex-1 flex flex-col min-h-full w-full transition-[margin] duration-300 ease-in-out ${isSidebarOpen ? "lg:ml-72 ml-0" : "lg:ml-20 ml-0"
                        }`}
                >
                    {/* Main Page Area */}
                    <main className="flex-1 w-full">
                        {children}
                    </main>

                    {/* Clean Non-Overlapping Footer */}
                    <VendorFooter />
                </div>
            </div>
        </div>
    );
}