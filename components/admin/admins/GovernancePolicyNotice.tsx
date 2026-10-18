"use client";

export default function GovernancePolicyNotice() {
  return (
    <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant shadow-2xs flex flex-col md:flex-row gap-6 items-start">
      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0 border border-outline-variant/60">
        <span className="material-symbols-outlined text-[28px]">gavel</span>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="font-headline-sm text-base sm:text-lg font-bold text-primary">
            Governance & Security Policy Notice
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary-fixed text-on-secondary-fixed">
            Mandatory Protocol
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1 text-on-surface-variant text-xs">
          {/* Rule 1: Multi-Person Authorization */}
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-primary flex items-center gap-1.5 text-xs">
              <span className="material-symbols-outlined text-[17px] text-primary">groups</span>
              Multi-Person Authorization
            </span>
            <p className="leading-relaxed">
              Financial overrides exceeding ৳50,000, fee restructuring, or restaurant un-listing
              require dual-signoff by at least two distinct Super Administrators.
            </p>
          </div>

          {/* Rule 2: Session Timeout Threshold */}
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-primary flex items-center gap-1.5 text-xs">
              <span className="material-symbols-outlined text-[17px] text-secondary">hourglass_empty</span>
              Session Timeout Threshold
            </span>
            <p className="leading-relaxed">
              All Super Admin and Finance consoles enforce an automatic 15-minute inactivity
              termination. Background re-authentication demands WebAuthn biometric validation.
            </p>
          </div>

          {/* Rule 3: Immutable Audit Logs */}
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-primary flex items-center gap-1.5 text-xs">
              <span className="material-symbols-outlined text-[17px] text-primary">history_toggle_off</span>
              Immutable Audit Logs
            </span>
            <p className="leading-relaxed">
              Privilege transitions, permission grants, and tenant-level mutations are
              cryptographically signed and streamed directly to append-only write-once cold storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
