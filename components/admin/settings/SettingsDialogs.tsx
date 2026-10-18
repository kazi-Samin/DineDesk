"use client";

import { FeaturedRestaurantItem } from "@/types/admin";

// ============================================================================
// 1. CONFIRM REMOVE FEATURED RESTAURANT DIALOG
// ============================================================================

interface RemoveFeaturedDialogProps {
  restaurant: FeaturedRestaurantItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RemoveFeaturedDialog({
  restaurant,
  isOpen,
  onClose,
  onConfirm,
}: RemoveFeaturedDialogProps) {
  if (!isOpen || !restaurant) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-xl border border-outline-variant flex flex-col gap-4 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">star_half</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-base font-bold text-primary">
              Remove from Featured Roster?
            </h3>
            <p className="text-xs text-on-surface-variant">Home page curation adjustment</p>
          </div>
        </div>

        <p className="text-xs text-on-surface leading-relaxed">
          Are you sure you want to remove{" "}
          <strong className="text-primary">{restaurant.name}</strong> ({restaurant.area}) from the
          featured restaurants list? It will no longer receive elevated top-of-feed placement.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/60">
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
            className="px-4 py-2 rounded-xl bg-secondary text-white text-xs font-bold shadow-2xs hover:opacity-95 transition-all cursor-pointer"
          >
            Remove Restaurant
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. MAINTENANCE MODE MASTER SWITCH CONFIRMATION DIALOG
// ============================================================================

interface MaintenanceConfirmDialogProps {
  isOpen: boolean;
  isEnabling: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function MaintenanceConfirmDialog({
  isOpen,
  isEnabling,
  onClose,
  onConfirm,
}: MaintenanceConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-xl border border-outline-variant flex flex-col gap-4 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isEnabling ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            <span className="material-symbols-outlined text-2xl">
              {isEnabling ? "emergency" : "power_settings_new"}
            </span>
          </div>
          <div>
            <h3 className="font-headline-sm text-base font-bold text-primary">
              {isEnabling ? "Activate Platform Maintenance Mode?" : "Deactivate Maintenance Mode?"}
            </h3>
            <p className="text-xs text-on-surface-variant">
              {isEnabling ? "Critical Kill Switch Engagement" : "Restoring Live Operations"}
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/60 text-xs text-on-surface space-y-2">
          {isEnabling ? (
            <>
              <p className="font-semibold text-rose-700">
                Warning: This affects all customer web and mobile clients platform-wide.
              </p>
              <ul className="list-disc list-inside text-on-surface-variant text-[11px] space-y-1">
                <li>New food deliveries and table reservations will be suspended.</li>
                <li>Diners visiting the site will receive the public maintenance broadcast.</li>
                <li>Active in-flight kitchen orders will continue to be processed.</li>
              </ul>
            </>
          ) : (
            <p className="text-on-surface-variant">
              Deactivating maintenance mode will immediately open order checkout gateways and table
              reservation services to all diners across the network.
            </p>
          )}
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
            className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-2xs transition-all cursor-pointer ${
              isEnabling ? "bg-rose-700 hover:bg-rose-800" : "bg-primary-container hover:bg-primary"
            }`}
          >
            {isEnabling ? "Confirm & Activate Switch" : "Resume Operations"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. CONFIRM DISCARD CHANGES DIALOG
// ============================================================================

interface DiscardConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DiscardConfirmDialog({ isOpen, onClose, onConfirm }: DiscardConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-xl border border-outline-variant flex flex-col gap-4 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">restart_alt</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-base font-bold text-primary">
              Discard Unsaved Changes?
            </h3>
            <p className="text-xs text-on-surface-variant">Reverting form to last saved baseline</p>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant">
          Any modifications you made to commission rates, featured listings, or maintenance settings
          will be lost.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            Keep Editing
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary text-xs font-bold transition-all cursor-pointer"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
