import RoleGuard from "@/components/auth/RoleGuard";
import { AvatarProvider } from "@/context/AvatarContext";


export const metadata = {
  title: "Customer Dashboard — DineDesk",
  description: "Manage your personal dining reservations, orders, addresses, and loyalty rewards.",
};

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["USER"]}>
      <AvatarProvider>{children}</AvatarProvider>
    </RoleGuard>
  );
}