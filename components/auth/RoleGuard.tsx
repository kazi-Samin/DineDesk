"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/auth";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // 1. If not authenticated, redirect to sign-in with return URL
    if (!isAuthenticated || !user) {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname || "/dashboard")}`);
      return;
    }

    // 2. If authenticated but role is not allowed, redirect to user's authorized portal
    if (!allowedRoles.includes(user.role)) {
      if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
        router.replace("/dashboard/admin");
      } else if (user.role === "VENDOR") {
        router.replace("/dashboard/vendor");
      } else {
        router.replace("/dashboard/customer");
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, pathname]);

  // Loading state matching DineDesk theme
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">
          progress_activity
        </span>
        <p className="font-headline-sm text-sm font-semibold text-primary">
          Authenticating access...
        </p>
      </div>
    );
  }

  // If not authenticated or unauthorized, render nothing while redirect finishes
  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">
          lock
        </span>
        <p className="font-headline-sm text-sm font-semibold text-primary">
          Redirecting to your authorized portal...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
