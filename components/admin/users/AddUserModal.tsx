"use client";

import React, { useState } from "react";
import { UserRole, UserAccountStatus, NewUserInput } from "@/types/adminUser";
import { UserPlus, X, AlertCircle } from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (input: NewUserInput) => void;
}

export default function AddUserModal({
  isOpen,
  onClose,
  onAddUser,
}: AddUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+880 ");
  const [role, setRole] = useState<UserRole>("diner");
  const [location, setLocation] = useState("Dhaka");
  const [accountStatus, setAccountStatus] = useState<UserAccountStatus>("active");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide the full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    onAddUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role,
      location: location.trim(),
      accountStatus,
    });

    // Reset fields
    setName("");
    setEmail("");
    setPhone("+880 ");
    setRole("diner");
    setLocation("Dhaka");
    setAccountStatus("active");
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

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline-md text-lg font-bold text-on-surface">
              Add New User
            </h3>
            <p className="text-xs text-on-surface-variant">
              Register a patron, venue partner, or team administrator.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Full Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tahmid Rahman"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder:text-on-surface-variant/60 focus:outline-hidden focus:border-primary focus:bg-surface-container-lowest transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Email Address <span className="text-rose-600">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder:text-on-surface-variant/60 focus:outline-hidden focus:border-primary focus:bg-surface-container-lowest transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1711-000000"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder:text-on-surface-variant/60 focus:outline-hidden focus:border-primary focus:bg-surface-container-lowest transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                System Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:outline-hidden focus:border-primary focus:bg-surface-container-lowest transition-colors cursor-pointer"
              >
                <option value="diner">Diner (Patron)</option>
                <option value="restaurant_owner">Restaurant Owner</option>
                <option value="support_admin">Staff / Support</option>
                <option value="admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Account Status
              </label>
              <select
                value={accountStatus}
                onChange={(e) => setAccountStatus(e.target.value as UserAccountStatus)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:outline-hidden focus:border-primary focus:bg-surface-container-lowest transition-colors cursor-pointer"
              >
                <option value="active">Active (Verified)</option>
                <option value="pending">Pending Verification</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Location / Neighborhood
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Banani, Dhaka"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder:text-on-surface-variant/60 focus:outline-hidden focus:border-primary focus:bg-surface-container-lowest transition-colors"
            />
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
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-primary-container text-on-primary hover:opacity-95 transition-all shadow-xs"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
