// components/admin/AdminLayoutClient.tsx
"use client";

import { useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminFooter from "@/components/admin/AdminFooter";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // In-memory profile state without localStorage
    const [adminProfile, setAdminProfile] = useState<{
        name: string;
        avatar: string;
    }>({
        name: (user as any)?.name || "Fourkan Bin Ilias",
        avatar:
            (user as any)?.image ||
            (user as any)?.avatar ||
            (user as any)?.picture ||
            (user as any)?.photoURL ||
            (user as any)?.profileImage ||
            "",
    });

    const handleUpdateProfile = (updated: { name: string; avatar: string }) => {
        setAdminProfile(updated);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#FBFBFA] antialiased selection:bg-[#1b3b2b] selection:text-white">
            {/* Top Fixed Header */}
            <AdminHeader
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                adminProfile={adminProfile}
                onUpdateProfile={handleUpdateProfile}
            />

            {/* Admin Sidebar */}
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onToggle={() => setIsSidebarOpen((prev) => !prev)}
                adminProfile={adminProfile}
            />

            {/* Main Content & Footer offset to the right on desktop */}
            <div
                className={`flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden pt-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20"
                    }`}
            >
                <main className="flex-1 w-full min-w-0 max-w-full">{children}</main>
                <AdminFooter />
            </div>
        </div>
    );
}