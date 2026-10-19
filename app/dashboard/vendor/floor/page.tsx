"use client";

import { useState, useEffect, useMemo } from "react";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import TableMateAiButton from "@/components/vendor/reservations/TableMateAiButton";
import ManualWalkInModal from "@/components/vendor/reservations/ManualWalkInModal";
import { TableEntity, SeatingZone, WalkInFormInput } from "@/types/reservation";
import {
  getVendorTables,
  updateTableStatus,
  createWalkInReservation,
  resetReservationData,
} from "@/services/mockVendorReservationService";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info";
}

export default function DiningRoomFloorPage() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_vendor_sidebar");
  const [tables, setTables] = useState<TableEntity[]>([]);
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  // Filters
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Quick Seating & Details Modal
  const [activeTableForModal, setActiveTableForModal] = useState<TableEntity | null>(null);
  const [guestNameInput, setGuestNameInput] = useState("");
  const [partySizeInput, setPartySizeInput] = useState("2");
  const [guestNotesInput, setGuestNotesInput] = useState("");
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  useEffect(() => {
    setTables(getVendorTables());
    setIsClientLoaded(true);
  }, []);

  const handleRefresh = () => {
    const refreshed = getVendorTables();
    setTables(refreshed);
    addToast("Floor Synchronized", "Loaded real-time floor plan tables and seating statuses.", "info");
  };

  const handleResetFloor = () => {
    if (confirm("Reset dining room floor to default seating configuration?")) {
      const reset = resetReservationData();
      setTables(reset.tables);
      addToast("Floor Reset", "Restored standard The Maple & Vine dining room layout.", "info");
    }
  };

  // Status changers
  const handleSetStatus = (tableId: string, status: TableEntity["status"], guest?: string) => {
    const res = updateTableStatus(tableId, status, guest);
    setTables(res.tables);
    const target = res.tables.find((t) => t.id === tableId);
    const label = target ? target.shortName : tableId;

    if (status === "available") {
      addToast("Table Cleared", `${label} is now sanitized, free, and available for walk-in guests.`);
    } else if (status === "occupied") {
      addToast("Table Seated", `${label} marked as Occupied by ${guest || "Guests"}.`);
    } else if (status === "reserved") {
      addToast("Table Reserved", `${label} marked as Reserved for incoming booking.`);
    }
  };

  const handleOpenSeatingModal = (table: TableEntity) => {
    setActiveTableForModal(table);
    setGuestNameInput(table.currentGuest?.split(" (")[0] || "");
    setPartySizeInput(table.capacity.toString());
    setGuestNotesInput("");
  };

  const handleConfirmSeating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTableForModal) return;

    const guest = guestNameInput.trim() || "Walk-In Guest";
    const guestLabel = `${guest} (${partySizeInput || activeTableForModal.capacity} Guests)`;

    handleSetStatus(activeTableForModal.id, "occupied", guestLabel);
    setActiveTableForModal(null);
  };

  const handleWalkInSubmit = (data: WalkInFormInput) => {
    const result = createWalkInReservation(data);
    if (result.success) {
      setTables(result.tables);
      setIsWalkInModalOpen(false);
      addToast("Walk-In Seated", `Seated ${data.guestName} at Table ${data.tableId}.`);
    } else {
      addToast("Seating Error", result.message, "error");
    }
  };

  // Metrics
  const totalTables = tables.length;
  const occupiedTables = tables.filter((t) => t.status === "occupied").length;
  const reservedTables = tables.filter((t) => t.status === "reserved" || t.status === "assigned").length;
  const availableTables = tables.filter((t) => t.status === "available").length;

  const totalSeats = tables.reduce((acc, t) => acc + t.capacity, 0);
  const occupiedSeats = tables
    .filter((t) => t.status === "occupied")
    .reduce((acc, t) => acc + t.capacity, 0);

  const occupancyRate = totalTables > 0 ? Math.round(((occupiedTables + reservedTables) / totalTables) * 100) : 0;

  // Filtered tables
  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      if (selectedZone !== "all" && table.zone !== selectedZone) return false;
      if (selectedStatus !== "all" && table.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = table.id.toLowerCase().includes(query);
        const matchesLabel = table.label.toLowerCase().includes(query);
        const matchesGuest = table.currentGuest?.toLowerCase().includes(query) || false;
        if (!matchesId && !matchesLabel && !matchesGuest) return false;
      }
      return true;
    });
  }, [tables, selectedZone, selectedStatus, searchQuery]);

  const zones: SeatingZone[] = [
    "Main Dining Hall",
    "Courtyard Terrace",
    "Private Heritage Dining",
  ];

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased">
      {/* Sidebar Navigation */}
      <VendorSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
      />

      {/* Top Header */}
      <VendorHeader
        restaurantName="The Maple & Vine"
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* Main Content Area */}
      <div className={`pt-16 transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>
        <main className="relative bg-background min-h-screen">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
            {/* Top Operational Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-primary-container/10 text-primary">
                    <span className="material-symbols-outlined text-xl">grid_view</span>
                  </span>
                  <h1 className="font-headline-md text-2xl font-bold text-primary tracking-tight">
                    Dining Room Floor Plan
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Dinner Service Live
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Interactive real-time table layout, seat allocation, and dining room management for <strong>The Maple &amp; Vine</strong>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="px-3 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-medium text-on-surface border border-outline-variant/70 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  <span>Sync Floor</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetFloor}
                  className="px-3 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-medium text-on-surface-variant hover:text-on-surface border border-outline-variant/70 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">restart_alt</span>
                  <span>Reset Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(true)}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-base">person_add</span>
                  <span>Seat Walk-In</span>
                </button>
              </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Floor Occupancy */}
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-xs font-semibold uppercase tracking-wider">Floor Occupancy</span>
                  <span className="material-symbols-outlined text-primary text-lg">pie_chart</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">{occupancyRate}%</span>
                  <span className="text-xs text-on-surface-variant">
                    ({occupiedTables + reservedTables} / {totalTables} Tables)
                  </span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>

              {/* Card 2: Seated Diners */}
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-xs font-semibold uppercase tracking-wider">Seated Diners</span>
                  <span className="material-symbols-outlined text-secondary text-lg">groups</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-secondary">{occupiedSeats}</span>
                  <span className="text-xs text-on-surface-variant">of {totalSeats} capacity</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Active across 3 dining room sections
                </p>
              </div>

              {/* Card 3: Available for Walk-Ins */}
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-xs font-semibold uppercase tracking-wider">Available Tables</span>
                  <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-700">{availableTables}</span>
                  <span className="text-xs text-emerald-600 font-medium">Ready to Seat</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Sanitized and staged for instant seating
                </p>
              </div>

              {/* Card 4: Upcoming Bookings */}
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-xs font-semibold uppercase tracking-wider">Reserved Tables</span>
                  <span className="material-symbols-outlined text-amber-600 text-lg">event_seat</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-amber-700">{reservedTables}</span>
                  <span className="text-xs text-on-surface-variant">Tonight</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Assigned to incoming confirmed reservations
                </p>
              </div>
            </div>

            {/* Filter Toolbar & Legend */}
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs space-y-3">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Zone Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                  <button
                    type="button"
                    onClick={() => setSelectedZone("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                      selectedZone === "all"
                        ? "bg-primary text-on-primary shadow-xs"
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    All Zones ({totalTables})
                  </button>
                  {zones.map((zone) => {
                    const count = tables.filter((t) => t.zone === zone).length;
                    return (
                      <button
                        key={zone}
                        type="button"
                        onClick={() => setSelectedZone(zone)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                          selectedZone === zone
                            ? "bg-primary text-on-primary shadow-xs"
                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                      >
                        {zone} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Status Filter & Search */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-48">
                    <span className="material-symbols-outlined absolute left-2.5 top-2 text-base text-on-surface-variant pointer-events-none">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search table or guest..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-surface-container-low pl-8 pr-3 py-1.5 rounded-lg border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="all">All Statuses</option>
                    <option value="available">Available (Free)</option>
                    <option value="occupied">Occupied (Seated)</option>
                    <option value="reserved">Reserved / Assigned</option>
                  </select>
                </div>
              </div>

              {/* Status Legend */}
              <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between flex-wrap gap-2 text-xs text-on-surface-variant">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600" />
                    <span className="font-medium text-emerald-800">Available ({availableTables})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-600" />
                    <span className="font-medium text-rose-800">Occupied ({occupiedTables})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600" />
                    <span className="font-medium text-amber-800">Reserved ({reservedTables})</span>
                  </div>
                </div>
                <span className="text-[11px] text-on-surface-variant">
                  Showing {filteredTables.length} of {totalTables} tables
                </span>
              </div>
            </div>

            {/* Dining Room Floor Layout Grid */}
            <div className="space-y-6">
              {(selectedZone === "all" ? zones : [selectedZone as SeatingZone]).map((zone) => {
                const zoneTables = filteredTables.filter((t) => t.zone === zone);
                if (zoneTables.length === 0 && selectedZone === "all") return null;

                return (
                  <div
                    key={zone}
                    className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-xl">
                          {zone === "Courtyard Terrace"
                            ? "deck"
                            : zone === "Private Heritage Dining"
                            ? "meeting_room"
                            : "table_bar"}
                        </span>
                        <h2 className="font-headline-sm text-lg font-bold text-primary">
                          {zone}
                        </h2>
                      </div>
                      <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-md">
                        {zoneTables.length} Tables Active
                      </span>
                    </div>

                    {zoneTables.length === 0 ? (
                      <p className="text-xs text-on-surface-variant italic py-4">
                        No tables in {zone} match the current status filter.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {zoneTables.map((table) => {
                          const isOccupied = table.status === "occupied";
                          const isReserved = table.status === "reserved" || table.status === "assigned";
                          const isAvailable = table.status === "available";

                          return (
                            <div
                              key={table.id}
                              className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                                isOccupied
                                  ? "bg-rose-50/60 border-rose-200 shadow-2xs"
                                  : isReserved
                                  ? "bg-amber-50/60 border-amber-200 shadow-2xs"
                                  : "bg-surface-container-lowest border-outline-variant/80 hover:border-primary/50 shadow-2xs"
                              }`}
                            >
                              {/* Top Bar: Table ID & Status Badge */}
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-base text-primary">
                                      {table.shortName}
                                    </span>
                                    <span className="text-[11px] font-medium text-on-surface-variant">
                                      • {table.capacity}-Top
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-on-surface-variant block mt-0.5">
                                    {table.label.split("(")[0]}
                                  </span>
                                </div>

                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    isOccupied
                                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                                      : isReserved
                                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  }`}
                                >
                                  {isOccupied ? "Occupied" : isReserved ? "Reserved" : "Available"}
                                </span>
                              </div>

                              {/* Middle: Occupant & Booking Info */}
                              <div className="min-h-[44px] flex flex-col justify-center">
                                {table.currentGuest ? (
                                  <div className="space-y-0.5">
                                    <span className="text-[11px] font-semibold text-on-surface block truncate">
                                      👤 {table.currentGuest}
                                    </span>
                                    {table.reservationId && (
                                      <span className="text-[10px] text-on-surface-variant font-mono block">
                                        Ref: {table.reservationId}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-emerald-700 italic flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Ready for walk-in seating
                                  </span>
                                )}
                              </div>

                              {/* Bottom: Quick Operations Button Group */}
                              <div className="pt-2 border-t border-outline-variant/30 flex items-center gap-1.5">
                                {isAvailable ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenSeatingModal(table)}
                                      className="flex-1 py-1.5 px-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg text-xs font-semibold cursor-pointer text-center transition-colors"
                                    >
                                      Seat Table
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSetStatus(table.id, "reserved", "Reserved Guest")}
                                      className="py-1.5 px-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-xs font-medium cursor-pointer transition-colors"
                                      title="Hold table as reserved"
                                    >
                                      Hold
                                    </button>
                                  </>
                                ) : isOccupied ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleSetStatus(table.id, "available")}
                                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer text-center transition-colors"
                                    >
                                      Clear Table
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenSeatingModal(table)}
                                      className="py-1.5 px-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-xs font-medium cursor-pointer transition-colors"
                                      title="Edit seated guest details"
                                    >
                                      Edit
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenSeatingModal(table)}
                                      className="flex-1 py-1.5 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer text-center transition-colors"
                                    >
                                      Seat Now
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSetStatus(table.id, "available")}
                                      className="py-1.5 px-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-xs font-medium cursor-pointer transition-colors"
                                      title="Cancel hold / release table"
                                    >
                                      Release
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Floating AI Floor Assistant */}
      <TableMateAiButton />

      {/* Walk-in Full Reservation Modal */}
      <ManualWalkInModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        tables={tables}
        onSubmit={handleWalkInSubmit}
      />

      {/* Quick Table Seating Dialog */}
      {activeTableForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary-container text-on-primary">
                  <span className="material-symbols-outlined text-lg">event_seat</span>
                </span>
                <div>
                  <h3 className="font-headline-sm text-lg font-bold text-primary">
                    Seat Table {activeTableForModal.shortName}
                  </h3>
                  <span className="text-xs text-on-surface-variant">
                    {activeTableForModal.zone} • Capacity: {activeTableForModal.capacity} guests
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTableForModal(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmSeating} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-on-surface block mb-1">
                  Guest Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={guestNameInput}
                  onChange={(e) => setGuestNameInput(e.target.value)}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface block mb-1">
                  Party Size (Guests) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={activeTableForModal.capacity + 2}
                  value={partySizeInput}
                  onChange={(e) => setPartySizeInput(e.target.value)}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface block mb-1">
                  Host Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. High chair requested, celebrating anniversary"
                  value={guestNotesInput}
                  onChange={(e) => setGuestNotesInput(e.target.value)}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTableForModal(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-on-primary text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Confirm Seating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toasts */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg animate-in fade-in slide-in-from-bottom-2 flex items-start gap-3 bg-surface-container-lowest ${
              toast.type === "error"
                ? "border-error/40 text-error"
                : toast.type === "info"
                ? "border-primary/30 text-primary"
                : "border-primary-container/40 text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-lg mt-0.5 text-primary">
              {toast.type === "error" ? "error" : toast.type === "info" ? "info" : "check_circle"}
            </span>
            <div className="flex-1">
              <span className="font-semibold text-xs block text-primary">{toast.title}</span>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
