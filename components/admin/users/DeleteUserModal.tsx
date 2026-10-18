"use client";

import React, { useState } from "react";
import { AdminUser } from "@/types/adminUser";
import { AlertTriangle, Trash2, CheckCircle2, X } from "lucide-react";

interface DeleteUserModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (userId: string, notifyUser: boolean) => void;
}

export default function DeleteUserModal({
  user,
  isOpen,
  onClose,
  onConfirmDelete,
}: DeleteUserModalProps) {
  const [notifyUser, setNotifyUser] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);

  if (!isOpen || !user) return null;

  const handleConfirm = () => {
    setIsDeleted(true);
    onConfirmDelete(user.id, notifyUser);
  };

  const handleFinalClose = () => {
    setIsDeleted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={handleFinalClose}
          className="absolute right-4 top-4 text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!isDeleted ? (
          <div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-700 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-headline-md text-xl font-bold text-on-surface">
              Delete User Account?
            </h3>

            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
              You are about to permanently remove{" "}
              <strong className="text-on-surface">{user.name}</strong> ({user.email}) from the platform directory. This action revokes access immediately and cannot be undone.
            </p>

            <div className="mt-4 p-3 bg-surface-container-low rounded-xl border border-outline-variant/50">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyUser}
                  onChange={(e) => setNotifyUser(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-primary border-outline-variant cursor-pointer"
                />
                <span className="text-xs text-on-surface font-medium select-none">
                  Send security notification email to user
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleFinalClose}
                className="px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-rose-700 hover:bg-rose-800 text-white transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                Confirm Deletion
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-headline-md text-xl font-bold text-on-surface">
              Record Removed
            </h3>
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1.5 max-w-xs mx-auto">
              The account for <strong className="text-on-surface">{user.name}</strong> has been purged from active directories.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleFinalClose}
                className="px-6 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-primary-container text-on-primary hover:opacity-95 transition-all shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
