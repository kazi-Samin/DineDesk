"use client";

import { useEffect, useState } from "react";

interface AuthProtocolModalProps {
  isOpen: boolean;
  mode: "password" | "2fa" | null;
  twoFactorPhone: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function AuthProtocolModal({
  isOpen,
  mode,
  twoFactorPhone,
  onClose,
  onSuccess,
}: AuthProtocolModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 2FA state
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [appAuthEnabled, setAppAuthEnabled] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      setPasswordError(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mode) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordError("Please enter your current account password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordError(null);
    onSuccess("Account credentials updated (simulated frontend state).");
    onClose();
  };

  const handleSave2FA = () => {
    onSuccess("Multi-factor authentication preferences updated.");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/40 p-space-lg flex flex-col gap-space-md animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
          <div className="flex items-center gap-space-sm">
            <span className="p-2 bg-secondary/10 text-secondary rounded-lg">
              <span className="material-symbols-outlined text-xl">
                {mode === "password" ? "lock_reset" : "shield"}
              </span>
            </span>
            <div>
              <h3 className="font-headline-sm text-lg font-semibold text-primary">
                {mode === "password"
                  ? "Update Account Password"
                  : "Manage 2FA Devices"}
              </h3>
              <span className="font-label-sm text-[11px] text-secondary font-medium uppercase tracking-wider">
                Security Protocol Prototype
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-md"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Prototype notice badge */}
        <div className="p-space-sm bg-surface-container-low rounded-lg border border-outline-variant/40 flex items-start gap-2">
          <span className="material-symbols-outlined text-secondary text-base shrink-0 mt-0.5">
            info
          </span>
          <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
            <strong>Prototype Simulation:</strong> Real authentication, credential
            updates, and OTP dispatch will be synchronized once backend API services
            are integrated.
          </p>
        </div>

        {mode === "password" ? (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-space-md">
            {passwordError && (
              <div className="p-2.5 bg-error-container text-on-error-container rounded-lg text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  error
                </span>
                <span>{passwordError}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="px-space-md py-2 bg-surface-container-lowest rounded-md border border-outline-variant/60 font-body-sm text-body-sm focus:outline-none focus:border-primary-container"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="px-space-md py-2 bg-surface-container-lowest rounded-md border border-outline-variant/60 font-body-sm text-body-sm focus:outline-none focus:border-primary-container"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="px-space-md py-2 bg-surface-container-lowest rounded-md border border-outline-variant/60 font-body-sm text-body-sm focus:outline-none focus:border-primary-container"
              />
            </div>

            <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-outline-variant/20">
              <button
                type="button"
                onClick={onClose}
                className="px-space-md py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-space-lg py-2 bg-primary-container text-on-primary rounded-lg font-label-md text-label-md font-semibold hover:bg-primary shadow-xs"
              >
                Save New Password
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-space-md">
            {/* SMS 2FA */}
            <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container text-xl">
                  sms
                </span>
                <div>
                  <h4 className="font-label-md text-label-md font-semibold text-primary">
                    SMS Verification
                  </h4>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Registered device: {twoFactorPhone}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsEnabled}
                onChange={(e) => setSmsEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-0"
              />
            </div>

            {/* Authenticator App */}
            <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container text-xl">
                  smartphone
                </span>
                <div>
                  <h4 className="font-label-md text-label-md font-semibold text-primary">
                    Authenticator App (TOTP)
                  </h4>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Google Authenticator, Authy, or 1Password
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={appAuthEnabled}
                onChange={(e) => setAppAuthEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-outline-variant/20">
              <button
                type="button"
                onClick={onClose}
                className="px-space-md py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave2FA}
                className="px-space-lg py-2 bg-primary-container text-on-primary rounded-lg font-label-md text-label-md font-semibold hover:bg-primary shadow-xs"
              >
                Save 2FA Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
