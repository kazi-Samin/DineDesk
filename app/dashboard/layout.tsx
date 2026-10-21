"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardLoader from "@/components/ui/DashboardLoader";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;

        // If not authenticated, redirect to sign-in
        if (!isAuthenticated || !user) {
            router.replace(`/sign-in?redirect=${pathname}`);
            return;
        }
    }, [user, isAuthenticated, isLoading, router, pathname]);

    // Show our luxury custom loader while determining auth or redirecting
    if (isLoading || !isAuthenticated || !user) {
        return <DashboardLoader />;
    }

    return (
        <div className="min-h-screen bg-[#f8f9f6] flex flex-col">
            {/* Shared Dashboard Wrapper Layout */}
            <div className="flex-1 w-full flex flex-col">
                {children}
            </div>
        </div>
    );
}