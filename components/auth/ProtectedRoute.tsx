"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: ("USER" | "VENDOR" | "ADMIN" | "SUPERADMIN")[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth() as any;
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated || !user) {
                router.replace("/sign-in");
            } else if (allowedRoles && !allowedRoles.includes(user.role)) {
                router.replace("/unauthorized");
            }
        }
    }, [isAuthenticated, user, isLoading, allowedRoles, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8f9f6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-[#1b3b2b] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#1b3b2b]">Verifying Credentials...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}