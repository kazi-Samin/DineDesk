"use client";

import { useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminFooter from "@/components/admin/AdminFooter";

export default function AdminLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen flex flex-col bg-[#FBFBFA] antialiased selection:bg-[#1b3b2b] selection:text-white">
            {/* Top Fixed Header */}
            <AdminHeader
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            />

            {/* Admin Sidebar */}
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onToggle={() => setIsSidebarOpen((prev) => !prev)}
            />

            {/* Main Content & Footer offset to the right of the sidebar on desktop */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20"
                    }`}
            >
                <main className="flex-1 w-full">{children}</main>
                <AdminFooter />
            </div>
        </div>
    );
}