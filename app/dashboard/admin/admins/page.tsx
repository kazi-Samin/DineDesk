"use client";

import { useState, useMemo } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminMetricsRibbon from "@/components/admin/admins/AdminMetricsRibbon";
import AdminFilterBar from "@/components/admin/admins/AdminFilterBar";
import AdminDirectoryTable from "@/components/admin/admins/AdminDirectoryTable";
import PromoteAdminModal from "@/components/admin/admins/PromoteAdminModal";
import AccessMatrixModal from "@/components/admin/admins/AccessMatrixModal";
import GovernancePolicyNotice from "@/components/admin/admins/GovernancePolicyNotice";
import {
  ManagePrivilegesModal,
  ConfirmRemoveModal,
  AdminDetailModal,
} from "@/components/admin/admins/AdminActionModals";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { PlatformAdminUser } from "@/types/admin";
import {
  getPlatformAdmins,
  getAdminGovernanceMetrics,
  downloadAdminCsv,
} from "@/services/mockAdminService";

export default function AdminAdminsPage() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_admin_sidebar");

  // State for administrators list
  const [adminsList, setAdminsList] = useState<PlatformAdminUser[]>(() => getPlatformAdmins());
  const metrics = getAdminGovernanceMetrics();

  // Filters & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modals state
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [isAccessMatrixOpen, setIsAccessMatrixOpen] = useState(false);
  const [privilegeAdmin, setPrivilegeAdmin] = useState<PlatformAdminUser | null>(null);
  const [removeTargetAdmin, setRemoveTargetAdmin] = useState<PlatformAdminUser | null>(null);
  const [detailAdmin, setDetailAdmin] = useState<PlatformAdminUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filtered dataset
  const filteredAdmins = useMemo(() => {
    return adminsList.filter((admin) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        admin.name.toLowerCase().includes(q) ||
        admin.email.toLowerCase().includes(q) ||
        admin.uid.toLowerCase().includes(q) ||
        admin.territory.toLowerCase().includes(q);

      const matchesRole = selectedRole === "All" || admin.role === selectedRole;
      const matchesStatus = selectedStatus === "All" || admin.status === selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [adminsList, searchQuery, selectedRole, selectedStatus]);

  // Paginated dataset
  const totalPages = Math.max(1, Math.ceil(filteredAdmins.length / pageSize));
  const paginatedAdmins = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAdmins.slice(startIndex, startIndex + pageSize);
  }, [filteredAdmins, currentPage, pageSize]);

  // Handle Add / Promote Admin
  const handleAddAdmin = (newAdminData: Omit<PlatformAdminUser, "id">) => {
    const newAdmin: PlatformAdminUser = {
      ...newAdminData,
      id: `adm-${Date.now()}`,
    };
    setAdminsList((prev) => [newAdmin, ...prev]);
    showToast(`Successfully designated ${newAdmin.name} as ${newAdmin.role}.`);
  };

  // Handle Save Privileges Update
  const handleSavePrivileges = (updated: PlatformAdminUser) => {
    setAdminsList((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    showToast(`Updated administrative privileges for ${updated.name}.`);
  };

  // Handle Quick Promote to Super Admin
  const handlePromoteAdmin = (admin: PlatformAdminUser) => {
    if (admin.role === "Super Admin") return;
    setAdminsList((prev) =>
      prev.map((a) =>
        a.id === admin.id
          ? {
              ...a,
              role: "Super Admin",
              permissions: [...a.permissions, "system:all", "rbac:manage"],
            }
          : a
      )
    );
    showToast(`Elevated ${admin.name} to Super Admin status.`);
  };

  // Handle Demote Admin
  const handleDemoteAdmin = (admin: PlatformAdminUser) => {
    if (admin.isRootOwner) {
      showToast("Primary Tenant Owner root account cannot be demoted.");
      return;
    }
    setAdminsList((prev) =>
      prev.map((a) =>
        a.id === admin.id
          ? {
              ...a,
              role: "Operations Admin",
              permissions: a.permissions.filter((p) => p !== "system:all"),
            }
          : a
      )
    );
    showToast(`Demoted ${admin.name} to Operations Admin.`);
  };

  // Handle Suspend / Activate Toggle
  const handleToggleStatus = (admin: PlatformAdminUser) => {
    if (admin.isRootOwner) {
      showToast("Cannot suspend root tenant owner.");
      return;
    }
    const newStatus = admin.status === "Active" ? "Suspended" : "Active";
    setAdminsList((prev) =>
      prev.map((a) =>
        a.id === admin.id
          ? {
              ...a,
              status: newStatus,
              isActiveNow: newStatus === "Active" ? a.isActiveNow : false,
            }
          : a
      )
    );
    showToast(
      newStatus === "Suspended"
        ? `Suspended administrative credentials for ${admin.name}.`
        : `Restored active credentials for ${admin.name}.`
    );
  };

  // Handle Remove Admin
  const handleConfirmRemove = () => {
    if (!removeTargetAdmin) return;
    if (removeTargetAdmin.isRootOwner) {
      showToast("Root administrator cannot be deleted.");
      return;
    }
    setAdminsList((prev) => prev.filter((a) => a.id !== removeTargetAdmin.id));
    showToast(`Revoked administrator access for ${removeTargetAdmin.name}.`);
    setRemoveTargetAdmin(null);
  };

  // Handle Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedRole("All");
    setSelectedStatus("All");
    setCurrentPage(1);
    showToast("Cleared search & role filters.");
  };

  // Handle CSV Export
  const handleExportCsv = () => {
    const headers = [
      "Administrator UID",
      "Full Name",
      "Email",
      "Role",
      "Assigned Scope",
      "Status",
      "2FA Method",
      "Last Active Session",
      "Date Appointed",
    ];
    const rows = filteredAdmins.map((a) => [
      a.uid,
      a.name,
      a.email,
      a.role,
      `${a.territory} (${a.subScope})`,
      a.status,
      a.twoFactorStatus,
      a.lastSession,
      a.dateAdded,
    ]);

    downloadAdminCsv("dinedesk-administrators-audit.csv", [headers, ...rows]);
    showToast("Exported administrator audit ledger as CSV.");
  };

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md antialiased flex flex-col">
      {/* 1. Admin Shared Navigation Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
      />

      {/* 2. Admin Top Header */}
      <AdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* 3. Main Workspace */}
      <div
        className={`flex-1 flex flex-col pt-16 transition-all duration-300 ${
          isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"
        }`}
      >
        <main className="relative flex-1 bg-background">
          <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-outline-variant/50">
              <div className="flex flex-col gap-1.5 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-secondary">
                    Governance &amp; RBAC Layer
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
                    The Maple &amp; Vine Operations Node
                  </span>
                </div>
                <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                  Super Admin: Manage Admins &amp; Staff Roles
                </h1>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                  Configure access controls, designate system administrators, and manage managerial permissions across restaurant operations.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAccessMatrixOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs border border-outline-variant shadow-2xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    verified_user
                  </span>
                  <span>Access Matrix</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPromoteModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-bold text-xs shadow-2xs hover:opacity-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  <span>+ Promote User to Admin</span>
                </button>
              </div>
            </div>

            {/* Governance Metrics Ribbon (4 Cards) */}
            <AdminMetricsRibbon metrics={metrics} />

            {/* Filter Bar with Search, Role, Status, and Export */}
            <AdminFilterBar
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setCurrentPage(1);
              }}
              selectedRole={selectedRole}
              onRoleChange={(r) => {
                setSelectedRole(r);
                setCurrentPage(1);
              }}
              selectedStatus={selectedStatus}
              onStatusChange={(s) => {
                setSelectedStatus(s);
                setCurrentPage(1);
              }}
              filteredCount={filteredAdmins.length}
              totalCount={adminsList.length}
              onExportCsv={handleExportCsv}
              onResetFilters={handleResetFilters}
            />

            {/* Admins Data Table */}
            <AdminDirectoryTable
              admins={paginatedAdmins}
              onManagePrivileges={(admin) => setPrivilegeAdmin(admin)}
              onPromoteAdmin={handlePromoteAdmin}
              onDemoteAdmin={handleDemoteAdmin}
              onToggleStatus={handleToggleStatus}
              onRemoveAdmin={(admin) => setRemoveTargetAdmin(admin)}
              onViewDetails={(admin) => setDetailAdmin(admin)}
              currentPage={currentPage}
              totalPages={totalPages}
              totalFiltered={filteredAdmins.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onResetFilters={handleResetFilters}
            />

            {/* Security Policy Notice Container */}
            <GovernancePolicyNotice />
          </div>
        </main>
      </div>

      {/* Modals & Dialogs */}
      <PromoteAdminModal
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        onAddAdmin={handleAddAdmin}
        existingEmails={adminsList.map((a) => a.email)}
      />

      <AccessMatrixModal
        isOpen={isAccessMatrixOpen}
        onClose={() => setIsAccessMatrixOpen(false)}
      />

      <ManagePrivilegesModal
        admin={privilegeAdmin}
        isOpen={Boolean(privilegeAdmin)}
        onClose={() => setPrivilegeAdmin(null)}
        onSave={handleSavePrivileges}
      />

      <ConfirmRemoveModal
        admin={removeTargetAdmin}
        isOpen={Boolean(removeTargetAdmin)}
        onClose={() => setRemoveTargetAdmin(null)}
        onConfirm={handleConfirmRemove}
      />

      <AdminDetailModal
        admin={detailAdmin}
        isOpen={Boolean(detailAdmin)}
        onClose={() => setDetailAdmin(null)}
      />

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-lg border border-outline-variant/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
