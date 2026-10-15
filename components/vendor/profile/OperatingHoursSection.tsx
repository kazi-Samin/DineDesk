"use client";

import { OperatingDay } from "@/types/profile";

interface OperatingHoursSectionProps {
  operatingHours: OperatingDay[];
  holidayTimingEnabled: boolean;
  holidayScheduleNotice: string;
  onToggleHolidayTiming: () => void;
  onHolidayNoticeChange: (val: string) => void;
  onToggleDayStatus: (dayName: string) => void;
  onTimeChange: (dayName: string, field: "openingTime" | "closingTime", val: string) => void;
  onServiceTypeChange: (dayName: string, val: string) => void;
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
    <section className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs space-y-space-lg">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-outline-variant/30 pb-space-sm gap-2">
        <div className="flex items-center gap-space-xs">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary font-label-sm font-bold">
            03
          </span>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Weekly Operating Hours
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Direct kitchen service shifts, table booking slots, and delivery availability.
            </p>
          </div>
        </div>

        {/* Special Holiday Timing Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="font-label-sm text-label-sm text-on-surface font-semibold">
            Special Holiday Timing
          </span>
          <button
            type="button"
            onClick={onToggleHolidayTiming}
            aria-label="Toggle Special Holiday Timing"
            className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
              holidayTimingEnabled ? "bg-primary-container" : "bg-outline-variant/50"
            }`}
          >
            <span
              className={`block w-4 h-4 bg-surface-container-lowest rounded-full transition-transform mt-0.5 shadow-xs ${
                holidayTimingEnabled ? "translate-x-4.5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Holiday schedule banner if active */}
      {holidayTimingEnabled && (
        <div className="p-space-sm rounded-lg bg-surface-container-high border border-primary/20 space-y-1.5 transition-all">
          <div className="flex items-center gap-2 text-primary font-label-sm font-semibold">
            <span className="material-symbols-outlined text-base">celebration</span>
            <span>Holiday &amp; Festive Season Schedule Notice</span>
          </div>
          <input
            type="text"
            value={holidayScheduleNotice}
            onChange={(e) => onHolidayNoticeChange(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface font-body-sm focus:outline-none focus:border-primary"
            placeholder="e.g. Special Eid and Ramadan schedules apply during festive seasons."
          />
        </div>
      )}

      {/* Schedule Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[550px]">
          <thead>
            <tr className="border-b border-outline-variant/30 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              <th className="py-2.5 font-semibold">Day of Week</th>
              <th className="py-2.5 font-semibold">Status</th>
              <th className="py-2.5 font-semibold">Opening Time</th>
              <th className="py-2.5 font-semibold">Closing Time</th>
              <th className="py-2.5 font-semibold text-right">Service Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 font-body-sm text-body-sm text-on-surface">
            {operatingHours.map((schedule) => {
              const isHighlight =
                schedule.day === "Thursday" || schedule.day === "Friday";

              return (
                <tr
                  key={schedule.day}
                  className={`transition-colors ${
                    isHighlight
                      ? "bg-primary-fixed/20 hover:bg-primary-fixed/30"
                      : "hover:bg-surface-container-low/60"
                  } ${!schedule.isOpen ? "opacity-60 bg-surface-container-low/40" : ""}`}
                >
                  {/* Day of Week */}
                  <td className="py-3 font-semibold text-on-surface">
                    <div className="flex items-center gap-1.5">
                      <span>{schedule.day}</span>
                      {schedule.badge && (
                        <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-[11px] font-medium border border-outline-variant/30">
                          {schedule.badge}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => onToggleDayStatus(schedule.day)}
                      className={`inline-flex items-center gap-1 font-label-sm font-semibold px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        schedule.isOpen
                          ? "text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                          : "text-error bg-red-50 hover:bg-red-100"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          schedule.isOpen ? "bg-emerald-600" : "bg-error"
                        }`}
                      />
                      <span>{schedule.isOpen ? "Open" : "Closed"}</span>
                    </button>
                  </td>

                  {/* Opening Time */}
                  <td className="py-3">
                    <input
                      disabled={!schedule.isOpen}
                      className={`w-24 px-2 py-1 rounded bg-surface-container border ${
                        isHighlight
                          ? "border-outline-variant/70 font-semibold"
                          : "border-outline-variant/70 font-medium"
                      } text-on-surface text-center font-label-sm disabled:opacity-40 disabled:cursor-not-allowed`}
                      type="text"
                      value={schedule.isOpen ? schedule.openingTime : "--:--"}
                      onChange={(e) =>
                        onTimeChange(schedule.day, "openingTime", e.target.value)
                      }
                      placeholder="12:00 PM"
                    />
                  </td>

                  {/* Closing Time */}
                  <td className="py-3">
                    <input
                      disabled={!schedule.isOpen}
                      className={`w-24 px-2 py-1 rounded bg-surface-container border ${
                        isHighlight
                          ? "border-primary font-semibold"
                          : "border-outline-variant/70 font-medium"
                      } text-on-surface text-center font-label-sm disabled:opacity-40 disabled:cursor-not-allowed`}
                      type="text"
                      value={schedule.isOpen ? schedule.closingTime : "--:--"}
                      onChange={(e) =>
                        onTimeChange(schedule.day, "closingTime", e.target.value)
                      }
                      placeholder="11:30 PM"
                    />
                  </td>

                  {/* Service Type */}
                  <td className="py-3 text-right">
                    {schedule.isOpen ? (
                      <input
                        type="text"
                        value={schedule.serviceType}
                        onChange={(e) =>
                          onServiceTypeChange(schedule.day, e.target.value)
                        }
                        className={`text-right font-label-sm bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary focus:outline-none px-1 ${
                          isHighlight
                            ? "text-primary font-medium"
                            : "text-on-surface-variant font-normal"
                        }`}
                        title="Click to edit service type description"
                      />
                    ) : (
                      <span className="text-on-surface-variant/60 font-label-sm italic">
                        Kitchen Closed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Info Banner & Bulk Hours */}
      <div className="p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-on-surface-variant">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-primary">info</span>
          <span className="font-body-sm text-body-sm">
            Last order accepted 30 minutes before dining room closure.
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenBulkHoursModal}
          className="font-label-sm text-label-sm text-primary font-semibold hover:underline cursor-pointer"
        >
          Apply Bulk Hours
        </button>
      </div>
    </section>
  );
}
