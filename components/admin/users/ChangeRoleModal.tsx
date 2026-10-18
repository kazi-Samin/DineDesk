"use client";

import React, { useState, useEffect } from "react";
import { AdminUser, UserRole } from "@/types/adminUser";
import { Shield, X, Check } from "lucide-react";

interface ChangeRoleModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveRole: (userId: string, newRole: UserRole) => void;
}

export default function ChangeRoleModal({
  user,
  isOpen,
  onClose,
  onSaveRole,
}: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>("diner");

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const rolesList: { id: UserRole; title: string; desc: string }[] = [
    {
      id: "diner",
      title: "Diner (Patron)",
      desc: "Standard customer account for browsing menus, booking tables, and placing orders.",
    },
    {
      id: "restaurant_owner",
      title: "Restaurant Owner",
      desc: "Can manage restaurants, floor layouts, table reservations, and incoming orders.",
    },
    {
      id: "support_admin",
      title: "Staff / Support Admin",
      desc: "Assists patrons, oversees active orders, and handles support inquiries.",
    },
    {
      id: "admin",
      title: "Super Admin",
      desc: "Highest authority with full access to platform analytics, user directory, and payouts.",
    },
  ];

  const handleSave = () => {
    onSaveRole(user.id, selectedRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline-md text-lg font-bold text-on-surface">
              Modify User Role
            </h3>
            <p className="text-xs text-on-surface-variant">
              Update access level for <strong className="text-on-surface">{user.name}</strong> ({user.id})
            </p>
          </div>
        </div>

        <div className="space-y-2 mt-5">
          {rolesList.map((roleOption) => {
            const isSelected = selectedRole === roleOption.id;
            return (
              <label
                key={roleOption.id}
                onClick={() => setSelectedRole(roleOption.id)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-2xs"
                    : "border-outline-variant/60 bg-surface-container-low/40 hover:bg-surface-container-low hover:border-outline-variant"
                }`}
              >
                <input
                  type="radio"
                  name="userRole"
                  value={roleOption.id}
                  checked={isSelected}
                  onChange={() => setSelectedRole(roleOption.id)}
                  className="mt-1 text-primary focus:ring-primary border-outline-variant cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-on-surface">
                      {roleOption.title}
                    </span>
                    {user.role === roleOption.id && (
                      <span className="text-[10px] font-semibold text-primary px-2 py-0.5 rounded-full bg-surface-container">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                    {roleOption.desc}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-outline-variant/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-primary-container text-on-primary hover:opacity-95 transition-all shadow-xs flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
