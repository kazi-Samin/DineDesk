"use client";

import React from "react";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { UserRole, UserAccountStatus } from "@/types/adminUser";

export type RoleFilterTab = "all" | "diner" | "restaurant_owner" | "admin_staff";

interface UserFiltersBarProps {
  activeTab: RoleFilterTab;
  onTabChange: (tab: RoleFilterTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onResetFilters: () => void;
  tabCounts: {
    all: number;
    diner: number;
    restaurant_owner: number;
    admin_staff: number;
  };
}

export default function UserFiltersBar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onResetFilters,
  tabCounts,
}: UserFiltersBarProps) {
  const tabs: { id: RoleFilterTab; label: string; count: number }[] = [
    { id: "all", label: "All Users", count: tabCounts.all },
    { id: "diner", label: "Patrons", count: tabCounts.diner },
    { id: "restaurant_owner", label: "Floor & Operations", count: tabCounts.restaurant_owner },
    { id: "admin_staff", label: "Executive & Admins", count: tabCounts.admin_staff },
  ];

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || activeTab !== "all";

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-2xs p-4 flex flex-col gap-4">
      {/* Role Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary-container text-on-primary shadow-xs font-semibold"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono ${
                    isActive
                      ? "bg-white/20 text-white font-bold"
                      : "bg-surface-container text-on-surface-variant font-medium"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 text-xs text-secondary hover:underline font-medium transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear all filters
          </button>
        )}
      </div>

      {/* Search and Dropdown Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, email, phone, or location..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-surface-container-low/70 border border-outline-variant/60 rounded-lg text-on-surface placeholder:text-on-surface-variant/60 focus:outline-hidden focus:border-primary focus:bg-surface-container-lowest transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-xs sm:text-sm bg-surface-container-low/70 border border-outline-variant/60 rounded-lg text-on-surface focus:outline-hidden focus:border-primary focus:bg-surface-container-lowest transition-colors appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending Verification</option>
              <option value="suspended">Suspended</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              ▼
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
