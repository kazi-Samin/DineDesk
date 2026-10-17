"use client";

import { useState } from "react";
import { SeatingZone } from "@/types/reservation";

export type ReservationTab = "pending" | "confirmed" | "seated" | "past_cancelled";

interface ReservationFilterBarProps {
  pendingCount: number;
  confirmedCount: number;
  seatedCount: number;
  pastCancelledCount: number;
  activeTab: ReservationTab;
  onTabChange: (tab: ReservationTab) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedZone: string;
  onZoneChange: (zone: string) => void;
  selectedPartySize: string;
  onPartySizeChange: (size: string) => void;
  onOpenWalkInModal: () => void;
  onResetFilters: () => void;
}

export default function ReservationFilterBar({
  pendingCount,
  confirmedCount,
  seatedCount,
  pastCancelledCount,
  activeTab,
  onTabChange,
  selectedDate,
  onDateChange,
  searchQuery,
  onSearchChange,
  selectedZone,
  onZoneChange,
  selectedPartySize,
  onPartySizeChange,
  onOpenWalkInModal,
  onResetFilters,
}: ReservationFilterBarProps) {
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isToday =
    new Date().toDateString() === selectedDate.toDateString();

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    onDateChange(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    onDateChange(next);
  };

  const handleNativeDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split("-").map(Number);
      onDateChange(new Date(year, month - 1, day));
      setShowDatePicker(false);
    }
  };

  const hasActiveFilters = selectedZone !== "all" || selectedPartySize !== "all";

  return (
    <section className="bg-surface-container-lowest rounded-xl p-space-lg border border-outline-variant shadow-2xs space-y-space-md">
      {/* Top Title & Date Control Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Table Reservation Requests
            </h1>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold animate-pulse">
                {pendingCount} New
              </span>
            )}
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Review incoming diner booking requests, assign floor seating, and confirm reservations.
          </p>
        </div>

        {/* Date & Fast Actions */}
        <div className="flex flex-wrap items-center gap-space-sm">
          {/* Day Navigation */}
          <div className="inline-flex items-center bg-surface-container-low rounded-lg p-1 border border-outline-variant/40">
            <button
              onClick={handlePrevDay}
              className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-colors cursor-pointer"
              title="Previous Day"
              type="button"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 font-label-md text-label-md font-semibold text-on-surface">
              <span className="material-symbols-outlined text-base text-primary">calendar_today</span>
              <span>{isToday ? `Today, ${formattedDate}` : formattedDate}</span>
            </div>
            <button
              onClick={handleNextDay}
              className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-colors cursor-pointer"
              title="Next Day"
              type="button"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>

          {/* Pick Date Button */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md font-semibold rounded-lg transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-base">date_range</span>
              <span>Pick Date</span>
            </button>
            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 p-3 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50">
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  Select Calendar Date
                </label>
                <input
                  type="date"
                  className="px-2.5 py-1.5 rounded-lg border border-outline-variant bg-surface-container-low text-xs text-on-surface focus:outline-none"
                  value={selectedDate.toISOString().split("T")[0]}
                  onChange={handleNativeDateInput}
                />
              </div>
            )}
          </div>

          {/* Manual Walk-in Action */}
          <button
            onClick={onOpenWalkInModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Manual Walk-in</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md pt-space-sm border-t border-outline-variant/30">
        {/* Navigation Tab Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => onTabChange("pending")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "pending"
                ? "bg-primary-container text-on-primary shadow-sm"
                : "bg-transparent hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
            type="button"
          >
            <span>Pending Requests</span>
            <span
              className={`w-5 h-5 rounded-full text-label-sm font-bold flex items-center justify-center ${
                activeTab === "pending"
                  ? "bg-surface-container-lowest text-primary"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange("confirmed")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "confirmed"
                ? "bg-primary-container text-on-primary shadow-sm"
                : "bg-transparent hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
            type="button"
          >
            <span>Upcoming Confirmed</span>
            <span
              className={`w-5 h-5 rounded-full text-label-sm font-medium flex items-center justify-center ${
                activeTab === "confirmed"
                  ? "bg-surface-container-lowest text-primary"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {confirmedCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange("seated")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "seated"
                ? "bg-primary-container text-on-primary shadow-sm"
                : "bg-transparent hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
            type="button"
          >
            <span>Seated Today</span>
            <span
              className={`w-5 h-5 rounded-full text-label-sm font-medium flex items-center justify-center ${
                activeTab === "seated"
                  ? "bg-surface-container-lowest text-primary"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {seatedCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange("past_cancelled")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-label-md text-label-md font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "past_cancelled"
                ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                : "bg-transparent hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
            type="button"
          >
            <span>Past &amp; Cancelled</span>
            {pastCancelledCount > 0 && (
              <span
                className={`w-5 h-5 rounded-full text-label-sm font-medium flex items-center justify-center ${
                  activeTab === "past_cancelled"
                    ? "bg-surface-container-lowest text-primary"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {pastCancelledCount}
              </span>
            )}
          </button>
        </div>

        {/* Search & Filter Options */}
        <div className="flex items-center gap-space-sm">
          <div className="relative flex-1 md:w-72">
            <span className="material-symbols-outlined text-base absolute left-3 top-2.5 text-on-surface-variant pointer-events-none">
              search
            </span>
            <input
              className="w-full bg-surface-container-low pl-9 pr-3 py-2 rounded-md text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest border border-outline-variant focus:border-primary transition-colors"
              placeholder="Search diner, phone, or #TB ID..."
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-2.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          {/* Filter Popover Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowFilterPopover(!showFilterPopover)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                hasActiveFilters
                  ? "bg-primary-container text-on-primary"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
              title="Filter preferences"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">tune</span>
            </button>

            {showFilterPopover && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-1 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    Filter Reservations
                  </span>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={onResetFilters}
                      className="text-[11px] text-secondary font-medium hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Zone Filter */}
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                    Seating Zone
                  </label>
                  <select
                    value={selectedZone}
                    onChange={(e) => onZoneChange(e.target.value)}
                    className="w-full bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-outline-variant text-xs text-on-surface focus:outline-none"
                  >
                    <option value="all">All Zones</option>
                    <option value="Courtyard Terrace">Courtyard Terrace</option>
                    <option value="Main Dining Hall">Main Dining Hall</option>
                    <option value="Private Heritage Dining">Private Heritage Dining</option>
                  </select>
                </div>

                {/* Party Size Filter */}
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                    Party Size
                  </label>
                  <select
                    value={selectedPartySize}
                    onChange={(e) => onPartySizeChange(e.target.value)}
                    className="w-full bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-outline-variant text-xs text-on-surface focus:outline-none"
                  >
                    <option value="all">Any Size</option>
                    <option value="1-2">1 – 2 Guests</option>
                    <option value="3-4">3 – 4 Guests</option>
                    <option value="5-8">5 – 8 Guests</option>
                    <option value="9+">9+ Guests (Banquet)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
