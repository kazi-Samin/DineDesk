// app/dashboard/admin/users/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import UserSummaryCards from "@/components/admin/users/UserSummaryCards";
import UserFiltersBar, { RoleFilterTab } from "@/components/admin/users/UserFiltersBar";
import UserTable from "@/components/admin/users/UserTable";
import DeleteUserModal from "@/components/admin/users/DeleteUserModal";
import ChangeRoleModal from "@/components/admin/users/ChangeRoleModal";
import AddUserModal from "@/components/admin/users/AddUserModal";
import {
  AdminUser,
  UserRole,
  NewUserInput,
} from "@/types/adminUser";
import {
  INITIAL_ADMIN_USERS,
  getUserSummaryStats,
  exportUsersToCsv,
  formatRoleLabel,
} from "@/services/mockAdminUserService";
import { Download, UserPlus, CheckCircle2, X } from "lucide-react";

export default function AdminUsersPage() {
  // Users state initialized with realistic mock directory
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);

  // Filters & Search state
  const [activeTab, setActiveTab] = useState<RoleFilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Modals state
  const [deleteModalUser, setDeleteModalUser] = useState<AdminUser | null>(null);
  const [changeRoleUser, setChangeRoleUser] = useState<AdminUser | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Compute live summary stats
  const summaryStats = useMemo(() => {
    return getUserSummaryStats(users);
  }, [users]);

  // Compute tab counts
  const tabCounts = useMemo(() => {
    return {
      all: users.length,
      diner: users.filter((u) => u.role === "diner").length,
      restaurant_owner: users.filter((u) => u.role === "restaurant_owner").length,
      admin_staff: users.filter((u) => u.role === "admin" || u.role === "support_admin").length,
    };
  }, [users]);

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Role Tab filter
      if (activeTab === "diner" && user.role !== "diner") return false;
      if (activeTab === "restaurant_owner" && user.role !== "restaurant_owner") return false;
      if (
        activeTab === "admin_staff" &&
        user.role !== "admin" &&
        user.role !== "support_admin"
      )
        return false;

      // Account Status filter
      if (statusFilter !== "all" && user.accountStatus !== statusFilter) return false;

      // Search Query filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = user.name.toLowerCase().includes(query);
        const matchesEmail = user.email.toLowerCase().includes(query);
        const matchesPhone = user.phone.toLowerCase().includes(query);
        const matchesId = user.id.toLowerCase().includes(query);
        const matchesLocation = user.location.toLowerCase().includes(query);
        const matchesTag = user.tag?.toLowerCase().includes(query);

        if (
          !matchesName &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesId &&
          !matchesLocation &&
          !matchesTag
        ) {
          return false;
        }
      }

      return true;
    });
  }, [users, activeTab, statusFilter, searchQuery]);

  // Reset page to 1 when filters change
  const handleTabChange = (tab: RoleFilterTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setActiveTab("all");
    setSearchQuery("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // User Actions
  const handleExportCsv = () => {
    exportUsersToCsv("dinedesk_users_export.csv", filteredUsers);
    showToast(`Exported ${filteredUsers.length} records to CSV.`);
  };

  const handleDeleteUser = (userId: string, notifyUser: boolean) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast(
      `User account deleted.${notifyUser ? " Notification email dispatched." : ""}`
    );
  };

  const handleSaveRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            role: newRole,
            roleLabel: formatRoleLabel(newRole),
          };
        }
        return u;
      })
    );
    showToast(`Updated user role to ${formatRoleLabel(newRole)}.`);
  };

  const handleAddUser = (input: NewUserInput) => {
    const initials = input.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const newUser: AdminUser = {
      id: `USR-${Math.floor(1090 + Math.random() * 900)}`,
      name: input.name,
      email: input.email,
      phone: input.phone || "(313) 555-0100",
      role: input.role,
      roleLabel: formatRoleLabel(input.role),
      location: input.location || "Detroit, MI",
      joinedDate: "Just now",
      lastActive: "Active now",
      isOnline: true,
      accountStatus: input.accountStatus,
      initials: initials || "UN",
      ordersCount: 0,
      loyaltyPoints: input.role === "diner" ? 100 : undefined,
    };

    setUsers((prev) => [newUser, ...prev]);
    showToast(`New user ${input.name} has been created successfully.`);
  };

  return (
    <div className="w-full flex-1 bg-[#FBFBFA] text-[#1b3b2b] font-body-md antialiased">
      <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#1b3b2b]/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Platform Directory
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2B774]" />
              <span className="text-[11px] text-neutral-500 font-medium">
                Identity &amp; RBAC Index
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1b3b2b] tracking-tight">
              User Management
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Administrative directory of registered diners, venue operators, and platform personnel.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-[#1b3b2b]/15 bg-white hover:bg-neutral-50 text-[#1b3b2b] shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-neutral-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#1b3b2b] text-white hover:bg-[#152e22] shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#E2B774]" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <UserSummaryCards stats={summaryStats} />

        {/* Filters Bar: Role Tabs, Search, and Status Dropdown */}
        <UserFiltersBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onResetFilters={handleResetFilters}
          tabCounts={tabCounts}
        />

        {/* User Directory Table */}
        <UserTable
          users={filteredUsers}
          totalRecords={filteredUsers.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
          onChangeRoleClick={(user) => setChangeRoleUser(user)}
          onDeleteClick={(user) => setDeleteModalUser(user)}
          onClearFilters={handleResetFilters}
        />
      </div>

      {/* Delete User Modal */}
      <DeleteUserModal
        user={deleteModalUser}
        isOpen={deleteModalUser !== null}
        onClose={() => setDeleteModalUser(null)}
        onConfirmDelete={handleDeleteUser}
      />

      {/* Change Role Modal */}
      <ChangeRoleModal
        user={changeRoleUser}
        isOpen={changeRoleUser !== null}
        onClose={() => setChangeRoleUser(null)}
        onSaveRole={handleSaveRole}
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onAddUser={handleAddUser}
      />

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#1b3b2b] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#E2B774]/30 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#E2B774] shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/70 hover:text-white ml-2 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}