"use client";

import Link from "next/link";

export default function DispatchHelpCard() {
  return (
    <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/40 space-y-space-xs shadow-xs">
      <div className="flex items-center gap-2 text-secondary font-label-md font-semibold">
        <span className="material-symbols-outlined text-lg">support_agent</span>
        <span>Need Profile Verification?</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Changes to your trade registry or primary bank clearance address require 2-hour DineDesk partner desk review.
      </p>
      <Link
        className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold hover:underline cursor-pointer"
        href="#contact-support"
        onClick={(e) => {
          e.preventDefault();
          alert("Account Specialist hotline: +880 1800-DINEDESK (Mon-Fri 9AM-8PM)");
        }}
      >
        <span>Contact Account Specialist</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
      </Link>
    </div>
  );
}
