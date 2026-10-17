"use client";

import { useEffect } from "react";

interface DiscardProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DiscardProfileModal({
  isOpen,
  onClose,
  onConfirm,
}: DiscardProfileModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/40 p-space-lg flex flex-col gap-space-md animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="discard-title"
      >
        <div className="flex items-start gap-space-sm">
          <div className="p-2.5 bg-secondary/10 text-secondary rounded-xl shrink-0">
            <span className="material-symbols-outlined text-2xl">
              history_toggle_off
            </span>
          </div>
          <div className="flex-1">
            <h3
              id="discard-title"
              className="font-headline-sm text-lg font-semibold text-primary"
            >
              Discard Unsaved Edits?
            </h3>
            <p className="font-body-sm text-[13px] text-on-surface-variant mt-1 leading-relaxed">
              You have unsaved changes to your personal details and dietary
              preferences. Discarding will revert to your last saved state.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onClose}
            className="px-space-md py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            Keep Editing
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-space-lg py-2 bg-secondary text-on-primary hover:bg-secondary/90 rounded-lg font-label-md text-label-md font-semibold transition-all shadow-xs"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
}
