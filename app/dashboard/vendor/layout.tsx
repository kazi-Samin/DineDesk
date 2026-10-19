import RoleGuard from "@/components/auth/RoleGuard";

export const metadata = {
  title: "Operations & Restaurant Management — DineDesk",
  description: "Manage restaurant reservations, guest seatings, live orders, floor plan, and daily operations for The Maple & Vine.",
};

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRoles={["VENDOR"]}>{children}</RoleGuard>;
}
