"use client";

import { useState } from "react";
import { PlatformAdminRole, PlatformAdminUser } from "@/types/admin";

interface PromoteAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAdmin: (newAdmin: Omit<PlatformAdminUser, "id">) => void;
  existingEmails: string[];
}

export default function PromoteAdminModal({
  isOpen,
  onClose,
  onAddAdmin,
  existingEmails,
}: PromoteAdminModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<PlatformAdminRole>("Operations Admin");
  const [territory, setTerritory] = useState("");
  const [subScope, setSubScope] = useState("");
  const [phone, setPhone] = useState("");
  const [twoFactorType, setTwoFactorType] = useState<"hardware" | "app">("app");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!name.trim()) {
      setErrorMessage("Please enter the administrator's full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid corporate email address.");
      return;
    }
    if (existingEmails.some((e) => e.toLowerCase() === email.trim().toLowerCase())) {
      setErrorMessage("An administrator account with this email address already exists.");
      return;
    }
    if (!territory.trim()) {
      setErrorMessage("Please specify the assigned operational territory or module.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const generatedUid = `DD-${role.slice(0, 2).toUpperCase()}-${Math.floor(
        100 + Math.random() * 900
      )}`;

      const newAdminRecord: Omit<PlatformAdminUser, "id"> = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        uid: generatedUid,
        role,
        territory: territory.trim(),
        subScope: subScope.trim() || "Standard delegated governance privileges",
        status: "Active",
        twoFactorStatus: twoFactorType === "hardware" ? "Enforced (YubiKey)" : "2FA Active",
        twoFactorType,
        lastSession: "Active Now",
        isActiveNow: true,
        isRootOwner: false,
        canBeRevoked: true,
        dateAdded: new Date().toISOString().split("T")[0],
        permissions: [
          role === "Super Admin" ? "system:all" : "governance:delegate",
          "audit:read",
        ],
        phone: phone.trim() || "+880 1700-000000",
      };

      onAddAdmin(newAdminRecord);
      setIsSubmitting(false);
      onClose();
    }, 600);
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
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">
              admin_panel_settings
            </span>
            <div>
              <h3 className="font-headline-sm text-lg font-bold text-primary">
                Promote User to Admin
              </h3>
              <p className="text-xs text-on-surface-variant">
                Designate governance credentials & RBAC authority
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* User Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-on-surface">
              Administrator Full Name <span className="text-secondary">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Samiul Alom"
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant text-on-surface focus:outline-primary"
            />
          </div>

          {/* Corporate Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-on-surface">
              Corporate Email (@dinedesk.corp) <span className="text-secondary">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. samiul.ops@dinedesk.corp"
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant text-on-surface focus:outline-primary font-mono text-[11px]"
            />
          </div>

          {/* Role Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-on-surface">
              Target Administrative Role <span className="text-secondary">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as PlatformAdminRole)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant text-on-surface font-semibold focus:outline-primary cursor-pointer"
            >
              <option value="Operations Admin">Operations Admin (Zone Specific)</option>
              <option value="Finance & Treasury Admin">Finance & Treasury Admin</option>
              <option value="Compliance & Audit Admin">Compliance & Audit Admin</option>
              <option value="Customer Support Lead">Customer Support Lead</option>
              <option value="Super Admin">Super Admin (Requires Second Approver)</option>
            </select>
          </div>

          {/* Territory & Scope */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-on-surface">
                Territory Scope <span className="text-secondary">*</span>
              </label>
              <input
                type="text"
                required
                value={territory}
                onChange={(e) => setTerritory(e.target.value)}
                placeholder="e.g. Dhanmondi & Lalmatia Zone"
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant text-on-surface focus:outline-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-on-surface">Sub-Modules / Focus</label>
              <input
                type="text"
                value={subScope}
                onChange={(e) => setSubScope(e.target.value)}
                placeholder="e.g. Table inventory & courier staging"
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant text-on-surface focus:outline-primary"
              />
            </div>
          </div>

          {/* 2FA Token Policy */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-on-surface">Required 2FA Hardware / App Method</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-outline-variant bg-surface-container-low cursor-pointer">
                <input
                  type="radio"
                  name="twoFactorType"
                  checked={twoFactorType === "app"}
                  onChange={() => setTwoFactorType("app")}
                  className="accent-primary"
                />
                <div>
                  <span className="font-semibold block text-on-surface">Authenticator App</span>
                  <span className="text-[10px] text-on-surface-variant block">TOTP (Google/Authy)</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-outline-variant bg-surface-container-low cursor-pointer">
                <input
                  type="radio"
                  name="twoFactorType"
                  checked={twoFactorType === "hardware"}
                  onChange={() => setTwoFactorType("hardware")}
                  className="accent-primary"
                />
                <div>
                  <span className="font-semibold block text-on-surface">Hardware Token</span>
                  <span className="text-[10px] text-on-surface-variant block">YubiKey / FIDO2</span>
                </div>
              </label>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-surface-container text-[11px] text-on-surface-variant flex items-start gap-2 border border-outline-variant/60">
            <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5 shrink-0">
              info
            </span>
            <span>
              Granting elevated administrative roles will immediately dispatch a secure enrollment
              invitation to configure security credentials. This promotion will be cryptographically
              signed in audit record #DD-AL-904.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/60">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-primary-container text-on-primary font-bold shadow-2xs hover:opacity-95 transition-opacity flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                  <span>Delegating Privileges...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">how_to_reg</span>
                  <span>Confirm & Delegate Privileges</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
