import type { Metadata } from "next";
import RoleGuard from "@/components/auth/RoleGuard";
import VendorLayoutClient from "@/components/vendor/VendorLayoutClient";

export const metadata: Metadata = {
  title: "Operations & Restaurant Management — DineDesk",
  description:
    "Manage restaurant reservations, guest seatings, live orders, floor plan, and daily operations for DineDesk partner kitchens.",
};

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["VENDOR"]}>
      <VendorLayoutClient>{children}</VendorLayoutClient>
    </RoleGuard>
  );
}