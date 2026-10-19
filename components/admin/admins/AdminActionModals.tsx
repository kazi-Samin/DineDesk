"use client";

import { useState } from "react";
import Image from "next/image";
import { PlatformAdminRole, PlatformAdminUser } from "@/types/admin";

// ============================================================================
// 1. MANAGE PRIVILEGES & EDIT ROLE MODAL
// ============================================================================

interface ManagePrivilegesModalProps {
  admin: PlatformAdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedAdmin: PlatformAdminUser) => void;
}

export function ManagePrivilegesModal({
  admin,
  isOpen,
  onClose,
  onSave,
}: ManagePrivilegesModalProps) {
  if (!isOpen || !admin) return null;

  const [role, setRole] = useState<PlatformAdminRole>(admin.role);
  const [territory, setTerritory] = useState(admin.territory);
  const [subScope, setSubScope] = useState(admin.subScope);
  const [phone, setPhone] = useState(admin.phone || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...admin,
      role,
      territory,
      subScope,
      phone,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-xl border border-outline-variant flex flex-col gap-5 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
          <div>
            <h3 className="font-headline-sm text-lg font-bold text-primary">
              Manage Privileges & Scope
            </h3>
            <p className="text-xs text-on-surface-variant">
              Updating authority for <span className="font-bold text-on-surface">{admin.name}</span> ({admin.uid})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {admin.isRootOwner && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">verified</span>
            <span>
              This is the Primary Tenant Root Super Admin account. Root authority is immutable to prevent accidental self-lockout.
            </span>
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-on-surface">Administrative Role</label>
            <select
              value={role}
              disabled={admin.isRootOwner}
              onChange={(e) => setRole(e.target.value as PlatformAdminRole)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant text-on-surface font-semibold focus:outline-primary disabled:opacity-60 cursor-pointer"
            >
              <option value="Super Admin">Super Admin (Proprietor)</option>
              <option value="General Manager">General Manager (Restaurant Operations)</option>
              <option value="Dining Room Lead">Dining Room Lead (Host Stand &amp; Seating)</option>
              <option value="Head Cashier &amp; Finance">Head Cashier &amp; Finance</option>
              <option value="Operations Admin">Operations Admin</option>
              <option value="Compliance &amp; Audit Admin">Compliance &amp; Audit Admin</option>
              <option value="Customer Support Lead">Customer Support Lead</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-on-surface">Assigned Territory Scope</label>
            <input
              type="text"
              required
              value={territory}
              onChange={(e) => setTerritory(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant text-on-surface focus:outline-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-on-surface">Sub-Modules & Responsibilities</label>
            <input
              type="text"
              required
              value={subScope}
              onChange={(e) => setSubScope(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant text-on-surface focus:outline-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-on-surface">Emergency Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant text-on-surface focus:outline-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary-container text-on-primary font-bold shadow-2xs hover:opacity-95 transition-opacity cursor-pointer"
            >
              Save Privilege Updates
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 2. CONFIRM REMOVE ADMINISTRATOR MODAL
// ============================================================================

interface ConfirmRemoveModalProps {
  admin: PlatformAdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmRemoveModal({
  admin,
  isOpen,
  onClose,
  onConfirm,
}: ConfirmRemoveModalProps) {
  if (!isOpen || !admin) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-xl border border-outline-variant flex flex-col gap-5 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">person_remove</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-lg font-bold text-primary">
              Remove Administrator
            </h3>
            <p className="text-xs text-on-surface-variant">
              Revoking administrative credentials
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 text-xs text-on-surface space-y-2">
          <p>
            Are you sure you want to revoke administrative access for{" "}
            <span className="font-bold text-primary">{admin.name}</span> ({admin.email})?
          </p>
          <p className="text-on-surface-variant text-[11px]">
            • All active login sessions will be terminated immediately.
            <br />
            • API tokens and biometric passkeys will be deleted.
            <br />
            • This action will be recorded in immutable audit logs.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-rose-700 text-white text-xs font-bold shadow-2xs hover:bg-rose-800 transition-colors cursor-pointer"
          >
            Confirm & Revoke
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. ADMIN PROFILE DETAIL MODAL
// ============================================================================

interface AdminDetailModalProps {
  admin: PlatformAdminUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminDetailModal({ admin, isOpen, onClose }: AdminDetailModalProps) {
  if (!isOpen || !admin) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-xl border border-outline-variant flex flex-col gap-5 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-surface-container shrink-0 border border-outline-variant">
              {admin.avatarUrl ? (
                <Image src={admin.avatarUrl} alt={admin.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-on-primary font-bold text-sm">
                  {admin.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-primary">{admin.name}</h3>
              <p className="text-xs text-on-surface-variant font-mono">{admin.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-surface-container-low p-3 rounded-xl">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase block">
              Administrative UID
            </span>
            <span className="font-mono font-bold text-primary mt-0.5 block">{admin.uid}</span>
          </div>

          <div className="bg-surface-container-low p-3 rounded-xl">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase block">
              Designated Role
            </span>
            <span className="font-bold text-primary mt-0.5 block">{admin.role}</span>
          </div>

          <div className="bg-surface-container-low p-3 rounded-xl">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase block">
              2FA Authentication
            </span>
            <span className="font-semibold text-on-surface mt-0.5 block">
              {admin.twoFactorStatus} ({admin.twoFactorType})
            </span>
          </div>

          <div className="bg-surface-container-low p-3 rounded-xl">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase block">
              Account Status
            </span>
            <span className="font-bold text-emerald-700 mt-0.5 block">{admin.status}</span>
          </div>
        </div>

        <div className="p-3 bg-surface-container-low rounded-xl text-xs space-y-1">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase block">
            Territory & Scope
          </span>
          <p className="font-semibold text-on-surface">{admin.territory}</p>
          <p className="text-on-surface-variant text-[11px]">{admin.subScope}</p>
        </div>

        <div className="p-3 bg-surface-container-low rounded-xl text-xs">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">
            Active Delegated Permissions ({admin.permissions.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {admin.permissions.map((perm) => (
              <span
                key={perm}
                className="px-2 py-0.5 rounded-md bg-surface-container-highest text-on-surface text-[10px] font-mono font-semibold"
              >
                {perm}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-outline-variant/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-primary-container text-on-primary text-xs font-semibold hover:opacity-95 cursor-pointer shadow-2xs"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
}
