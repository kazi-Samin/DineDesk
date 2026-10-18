import RoleGuard from "@/components/auth/RoleGuard";

export const metadata = {
  title: "Restaurant Partner Dashboard — DineDesk",
  description: "Manage restaurant menu, active kitchen orders, table seatings, and daily operations.",
};

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRoles={["VENDOR"]}>{children}</RoleGuard>;
}
