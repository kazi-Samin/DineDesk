"use client";

interface ProfileToastProps {
  message: string | null;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export default function ProfileToast({
  message,
  type = "success",
  onClose,
}: ProfileToastProps) {
  if (!message) return null;

  const bgClass =
    type === "error"
      ? "bg-error text-on-error"
      : type === "info"
      ? "bg-primary-container text-on-primary"
      : "bg-primary text-on-primary";

  const iconName =
    type === "error"
      ? "error"
      : type === "info"
      ? "info"
      : "check_circle";

  return (
    <div className="fixed top-20 right-6 z-50 flex items-center gap-space-sm px-space-lg py-3 rounded-xl shadow-lg border border-outline-variant/30 animate-in fade-in slide-in-from-top-4 transition-all max-w-md bg-opacity-95 backdrop-blur-md">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}
      >
        <span className="material-symbols-outlined text-base">
          {iconName}
        </span>
      </div>
      <p className="font-body-sm text-[13px] text-on-surface flex-1 font-medium bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-outline-variant/30">
        {message}
      </p>
      <button
        onClick={onClose}
        className="text-on-surface-variant hover:text-on-surface p-1 rounded-md"
        type="button"
        aria-label="Dismiss toast"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
}
