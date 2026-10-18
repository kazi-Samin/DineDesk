"use client";

import Image from "next/image";
import { PlatformAdminUser } from "@/types/admin";

interface AdminDirectoryTableProps {
  admins: PlatformAdminUser[];
  onManagePrivileges: (admin: PlatformAdminUser) => void;
  onPromoteAdmin: (admin: PlatformAdminUser) => void;
  onDemoteAdmin: (admin: PlatformAdminUser) => void;
  onToggleStatus: (admin: PlatformAdminUser) => void;
  onRemoveAdmin: (admin: PlatformAdminUser) => void;
  onViewDetails: (admin: PlatformAdminUser) => void;
  currentPage: number;
  totalPages: number;
  totalFiltered: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
}

export default function AdminDirectoryTable({
  admins,
  onManagePrivileges,
  onPromoteAdmin,
  onDemoteAdmin,
  onToggleStatus,
  onRemoveAdmin,
  onViewDetails,
  currentPage,
  totalPages,
  totalFiltered,
  pageSize,
  onPageChange,
  onResetFilters,
}: AdminDirectoryTableProps) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Super Admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-container text-on-primary font-label-sm text-[11px] font-bold tracking-wide">
            <span className="material-symbols-outlined text-[14px]">shield</span>
            <span>Super Admin</span>
          </span>
        );
      case "Operations Admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-[11px] font-medium border border-outline-variant/60">
            <span className="material-symbols-outlined text-[14px] text-secondary">
              table_restaurant
            </span>
            <span>Operations Admin</span>
          </span>
        );
      case "Finance & Treasury Admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-[11px] font-medium border border-outline-variant/60">
            <span className="material-symbols-outlined text-[14px] text-primary">
              account_balance
            </span>
            <span>Finance & Treasury</span>
          </span>
        );
      case "Compliance & Audit Admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-[11px] font-medium border border-outline-variant/60">
            <span className="material-symbols-outlined text-[14px] text-primary">
              policy
            </span>
            <span>Compliance & Audit</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-[11px] font-medium border border-outline-variant/60">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
              support_agent
            </span>
            <span>Customer Support</span>
          </span>
        );
    }
  };

  const get2FaBadge = (status: string, type: string) => {
    if (status.includes("YubiKey") || type === "hardware") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-label-sm font-semibold bg-primary-fixed text-on-primary-fixed border border-primary-fixed-dim">
          <span className="material-symbols-outlined text-[13px]">lock</span>
          <span>{status}</span>
        </span>
      );
    }
    if (status === "Pending Setup") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-label-sm font-medium bg-amber-100 text-amber-900 border border-amber-200">
          <span className="material-symbols-outlined text-[13px]">schedule</span>
          <span>Pending Setup</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-label-sm font-medium bg-surface-container-high text-on-surface border border-outline-variant">
        <span className="material-symbols-outlined text-[13px]">smartphone</span>
        <span>2FA Active</span>
      </span>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalFiltered);

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xs overflow-hidden flex flex-col">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" id="adminsTable">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-[11px] uppercase tracking-wider border-b border-outline-variant/60">
              <th className="py-3.5 px-6 font-semibold" scope="col">
                Administrator Profile
              </th>
              <th className="py-3.5 px-4 font-semibold" scope="col">
                Email
              </th>
              <th className="py-3.5 px-4 font-semibold" scope="col">
                Current Role
              </th>
              <th className="py-3.5 px-4 font-semibold" scope="col">
                Assigned Territory / Modules
              </th>
              <th className="py-3.5 px-4 font-semibold text-center" scope="col">
                2FA Status
              </th>
              <th className="py-3.5 px-4 font-semibold" scope="col">
                Last Session
              </th>
              <th className="py-3.5 px-6 font-semibold text-right" scope="col">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 text-xs text-on-surface">
            {admins.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 px-6 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/60 mb-2">
                      person_search
                    </span>
                    <h4 className="font-headline-sm text-base font-bold text-primary">
                      No Administrators Found
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-1 mb-4">
                      No administrator accounts match your current search criteria or role filters.
                    </p>
                    <button
                      type="button"
                      onClick={onResetFilters}
                      className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-semibold text-primary transition-colors cursor-pointer"
                    >
                      Clear Search & Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr
                  key={admin.id}
                  className="hover:bg-surface-container-low/60 transition-colors group"
                >
                  {/* 1. Profile */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {admin.avatarUrl ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden relative ring-1 ring-outline-variant/60">
                            <Image
                              src={admin.avatarUrl}
                              alt={admin.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-headline-sm text-primary font-bold ring-1 ring-outline-variant/60">
                            {getInitials(admin.name)}
                          </div>
                        )}
                        {admin.isActiveNow ? (
                          <span
                            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-surface-container-lowest"
                            title="Active Now"
                          />
                        ) : admin.status === "Suspended" ? (
                          <span
                            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-surface-container-lowest"
                            title="Suspended"
                          />
                        ) : null}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onViewDetails(admin)}
                            className="font-headline-sm text-[15px] font-bold text-primary group-hover:text-secondary transition-colors text-left cursor-pointer"
                          >
                            {admin.name}
                          </button>
                          {admin.status === "Suspended" && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                              Suspended
                            </span>
                          )}
                          {admin.status === "Pending" && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Invited
                            </span>
                          )}
                        </div>
                        <span className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">
                          {admin.uid} {admin.isRootOwner && "• Primary Tenant Owner"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 2. Email */}
                  <td className="py-4 px-4 font-mono text-[12px] text-on-surface-variant">
                    {admin.email}
                  </td>

                  {/* 3. Role */}
                  <td className="py-4 px-4">{getRoleBadge(admin.role)}</td>

                  {/* 4. Territory & Modules */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col max-w-xs">
                      <span className="font-medium text-on-surface text-xs">
                        {admin.territory}
                      </span>
                      <span className="text-[11px] text-on-surface-variant truncate">
                        {admin.subScope}
                      </span>
                    </div>
                  </td>

                  {/* 5. 2FA Status */}
                  <td className="py-4 px-4 text-center">
                    {get2FaBadge(admin.twoFactorStatus, admin.twoFactorType)}
                  </td>

                  {/* 6. Last Session */}
                  <td className="py-4 px-4">
                    {admin.isActiveNow ? (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                        <span className="font-label-md text-xs font-bold text-primary">
                          Active Now
                        </span>
                      </div>
                    ) : (
                      <span className="text-on-surface-variant text-xs">
                        {admin.lastSession}
                      </span>
                    )}
                  </td>

                  {/* 7. Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {admin.isRootOwner ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onManagePrivileges(admin)}
                            className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Manage Privileges
                          </button>
                          <span
                            className="font-label-sm text-xs text-on-surface-variant/70 italic pr-1 select-none"
                            title="Root administrative account cannot be revoked or deleted"
                          >
                            (Immutable)
                          </span>
                        </>
                      ) : (
                        <>
                          {/* Promote / Demote Action */}
                          {admin.role !== "Super Admin" ? (
                            <button
                              type="button"
                              onClick={() => onPromoteAdmin(admin)}
                              className="px-2.5 py-1.5 rounded-lg text-primary hover:bg-surface-container-high font-label-sm text-xs font-semibold transition-colors cursor-pointer"
                              title="Promote role level"
                            >
                              Promote
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onDemoteAdmin(admin)}
                              className="px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm text-xs font-semibold transition-colors cursor-pointer"
                              title="Demote role level"
                            >
                              Demote
                            </button>
                          )}

                          {/* Manage Privileges */}
                          <button
                            type="button"
                            onClick={() => onManagePrivileges(admin)}
                            className="px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm text-xs font-medium transition-colors cursor-pointer"
                          >
                            Privileges
                          </button>

                          {/* Suspend / Activate Toggle */}
                          <button
                            type="button"
                            onClick={() => onToggleStatus(admin)}
                            className={`px-2.5 py-1.5 rounded-lg font-label-sm text-xs font-medium transition-colors cursor-pointer ${
                              admin.status === "Active"
                                ? "text-amber-700 hover:bg-amber-100"
                                : "text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {admin.status === "Active" ? "Suspend" : "Activate"}
                          </button>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => onRemoveAdmin(admin)}
                            className="px-2.5 py-1.5 rounded-lg text-secondary hover:bg-secondary-fixed/30 font-label-sm text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalFiltered > 0 && (
        <div className="bg-surface-container-low px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-outline-variant/40">
          <span className="font-body-sm text-xs text-on-surface-variant">
            Showing {startRecord} to {endRecord} of {totalFiltered} operational administrators
          </span>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              aria-label="Previous Page"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentPage === p
                    ? "bg-primary-container text-on-primary shadow-2xs font-bold"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              aria-label="Next Page"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
