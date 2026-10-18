"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardIndexPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace("/sign-in?redirect=/dashboard");
      return;
    }

    if (user.role === "ADMIN") {
      router.replace("/dashboard/admin");
    } else if (user.role === "VENDOR") {
      router.replace("/dashboard/vendor");
    } else {
      router.replace("/dashboard/customer");
    }
  }, [user, isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
      <span className="material-symbols-outlined text-4xl text-primary animate-spin">
        progress_activity
      </span>
      <p className="font-headline-sm text-sm font-semibold text-primary">
        Navigating to your dashboard...
      </p>
    </div>
  );
}
