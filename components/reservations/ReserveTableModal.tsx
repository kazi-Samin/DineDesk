"use client";

import { useState, useEffect, useMemo } from "react";
import { useReservation } from "@/context/ReservationContext";

export default function ReserveTableModal() {
  const { isModalOpen, restaurantInfo, closeReservationModal, submitReservation } = useReservation();

  // Dynamic Current Date Reference (Always works today, tomorrow, and future years)
  const today = useMemo(() => new Date(), []);
  
  const [guests, setGuests] = useState(2);
  const [selectedDateObj, setSelectedDateObj] = useState<Date>(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [selectedTime, setSelectedTime] = useState("8:00 PM");
  const [seatingArea, setSeatingArea] = useState<string>("Main Dining Hall");
  const [tablePosition, setTablePosition] = useState<string>("T-04 (Center Booth)");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Sync selected date when modal opens if needed
  useEffect(() => {
    if (isModalOpen) {
      const now = new Date();
      setSelectedDateObj(now);
      setCalendarMonth(now);
    }
  }, [isModalOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeReservationModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, closeReservationModal]);

  if (!isModalOpen) return null;

  const toggleChip = (label: string) => {
    if (selectedChips.includes(label)) {
      setSelectedChips(selectedChips.filter((c) => c !== label));
    } else {
      setSelectedChips([...selectedChips, label]);
    }
  };

  // Format date helper
  const formatDateDisplay = (date: Date) => {
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const tmrw = new Date(today);
    tmrw.setDate(today.getDate() + 1);
    const isTmrw =
      date.getDate() === tmrw.getDate() &&
      date.getMonth() === tmrw.getMonth() &&
      date.getFullYear() === tmrw.getFullYear();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    if (isToday) return `Today, ${monthNames[date.getMonth()]} ${date.getDate()}`;
    if (isTmrw) return `Tomorrow, ${monthNames[date.getMonth()]} ${date.getDate()}`;
    return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const selectedDateFormatted = formatDateDisplay(selectedDateObj);

  const handleConfirmReservation = async () => {
    setIsSubmitting(true);
    try {
      const res = await submitReservation({
        restaurantId: restaurantInfo.id,
        restaurantName: restaurantInfo.name,
        guests,
        date: selectedDateFormatted,
        time: selectedTime,
        seatingArea: `${seatingArea} (${tablePosition})`,
        specialRequests: selectedChips,
        notes: notes.trim() || undefined,
        status: "pending",
      });

      setSuccessInfo(res.id);
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessInfo(null);
        closeReservationModal();
      }, 1600);
    } catch {
      setIsSubmitting(false);
    }
  };

  // Generate 7 upcoming dynamic rolling days for horizontal quick picker
  const quickDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const label = i === 0 ? "Today" : i === 1 ? "Tmrw" : dayNames[d.getDay()];
    const availability = i === 0 ? "Few tables" : i === 3 ? "Filling fast" : "Available";
    return {
      date: d,
      label,
      dayNum: d.getDate().toString(),
      monthName: monthNames[d.getMonth()],
      sub: availability,
      isSame:
        d.getDate() === selectedDateObj.getDate() &&
        d.getMonth() === selectedDateObj.getMonth() &&
        d.getFullYear() === selectedDateObj.getFullYear(),
    };
  });

  // Calendar matrix calculation for full month view
  const currentMonthYearHeader = calendarMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const changeMonth = (offset: number) => {
    const next = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1);
    setCalendarMonth(next);
  };

  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 for Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  // Table options based on selected seating area
  const tablePresets: Record<string, string[]> = {
    "Main Dining Hall": ["T-01 (Window View)", "T-04 (Center Booth)", "T-09 (Chandelier View)", "T-14 (Cozy Nook)"],
    "Quiet Courtyard": ["C-02 (Fountain Side)", "C-05 (Under Pergola)", "C-08 (Garden Corner)"],
    "Private Family Booth": ["B-01 (Semi-Private 6p)", "B-03 (High Back Alcove)", "VIP-Executive Lounge"],
  };

  const currentTableOptions = tablePresets[seatingArea] || ["Standard Available Table"];

  const lunchSlots = ["12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM"];
  const dinnerSlots = ["7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM"];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#171714]/50 backdrop-blur-[3px] flex items-center justify-center p-space-sm sm:p-space-md md:p-space-lg overflow-y-auto"
      id="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeReservationModal();
      }}
    >
      {/* Centered Dialog Card */}
      <div
        aria-labelledby="modal-title"
        aria-modal="true"
        className="relative w-full max-w-[640px] my-auto bg-surface-container-lowest rounded-xl shadow-[0_16px_48px_rgba(30,27,22,0.18)] overflow-hidden transition-all"
        id="reservation-dialog"
        role="dialog"
      >
        {/* Subtle top tint accent */}
        <div className="h-1.5 w-full bg-primary-container"></div>

        {/* Header Section */}
        <div className="px-space-lg sm:px-space-xl pt-space-lg pb-space-md flex items-start justify-between bg-surface-container-lowest">
          <div>
            <div className="flex items-center gap-space-xs mb-1">
              <span className="material-symbols-outlined text-secondary text-base">
                table_restaurant
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
                Instant Reservation
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-primary" id="modal-title">
              Reserve a Table
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5 mt-0.5">
              <span className="font-medium text-on-surface">{restaurantInfo.name}</span>
              <span className="text-outline-variant">•</span>
              <span>{restaurantInfo.neighborhood}</span>
            </p>
          </div>
          <button
            aria-label="Close reservation modal"
            className="p-2 -mr-1.5 -mt-1 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
            id="close-modal-btn"
            onClick={closeReservationModal}
            type="button"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="px-space-lg sm:px-space-xl pb-space-lg flex flex-col gap-space-lg max-h-[calc(85vh-160px)] overflow-y-auto">
          {/* 1. Party Size Stepper & Selector */}
          <section className="flex flex-col gap-space-sm pt-space-xs">
            <div className="flex items-center justify-between">
              <label className="font-label-lg text-label-lg font-semibold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-primary-container">
                  group
                </span>
                Number of Guests
              </label>
              <span className="font-body-sm text-body-sm text-on-surface-variant" id="party-summary-hint">
                Table for {guests} {guests === 1 ? "diner" : "diners"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm">
              {/* Stepper Container */}
              <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-xs rounded-lg shadow-sm w-full sm:w-auto">
                <button
                  aria-label="Decrease guest count"
                  className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-highest hover:text-primary transition-colors cursor-pointer"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">remove</span>
                </button>
                <div className="flex items-center gap-1.5 px-space-md">
                  <span className="material-symbols-outlined text-primary-container text-lg">
                    airline_seat_recline_normal
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold w-5 text-center">
                    {guests}
                  </span>
                </div>
                <button
                  aria-label="Increase guest count"
                  className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-highest hover:text-primary transition-colors cursor-pointer"
                  onClick={() => setGuests((g) => Math.min(20, g + 1))}
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                </button>
              </div>

              {/* Quick Selector Badges */}
              <div className="grid grid-cols-5 gap-1.5 flex-1" id="guest-pill-group">
                {[1, 2, 4, 6, 8].map((count) => {
                  const isActive = count === 8 ? guests >= 8 : guests === count;
                  return (
                    <button
                      key={count}
                      onClick={() => setGuests(count)}
                      className={`guest-pill py-2 text-center rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                          : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      }`}
                      type="button"
                    >
                      {count === 8 ? "8+" : count}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 2. Date Picker (Dynamic Rolling Days + Lifetime Month Calendar Picker) */}
          <section className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <label className="font-label-lg text-label-lg font-semibold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-primary-container">
                  calendar_month
                </span>
                Select Date
              </label>
              <button
                type="button"
                onClick={() => setShowFullCalendar(!showFullCalendar)}
                className="font-label-sm text-label-sm text-secondary hover:text-secondary-container font-semibold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{selectedDateFormatted}</span>
                <span className="material-symbols-outlined text-sm">
                  {showFullCalendar ? "expand_less" : "calendar_today"}
                </span>
              </button>
            </div>

            {/* Quick Rolling 7-Day Ribbon */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 overflow-x-auto pb-1" id="date-ribbon">
              {quickDays.map((d) => {
                const isActive = d.isSame;
                return (
                  <button
                    key={d.date.toISOString()}
                    onClick={() => {
                      setSelectedDateObj(d.date);
                      setShowFullCalendar(false);
                    }}
                    className={`date-card flex flex-col items-center justify-center p-space-sm rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? "active-date bg-primary-container text-on-primary shadow-sm ring-2 ring-primary-container ring-offset-1"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                    type="button"
                  >
                    <span
                      className={`font-label-sm text-[11px] uppercase tracking-wide ${
                        isActive ? "text-on-primary/90 font-semibold" : ""
                      }`}
                    >
                      {d.label}
                    </span>
                    <span
                      className={`font-headline-sm text-base my-0.5 font-bold ${
                        isActive ? "text-on-primary" : "text-on-surface"
                      }`}
                    >
                      {d.dayNum}
                    </span>
                    <span
                      className={`font-label-sm text-[10px] font-medium ${
                        isActive
                          ? "text-primary-fixed"
                          : d.sub === "Few tables" || d.sub === "Filling fast"
                          ? "text-secondary"
                          : "text-on-surface-variant/80"
                      }`}
                    >
                      {d.monthName}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Lifetime Full Month Calendar Popover / Dropdown */}
            {showFullCalendar && (
              <div className="mt-2 p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl shadow-md transition-all">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-base">
                      event
                    </span>
                    <span className="font-label-md text-label-md font-bold text-primary">
                      {currentMonthYearHeader}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => changeMonth(-1)}
                      className="p-1 hover:bg-surface-container rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      title="Previous Month"
                    >
                      <span className="material-symbols-outlined text-lg">chevron_left</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarMonth(new Date())}
                      className="px-2 py-0.5 text-[11px] font-medium bg-surface-container hover:bg-surface-container-high rounded text-on-surface transition-colors cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => changeMonth(1)}
                      className="p-1 hover:bg-surface-container rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      title="Next Month"
                    >
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                  </div>
                </div>

                {/* Day of Week Headers */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <span key={day} className="text-[11px] font-semibold text-on-surface-variant">
                      {day}
                    </span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {getCalendarDays().map((dateItem, idx) => {
                    if (!dateItem) {
                      return <div key={`empty-${idx}`} className="h-8"></div>;
                    }

                    // Check if date is in the past
                    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const isPast = dateItem < startOfToday;
                    const isSelected =
                      dateItem.getDate() === selectedDateObj.getDate() &&
                      dateItem.getMonth() === selectedDateObj.getMonth() &&
                      dateItem.getFullYear() === selectedDateObj.getFullYear();

                    return (
                      <button
                        key={dateItem.toISOString()}
                        disabled={isPast}
                        type="button"
                        onClick={() => {
                          setSelectedDateObj(dateItem);
                          setShowFullCalendar(false);
                        }}
                        className={`h-8 rounded text-[12px] font-medium transition-all flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? "bg-primary-container text-on-primary font-bold shadow-sm"
                            : isPast
                            ? "text-outline/40 cursor-not-allowed bg-transparent"
                            : "hover:bg-surface-container-high text-on-surface"
                        }`}
                      >
                        {dateItem.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* 3. Time Slot Picker */}
          <section className="flex flex-col gap-space-sm">
            <label className="font-label-lg text-label-lg font-semibold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-primary-container">
                schedule
              </span>
              Seating Time
            </label>
            {/* Lunch Slots */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-space-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">wb_sunny</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                  Lunch Experience
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {lunchSlots.map((slot) => {
                  const isActive = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`time-slot py-2 px-space-sm rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                          : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      }`}
                      type="button"
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Dinner Slots */}
            <div className="flex flex-col gap-1.5 mt-space-xs">
              <div className="flex items-center gap-space-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">nightlight</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                  Dinner Experience
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {dinnerSlots.map((slot) => {
                  const isActive = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`time-slot relative py-2 px-space-sm rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                          : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      }`}
                      type="button"
                    >
                      <span>{slot}</span>
                      {slot === "9:30 PM" && (
                        <span className="block text-[9px] text-secondary leading-none font-semibold">
                          Limited
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 4. Seating Area Preference */}
          <section className="flex flex-col gap-space-sm">
            <label className="font-label-lg text-label-lg font-semibold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-primary-container">chair</span>
              Preferred Seating Area
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" id="seating-area-group">
              <label
                onClick={() => setSeatingArea("Main Dining Hall")}
                className={`seating-option cursor-pointer p-space-sm rounded-lg transition-all flex flex-col gap-1 ${
                  seatingArea === "Main Dining Hall"
                    ? "bg-surface-container-high"
                    : "bg-surface-container-low hover:bg-surface-container"
                }`}
              >
                <div className="flex items-center justify-between">
                  <input
                    checked={seatingArea === "Main Dining Hall"}
                    onChange={() => setSeatingArea("Main Dining Hall")}
                    className="accent-primary-container"
                    name="seating_area"
                    type="radio"
                    value="Main Dining Hall"
                  />
                  <span className="material-symbols-outlined text-primary-container text-lg">
                    dinner_dining
                  </span>
                </div>
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  Main Hall
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant text-[12px] leading-tight">
                  Warm &amp; lively ambiance
                </span>
              </label>

              <label
                onClick={() => setSeatingArea("Quiet Courtyard")}
                className={`seating-option cursor-pointer p-space-sm rounded-lg transition-all flex flex-col gap-1 ${
                  seatingArea === "Quiet Courtyard"
                    ? "bg-surface-container-high"
                    : "bg-surface-container-low hover:bg-surface-container"
                }`}
              >
                <div className="flex items-center justify-between">
                  <input
                    checked={seatingArea === "Quiet Courtyard"}
                    onChange={() => setSeatingArea("Quiet Courtyard")}
                    className="accent-primary-container"
                    name="seating_area"
                    type="radio"
                    value="Quiet Courtyard"
                  />
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">
                    yard
                  </span>
                </div>
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  Courtyard
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant text-[12px] leading-tight">
                  Quiet outdoor garden
                </span>
              </label>

              <label
                onClick={() => setSeatingArea("Private Family Booth")}
                className={`seating-option cursor-pointer p-space-sm rounded-lg transition-all flex flex-col gap-1 ${
                  seatingArea === "Private Family Booth"
                    ? "bg-surface-container-high"
                    : "bg-surface-container-low hover:bg-surface-container"
                }`}
              >
                <div className="flex items-center justify-between">
                  <input
                    checked={seatingArea === "Private Family Booth"}
                    onChange={() => setSeatingArea("Private Family Booth")}
                    className="accent-primary-container"
                    name="seating_area"
                    type="radio"
                    value="Private Family Booth"
                  />
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">
                    meeting_room
                  </span>
                </div>
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  Family Booth
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant text-[12px] leading-tight">
                  Enclosed alcove dining
                </span>
              </label>
            </div>

            {/* Customize Specific Table Position */}
            <div className="mt-2 bg-surface-container-low p-space-sm rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">room_preferences</span>
                <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                  Specific Table Preference:
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {currentTableOptions.map((tbl) => (
                  <button
                    key={tbl}
                    type="button"
                    onClick={() => setTablePosition(tbl)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                      tablePosition === tbl
                        ? "bg-primary-container text-on-primary font-bold shadow-xs"
                        : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {tbl}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 5. Special Occasion & Dietary Notes */}
          <section className="flex flex-col gap-space-sm">
            <label
              className="font-label-lg text-label-lg font-semibold text-on-surface flex items-center justify-between"
              htmlFor="reservation-notes"
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-primary-container">
                  notes
                </span>
                Dietary &amp; Special Requests
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Optional</span>
            </label>
            {/* Quick Chip Toggles */}
            <div className="flex flex-wrap gap-1.5" id="occasion-chips">
              {[
                { label: "Birthday Celebration", icon: "cake" },
                { label: "Anniversary", icon: "favorite" },
                { label: "Window Seat", icon: "window" },
                { label: "Wheelchair Access", icon: "accessible" },
              ].map((chip) => {
                const isSelected = selectedChips.includes(chip.label);
                return (
                  <button
                    key={chip.label}
                    onClick={() => toggleChip(chip.label)}
                    className={`occasion-chip px-space-sm py-1 rounded font-label-sm text-label-sm transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-primary-container text-on-primary font-semibold"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-xs">{chip.icon}</span>
                    {chip.label}
                  </button>
                );
              })}
            </div>
            <textarea
              className="w-full bg-surface-container-low rounded-lg p-space-sm font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-all resize-none shadow-inner"
              id="reservation-notes"
              placeholder={
                selectedChips.length > 0
                  ? `Selected: ${selectedChips.join(", ")}. Add further kitchen notes here...`
                  : "Any celebrations, allergies, high chairs, or dietary preferences? Let the kitchen know..."
              }
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </section>
        </div>

        {/* 6. Policy Notice & CTA Footer */}
        <div className="p-space-lg sm:p-space-xl bg-surface-container-low flex flex-col gap-space-md">
          {/* Policy Banner */}
          <div className="flex items-start gap-space-sm bg-surface-container-lowest p-space-sm rounded-lg">
            <span className="material-symbols-outlined text-primary-container text-lg shrink-0 mt-0.5">
              verified_user
            </span>
            <p className="font-body-sm text-[12px] leading-relaxed text-on-surface-variant">
              <span className="font-semibold text-on-surface">Free cancellation</span> up to 2 hours
              before your booking time. Instant confirmation sent via SMS &amp; DineDesk App.
            </p>
          </div>
          {/* Action CTAs */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-space-sm">
            <button
              className="w-full sm:w-auto px-space-lg py-space-sm text-on-surface-variant hover:text-primary font-label-md text-label-md rounded-lg transition-colors text-center cursor-pointer"
              id="dismiss-modal-btn"
              onClick={closeReservationModal}
              type="button"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="w-full sm:w-auto flex-1 sm:flex-initial px-space-xl py-space-md bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg font-semibold rounded-lg shadow transition-all flex items-center justify-center gap-space-xs cursor-pointer disabled:opacity-80"
              id="confirm-reservation-btn"
              onClick={handleConfirmReservation}
              disabled={isSubmitting}
              type="button"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-base">
                    progress_activity
                  </span>
                  <span>Securing Table...</span>
                </>
              ) : successInfo ? (
                <>
                  <span className="material-symbols-outlined text-base">check</span>
                  <span>Reserved! ID: {successInfo}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span id="cta-button-text">
                    Request Reservation • {guests} {guests === 1 ? "Guest" : "Guests"},{" "}
                    {selectedDateFormatted.split(",")[0]} at {selectedTime}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
