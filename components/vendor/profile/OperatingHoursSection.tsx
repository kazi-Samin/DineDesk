"use client";

import { OperatingDay } from "@/types/profile";

interface OperatingHoursSectionProps {
  operatingHours: OperatingDay[];
  holidayTimingEnabled: boolean;
  holidayScheduleNotice: string;
  onToggleHolidayTiming: () => void;
  onHolidayNoticeChange: (val: string) => void;
  onToggleDayStatus: (day: string) => void;
  onTimeChange: (day: string, field: "openingTime" | "closingTime", val: string) => void;
  onServiceTypeChange: (day: string, val: string) => void;
  onOpenBulkHoursModal: () => void;
}

export default function OperatingHoursSection({
  operatingHours,
  holidayTimingEnabled,
  holidayScheduleNotice,
  onToggleHolidayTiming,
  onHolidayNoticeChange,
  onToggleDayStatus,
  onTimeChange,
  onServiceTypeChange,
  onOpenBulkHoursModal,
}: OperatingHoursSectionProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#1b3b2b]/10 shadow-xs space-y-6">
      {/* Polished Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1b3b2b]/5 text-[#1b3b2b] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">schedule</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1b3b2b]">Operating Schedule &amp; Shifts</h2>
            <p className="text-xs text-neutral-400 font-medium">
              Configure daily business hours, delivery cut-offs, and holiday notices.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenBulkHoursModal}
          className="px-3.5 py-1.5 rounded-xl border border-[#1b3b2b]/20 hover:border-[#1b3b2b] text-[#1b3b2b] text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">edit_calendar</span>
          <span>Bulk Apply</span>
        </button>
      </div>

      {/* Weekly Days Schedule Table */}
      <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden bg-neutral-50/50">
        {operatingHours.map((schedule) => (
          <div
            key={schedule.day}
            className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
          >
            <div className="flex items-center gap-3 min-w-[140px]">
              <button
                type="button"
                onClick={() => onToggleDayStatus(schedule.day)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${schedule.isOpen ? "bg-[#1b3b2b]" : "bg-neutral-200"
                  }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${schedule.isOpen ? "translate-x-5" : "translate-x-0"
                    }`}
                />
              </button>
              <span className={`text-xs font-bold ${schedule.isOpen ? "text-[#1b3b2b]" : "text-neutral-400"}`}>
                {schedule.day}
              </span>
            </div>

            {schedule.isOpen ? (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="time"
                  value={schedule.openingTime}
                  onChange={(e) => onTimeChange(schedule.day, "openingTime", e.target.value)}
                  className="bg-neutral-50 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold text-[#1b3b2b] focus:outline-none"
                />
                <span className="text-xs text-neutral-400 font-bold">to</span>
                <input
                  type="time"
                  value={schedule.closingTime}
                  onChange={(e) => onTimeChange(schedule.day, "closingTime", e.target.value)}
                  className="bg-neutral-50 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold text-[#1b3b2b] focus:outline-none"
                />

                <select
                  value={schedule.serviceType || "All Services"}
                  onChange={(e) => onServiceTypeChange(schedule.day, e.target.value)}
                  className="bg-neutral-50 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-medium text-[#1b3b2b] focus:outline-none cursor-pointer"
                >
                  <option value="All Services">All Services</option>
                  <option value="Dine-In Only">Dine-In Only</option>
                  <option value="Delivery Only">Delivery Only</option>
                </select>
              </div>
            ) : (
              <span className="text-xs text-rose-600 font-semibold italic">Closed All Day</span>
            )}
          </div>
        ))}
      </div>

      {/* Holiday Timing Notice */}
      <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#1b3b2b]">celebration</span>
            <span className="text-xs font-bold text-[#1b3b2b]">Holiday Timing Override</span>
          </div>
          <button
            type="button"
            onClick={onToggleHolidayTiming}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${holidayTimingEnabled ? "bg-[#1b3b2b]" : "bg-neutral-200"
              }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${holidayTimingEnabled ? "translate-x-5" : "translate-x-0"
                }`}
            />
          </button>
        </div>

        {holidayTimingEnabled && (
          <input
            type="text"
            value={holidayScheduleNotice}
            onChange={(e) => onHolidayNoticeChange(e.target.value)}
            placeholder="e.g. Closed on Special Government Holidays"
            className="w-full bg-white px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-[#1b3b2b] focus:outline-none focus:ring-1 focus:ring-[#1b3b2b]"
          />
        )}
      </div>
    </div>
  );
}