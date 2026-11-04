import type { Metadata } from "next";
import RoleGuard from "@/components/auth/RoleGuard";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const metadata: Metadata = {
  title: "Super Admin Portal — DineDesk",
  description:
    "Platform-wide analytics, restaurant moderation, admin user management, and system settings.",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["ADMIN", "SUPERADMIN"]}>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </RoleGuard>
  );
}