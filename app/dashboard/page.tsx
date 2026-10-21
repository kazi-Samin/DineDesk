"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardLoader from "@/components/ui/DashboardLoader";

export default function DashboardIndexPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace("/sign-in?redirect=/dashboard");
      return;
    }

    if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
      router.replace("/dashboard/admin");
    } else if (user.role === "VENDOR") {
      router.replace("/dashboard/vendor");
    } else {
      router.replace("/dashboard/customer");
    }
  }, [user, isAuthenticated, isLoading, router]);

  return <DashboardLoader />;
}