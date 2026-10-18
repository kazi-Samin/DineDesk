import RoleGuard from "@/components/auth/RoleGuard";

export const metadata = {
  title: "Super Admin Portal — DineDesk",
  description: "Platform-wide analytics, restaurant moderation, admin user management, and system settings.",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRoles={["ADMIN", "SUPERADMIN"]}>{children}</RoleGuard>;
}
