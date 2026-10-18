"use client";

interface SettingsBottomBarProps {
  lastModifiedBy: string;
  lastModifiedAt: string;
  isDirty: boolean;
  isSaving: boolean;
  onDiscard: () => void;
  onSave: () => void;
}

export default function SettingsBottomBar({
  lastModifiedBy,
  lastModifiedAt,
  isDirty,
  isSaving,
  onDiscard,
  onSave,
}: SettingsBottomBarProps) {
  return (
    <div className="sticky bottom-4 z-30 w-full mt-6">
      <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Audit Metadata */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0 border border-outline-variant/60">
            <span className="material-symbols-outlined text-[18px]">history</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">
                Audit Metadata:
              </span>
              {isDirty && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Unsaved Changes
                </span>
              )}
            </div>
            <span className="text-on-surface">
              Last modified by <strong className="font-bold text-primary">{lastModifiedBy}</strong>{" "}
              on {lastModifiedAt}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            disabled={!isDirty || isSaving}
            onClick={onDiscard}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold border border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Discard Changes
          </button>

          <button
            type="button"
            disabled={!isDirty || isSaving}
            onClick={onSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-container text-on-primary text-xs font-bold shadow-2xs hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                <span>Updating Nodes...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
