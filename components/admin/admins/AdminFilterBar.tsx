"use client";

import { PlatformAdminRole } from "@/types/admin";

interface AdminFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedRole: string;
  onRoleChange: (r: string) => void;
  selectedStatus: string;
  onStatusChange: (s: string) => void;
  filteredCount: number;
  totalCount: number;
  onExportCsv: () => void;
  onResetFilters: () => void;
}

export default function AdminFilterBar({
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  filteredCount,
  totalCount,
  onExportCsv,
  onResetFilters,
}: AdminFilterBarProps) {
  const roles: { value: string; label: string }[] = [
    { value: "All", label: "All Roles" },
    { value: "Super Admin", label: "Super Admins" },
    { value: "Operations Admin", label: "Operations Admin" },
    { value: "Finance & Treasury Admin", label: "Finance & Treasury Admin" },
    { value: "Compliance & Audit Admin", label: "Compliance & Audit Admin" },
    { value: "Customer Support Lead", label: "Customer Support Lead" },
  ];

  const statuses = ["All", "Active", "Pending", "Suspended"];

  const hasActiveFilters =
    searchQuery.trim() !== "" || selectedRole !== "All" || selectedStatus !== "All";

  return (
    <div className="bg-surface-container-low p-4 sm:p-5 rounded-xl border border-outline-variant shadow-2xs flex flex-col gap-4">
      {/* Search Input, Role Select, and Export */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search & Role Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search by name, email, or UID */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search administrators by name, email, or UID..."
              className="w-full bg-surface-container-lowest text-on-surface text-xs font-medium pl-9 pr-4 py-2 rounded-xl border border-outline-variant focus:outline-primary placeholder:text-on-surface-variant/70 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-0.5"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Role Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="appearance-none bg-surface-container-lowest text-on-surface text-xs font-semibold pl-3 pr-8 py-2 rounded-xl border border-outline-variant focus:outline-primary cursor-pointer shadow-2xs"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={onExportCsv}
            className="p-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-primary border border-outline-variant transition-colors shadow-2xs cursor-pointer flex items-center justify-center"
            title="Export CSV Audit Snapshot"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
          </button>

          {/* Reset Filters Button if any active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs font-semibold text-secondary hover:underline px-2 py-1"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Counter */}
        <div className="flex items-center gap-2 self-start lg:self-center">
          <span className="font-label-sm text-xs text-on-surface-variant font-medium">
            Viewing <span className="font-bold text-on-surface">{filteredCount}</span> of {totalCount} admins
          </span>
        </div>
      </div>

      {/* Status Pills */}
      <div className="flex items-center gap-1.5 pt-3 border-t border-outline-variant/50 overflow-x-auto pb-0.5">
        <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mr-1">
          Status:
        </span>
        {statuses.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => onStatusChange(st)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedStatus === st
                ? "bg-primary-container text-on-primary shadow-2xs"
                : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border border-outline-variant/60"
            }`}
          >
            {st}
          </button>
        ))}
      </div>
    </div>
  );
}
