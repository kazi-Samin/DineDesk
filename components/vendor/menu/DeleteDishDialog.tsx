"use client";

import { MenuItem } from "@/types/menu";

interface DeleteDishDialogProps {
  isOpen: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export default function DeleteDishDialog({
  isOpen,
  item,
  onClose,
  onConfirm,
}: DeleteDishDialogProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <span className="p-2.5 rounded-xl bg-error-container text-error flex-shrink-0">
            <span className="material-symbols-outlined text-xl">delete_forever</span>
          </span>
          <div>
            <h3 className="font-headline-sm text-lg font-bold text-primary">
              Remove Dish from Menu?
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Are you sure you want to permanently remove <strong>&ldquo;{item.name}&rdquo;</strong> from The Maple &amp; Vine menu? This will remove it from all live dining listings.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center gap-3">
          <img
            src={item.image}
            alt={item.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/food-placeholder.svg";
            }}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-on-surface truncate">{item.name}</p>
            <p className="text-[11px] text-on-surface-variant">
              {item.category} • ${item.price}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-low cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(item.id);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-error hover:bg-error/90 text-on-error text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}
