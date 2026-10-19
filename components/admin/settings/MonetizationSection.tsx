"use client";

interface MonetizationSectionProps {
  commissionRate: number;
  reservationDepositFee: number;
  enforcePartyRule: boolean;
  payoutSchedule: string;
  commissionError?: string | null;
  depositError?: string | null;
  onCommissionChange: (val: number) => void;
  onDepositFeeChange: (val: number) => void;
  onTogglePartyRule: (val: boolean) => void;
  onPayoutScheduleChange: (val: string) => void;
}

export default function MonetizationSection({
  commissionRate,
  reservationDepositFee,
  enforcePartyRule,
  payoutSchedule,
  commissionError,
  depositError,
  onCommissionChange,
  onDepositFeeChange,
  onTogglePartyRule,
  onPayoutScheduleChange,
}: MonetizationSectionProps) {
  const payoutOptions = [
    "Automated Daily Settlement (T+1 at midnight BDT)",
    "Weekly Bulk Settlement (Every Monday 06:00 BDT)",
    "Bi-weekly Clearing Schedule (1st & 15th of month)",
    "Real-Time Instant Clearance (Direct BEFTN / NPSB API)",
  ];

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant shadow-2xs flex flex-col gap-6">
      {/* Section Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant/60">
            <span className="material-symbols-outlined text-[22px]">payments</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
              Section 01
            </span>
            <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-primary">
              Monetization & Commission Architecture
            </h2>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-surface-container-low border border-outline-variant/60 rounded-lg font-label-sm text-[11px] text-on-surface-variant font-semibold">
          Fiscal Policy v4.2
        </span>
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* 1. Commission Rate */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="commission-rate"
            className="text-xs font-bold text-on-surface flex items-center justify-between"
          >
            <span>Standard Platform Commission Rate</span>
            <span className="text-[11px] text-on-surface-variant font-normal">Gross Order Cut</span>
          </label>
          <div className="relative flex items-center">
            <input
              id="commission-rate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={isNaN(commissionRate) ? "" : commissionRate}
              onChange={(e) => onCommissionChange(parseFloat(e.target.value))}
              className={`w-full bg-surface-container-low text-on-surface font-headline-sm text-base pl-4 pr-10 py-2.5 rounded-xl border outline-none focus:bg-surface-container-lowest transition-all ${
                commissionError
                  ? "border-rose-500 focus:border-rose-600"
                  : "border-outline-variant focus:border-primary"
              }`}
            />
            <span className="absolute right-4 text-xs text-on-surface-variant font-bold select-none pointer-events-none">
              %
            </span>
          </div>
          {commissionError ? (
            <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">error</span>
              <span>{commissionError}</span>
            </p>
          ) : (
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Applied automatically to all verified restaurant food sales and take-away pickups across
              Detroit Metropolitan &amp; suburban zones.
            </p>
          )}
        </div>

        {/* 2. Reservation Deposit Fee & Party Rule */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="deposit-fee"
            className="text-xs font-bold text-on-surface flex items-center justify-between"
          >
            <span>Dine-in Reservation Deposit Fee</span>
            <span className="text-[11px] text-on-surface-variant font-normal">Per Reserved Table</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-sm text-on-surface font-bold select-none pointer-events-none">
              $
            </span>
            <input
              id="deposit-fee"
              type="number"
              step="10"
              min="0"
              value={isNaN(reservationDepositFee) ? "" : reservationDepositFee}
              onChange={(e) => onDepositFeeChange(parseFloat(e.target.value))}
              className={`w-full bg-surface-container-low text-on-surface font-headline-sm text-base pl-9 pr-4 py-2.5 rounded-xl border outline-none focus:bg-surface-container-lowest transition-all ${
                depositError
                  ? "border-rose-500 focus:border-rose-600"
                  : "border-outline-variant focus:border-primary"
              }`}
            />
          </div>
          {depositError && (
            <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">error</span>
              <span>{depositError}</span>
            </p>
          )}

          {/* Enforce Party Rule Toggle */}
          <div className="mt-1 flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface">Enforce Party Rule</span>
              <span className="text-[11px] text-on-surface-variant">Mandatory for parties of 5+</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enforcePartyRule}
                onChange={(e) => onTogglePartyRule(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  enforcePartyRule ? "bg-primary-container" : "bg-surface-container-highest"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-surface-container-lowest shadow-xs transform transition-transform ${
                    enforcePartyRule ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Merchant Payout Schedule */}
      <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/50">
        <label htmlFor="payout-schedule" className="text-xs font-bold text-on-surface">
          Merchant Payout & Settlement Schedule
        </label>
        <div className="relative">
          <select
            id="payout-schedule"
            value={payoutSchedule}
            onChange={(e) => onPayoutScheduleChange(e.target.value)}
            className="w-full bg-surface-container-low text-on-surface text-xs font-medium px-4 py-3 rounded-xl border border-outline-variant outline-none appearance-none cursor-pointer focus:bg-surface-container-lowest transition-all"
          >
            {payoutOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
            expand_more
          </span>
        </div>
        <span className="text-[11px] text-on-surface-variant">
          Funds clear directly to registered merchant commercial bank accounts via Bangladesh Bank RTGS/BEFTN gateway.
        </span>
      </div>
    </section>
  );
}
