"use client";

import React, { useState } from "react";
import {
  AdminUser,
  UserRole,
  UserAccountStatus,
} from "@/types/adminUser";
import {
  Shield,
  Trash2,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Clock,
  AlertCircle,
} from "lucide-react";

interface UserTableProps {
  users: AdminUser[];
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onChangeRoleClick: (user: AdminUser) => void;
  onDeleteClick: (user: AdminUser) => void;
  onClearFilters?: () => void;
}

export default function UserTable({
  users,
  totalRecords,
  currentPage,
  pageSize,
  onPageChange,
  onChangeRoleClick,
  onDeleteClick,
  onClearFilters,
}: UserTableProps) {
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentUsers = users.slice(startIndex, startIndex + pageSize);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-primary text-on-primary">
            <Shield className="w-3 h-3" />
            Super Admin
          </span>
        );
      case "support_admin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-surface-container text-primary border border-outline-variant/60">
            <Shield className="w-3 h-3 text-primary/70" />
            Staff / Support
          </span>
        );
      case "restaurant_owner":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#faf0ea] text-secondary border border-secondary/20">
            Restaurant Owner
          </span>
        );
      case "diner":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-surface-container text-on-surface-variant border border-outline-variant/50">
            Diner
          </span>
        );
    }
  };

  const getStatusBadge = (status: UserAccountStatus) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Active
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            Pending
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-rose-800 bg-rose-50 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            Suspended
          </span>
        );
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-2xs overflow-hidden flex flex-col">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-surface-container-low font-label-sm text-[11px] uppercase text-on-surface-variant tracking-wider border-b border-outline-variant/50">
              <th className="py-3 px-4 sm:px-6">User / Profile</th>
              <th className="py-3 px-4 sm:px-6">Contact & Verification</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Joined Date</th>
              <th className="py-3 px-4">Last Active</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 text-xs sm:text-sm">
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-on-surface text-sm">No users found</span>
                    <p className="text-xs text-on-surface-variant text-center">
                      We couldn&apos;t find any users matching your active search filters.
                    </p>
                    {onClearFilters && (
                      <button
                        onClick={onClearFilters}
                        className="mt-2 text-xs text-primary font-medium hover:underline"
                      >
                        Reset search &amp; filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              currentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-surface-container-low/50 transition-colors group"
                >
                  {/* User Profile */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-full bg-surface-container border border-outline-variant/60 flex items-center justify-center overflow-hidden shrink-0">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback on image load error
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="font-semibold text-xs text-primary">
                            {user.initials}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                            {user.name}
                          </span>
                          <span className="text-[10px] font-mono text-on-surface-variant/80 px-1.5 py-0.2 rounded bg-surface-container-low border border-outline-variant/40">
                            {user.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-on-surface-variant truncate mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0 text-on-surface-variant/60" />
                          <span className="truncate">{user.location}</span>
                          {user.tag && (
                            <span className="text-secondary font-medium ml-1">
                              · {user.tag}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-on-surface">
                        <Mail className="w-3.5 h-3.5 text-on-surface-variant/60 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                        <Phone className="w-3.5 h-3.5 text-on-surface-variant/60 shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    {getRoleBadge(user.role)}
                  </td>

                  {/* Joined Date */}
                  <td className="py-3.5 px-4 text-xs text-on-surface-variant whitespace-nowrap">
                    {user.joinedDate}
                  </td>

                  {/* Last Active */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          user.isOnline ? "bg-emerald-500 animate-pulse" : "bg-on-surface-variant/40"
                        }`}
                      />
                      <span className="text-xs text-on-surface-variant">
                        {user.lastActive}
                      </span>
                    </div>
                  </td>

                  {/* Account Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(user.accountStatus)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onChangeRoleClick(user)}
                        title="Change user role"
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border border-outline-variant/60 bg-surface-container-low hover:bg-surface-container hover:border-outline-variant text-on-surface transition-all flex items-center gap-1"
                      >
                        <Shield className="w-3 h-3 text-primary" />
                        <span className="hidden sm:inline">Role</span>
                      </button>
                      <button
                        onClick={() => onDeleteClick(user)}
                        title="Delete user"
                        className="p-1.5 text-xs rounded-lg border border-outline-variant/60 bg-surface-container-low hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-on-surface-variant transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 sm:px-6 py-3.5 bg-surface-container-low/50 border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
        <div>
          Showing{" "}
          <span className="font-semibold text-on-surface">
            {totalRecords === 0 ? 0 : startIndex + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-on-surface">
            {Math.min(startIndex + pageSize, totalRecords)}
          </span>{" "}
          of <span className="font-semibold text-on-surface">{totalRecords}</span> registered records
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-md border border-outline-variant/60 bg-surface-container-lowest text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
                p === currentPage
                  ? "bg-primary-container text-on-primary font-bold shadow-xs"
                  : "bg-surface-container-lowest border border-outline-variant/60 text-on-surface hover:bg-surface-container"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-md border border-outline-variant/60 bg-surface-container-lowest text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
