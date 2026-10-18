"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";

export default function AdminAdminsPage() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_admin_sidebar");

  const admins = [
    { name: "Tahmid Rahman", email: "tahmid.admin@dinedesk.bd", role: "Super Admin", access: "Full Root Authority", status: "Active" },
    { name: "Samin Kazi", email: "samin.kazi@dinedesk.bd", role: "System Architect", access: "Platform Governance & Infra", status: "Active" },
    { name: "Furkan Pinon", email: "pinon.admin@dinedesk.bd", role: "Operations Lead", access: "Merchant Approvals & Dispatch", status: "Active" },
  ];

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md antialiased flex flex-col">
      <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} onToggle={toggleSidebar} />
      <AdminHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

      <div className={`flex-1 flex flex-col pt-16 transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "pl-0"}`}>
        <main className="relative flex-1 bg-background">
          <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
            <div className="pb-2 border-b border-outline-variant/40">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-bold">
                Governance Access Control
              </span>
              <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                Platform Administrators
              </h1>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                Privileged access credentials, audit roles, and system security permissions.
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low font-label-sm text-[11px] uppercase text-on-surface-variant tracking-wider border-b border-outline-variant/50">
                      <th className="py-3 px-5">Administrator</th>
                      <th className="py-3 px-5">Role Authority</th>
                      <th className="py-3 px-5">Access Scope</th>
                      <th className="py-3 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 text-xs">
                    {admins.map((a) => (
                      <tr key={a.email} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3 px-5">
                          <span className="font-bold text-on-surface block">{a.name}</span>
                          <span className="text-[11px] text-on-surface-variant">{a.email}</span>
                        </td>
                        <td className="py-3 px-5 font-semibold text-primary">{a.role}</td>
                        <td className="py-3 px-5 text-on-surface-variant">{a.access}</td>
                        <td className="py-3 px-5 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
