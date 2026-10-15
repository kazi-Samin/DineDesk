"use client";

import { useState, useEffect, useMemo } from "react";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import ReservationMetricCards from "@/components/vendor/reservations/ReservationMetricCards";
import ReservationFilterBar, {
  ReservationTab,
} from "@/components/vendor/reservations/ReservationFilterBar";
import ReservationCard from "@/components/vendor/reservations/ReservationCard";
import FloorPlanMatrix from "@/components/vendor/reservations/FloorPlanMatrix";
import HeadHostLogCard from "@/components/vendor/reservations/HeadHostLogCard";
import ManualWalkInModal from "@/components/vendor/reservations/ManualWalkInModal";
import InteractiveFloorManagerModal from "@/components/vendor/reservations/InteractiveFloorManagerModal";
import RejectReservationDialog from "@/components/vendor/reservations/RejectReservationDialog";
import MessageGuestModal from "@/components/vendor/reservations/MessageGuestModal";
import TableMateAiButton from "@/components/vendor/reservations/TableMateAiButton";
import {
  VendorReservation,
  TableEntity,
  WalkInFormInput,
} from "@/types/reservation";
import {
  getVendorReservations,
  getVendorTables,
  confirmReservation,
  rejectReservation,
  seatReservation,
  completeReservation,
  cancelReservation,
  createWalkInReservation,
  sendGuestMessage,
  resetReservationData,
  getReservationStats,
} from "@/services/mockVendorReservationService";

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info";
}

export default function VendorReservationsPage() {
  const [reservations, setReservations] = useState<VendorReservation[]>([]);
  const [tables, setTables] = useState<TableEntity[]>([]);
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  // Filters state
  const [activeTab, setActiveTab] = useState<ReservationTab>("pending");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedPartySize, setSelectedPartySize] = useState("all");

  // Modals state
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [isFloorManagerOpen, setIsFloorManagerOpen] = useState(false);
  const [rejectingResId, setRejectingResId] = useState<string | null>(null);
  const [messagingReservation, setMessagingReservation] = useState<VendorReservation | null>(null);

  // Floating Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message: string, type: "success" | "error" | "info" = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Initial load from storage
  useEffect(() => {
    setReservations(getVendorReservations());
    setTables(getVendorTables());
    setIsClientLoaded(true);
  }, []);

  const handleRefresh = () => {
    setReservations(getVendorReservations());
    setTables(getVendorTables());
    addToast("Data Refreshed", "Loaded latest reservation requests and table telemetry.", "info");
  };

  const handleResetData = () => {
    const reset = resetReservationData();
    setReservations(reset.reservations);
    setTables(reset.tables);
    addToast("Demo Reset", "Restored original sample reservations and floor table states.", "info");
  };

  // Stats
  const stats = useMemo(() => {
    return getReservationStats(reservations, tables);
  }, [reservations, tables]);

  // Tab counts
  const pendingCount = useMemo(
    () => reservations.filter((r) => r.status === "pending").length,
    [reservations]
  );
  const confirmedCount = useMemo(
    () => reservations.filter((r) => r.status === "confirmed").length,
    [reservations]
  );
  const seatedCount = useMemo(
    () => reservations.filter((r) => r.status === "seated").length,
    [reservations]
  );
  const pastCancelledCount = useMemo(
    () =>
      reservations.filter(
        (r) =>
          r.status === "rejected" ||
          r.status === "cancelled" ||
          r.status === "completed"
      ).length,
    [reservations]
  );

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      // 1. Tab filter
      if (activeTab === "pending" && res.status !== "pending") return false;
      if (activeTab === "confirmed" && res.status !== "confirmed") return false;
      if (activeTab === "seated" && res.status !== "seated") return false;
      if (
        activeTab === "past_cancelled" &&
        res.status !== "rejected" &&
        res.status !== "cancelled" &&
        res.status !== "completed"
      ) {
        return false;
      }

      // 2. Search query (name, phone, #TB ID)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = res.guestName.toLowerCase().includes(q);
        const matchesPhone = res.phone.toLowerCase().includes(q);
        const matchesId = res.id.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesId) return false;
      }

      // 3. Zone filter
      if (selectedZone !== "all" && res.preferredZone !== selectedZone) {
        return false;
      }

      // 4. Party size filter
      if (selectedPartySize !== "all") {
        if (selectedPartySize === "1-2" && res.partySize > 2) return false;
        if (selectedPartySize === "3-4" && (res.partySize < 3 || res.partySize > 4)) return false;
        if (selectedPartySize === "5-8" && (res.partySize < 5 || res.partySize > 8)) return false;
        if (selectedPartySize === "9+" && res.partySize < 9) return false;
      }

      return true;
    });
  }, [reservations, activeTab, searchQuery, selectedZone, selectedPartySize]);

  // Actions
  const handleAcceptReservation = (resId: string, tableId: string) => {
    const res = confirmReservation(resId, tableId);
    if (res.success) {
      setReservations(res.reservations);
      setTables(res.tables);
      addToast("Reservation Confirmed", res.message, "success");
    } else {
      addToast("Assignment Error", res.message, "error");
    }
  };

  const handleConfirmReject = (reason: string) => {
    if (!rejectingResId) return;
    const res = rejectReservation(rejectingResId, reason);
    if (res.success) {
      setReservations(res.reservations);
      setTables(res.tables);
      addToast("Reservation Declined", res.message, "info");
    }
    setRejectingResId(null);
  };

  const handleSeatReservation = (resId: string) => {
    const res = seatReservation(resId);
    if (res.success) {
      setReservations(res.reservations);
      setTables(res.tables);
      addToast("Party Seated", res.message, "success");
    }
  };

  const handleCompleteReservation = (resId: string) => {
    const res = completeReservation(resId);
    if (res.success) {
      setReservations(res.reservations);
      setTables(res.tables);
      addToast("Service Concluded", res.message, "success");
    }
  };

  const handleCancelReservation = (resId: string) => {
    const res = cancelReservation(resId);
    if (res.success) {
      setReservations(res.reservations);
      setTables(res.tables);
      addToast("Reservation Cancelled", res.message, "info");
    }
  };

  const handleWalkInSubmit = (input: WalkInFormInput) => {
    const res = createWalkInReservation(input);
    if (res.success) {
      setReservations(res.reservations);
      setTables(res.tables);
      setActiveTab("seated");
      addToast("Walk-in Seated", res.message, "success");
    } else {
      addToast("Walk-in Failed", res.message, "error");
    }
  };

  const handleSendMessage = (resId: string, message: string) => {
    const res = sendGuestMessage(resId, message);
    if (res.success) {
      setReservations(res.reservations);
      addToast("Message Sent", `Dispatched notification to diner: "${message}"`, "success");
    }
  };

  const handlePageHost = () => {
    addToast("Hostess Paged", "Sarah Zaman alerted on floor headset for front desk check-in.", "info");
  };

  const handleResetFilters = () => {
    setSelectedZone("all");
    setSelectedPartySize("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased">
      {/* Vendor Shared Sidebar */}
      <VendorSidebar pendingCount={pendingCount} />

      {/* Main Content Area */}
      <div className="pl-0 lg:pl-72 transition-all duration-300">
        {/* Vendor Top Header */}
        <VendorHeader
          restaurantName="Sultan's Heritage Kitchen"
          pendingCount={pendingCount}
          onRefresh={handleRefresh}
        />

        <main className="relative pt-16 bg-surface min-h-screen">
          <div className="flex flex-col w-full">
            <div className="px-space-md sm:px-space-lg lg:px-space-xl py-space-lg max-w-[1400px] mx-auto w-full space-y-space-xl">
              {/* Top Bar: Metrics Strip */}
              <ReservationMetricCards stats={stats} />

              {/* Header & Interactive Controls */}
              <ReservationFilterBar
                pendingCount={pendingCount}
                confirmedCount={confirmedCount}
                seatedCount={seatedCount}
                pastCancelledCount={pastCancelledCount}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedZone={selectedZone}
                onZoneChange={setSelectedZone}
                selectedPartySize={selectedPartySize}
                onPartySizeChange={setSelectedPartySize}
                onOpenWalkInModal={() => setIsWalkInOpen(true)}
                onResetFilters={handleResetFilters}
              />

              {/* Main Workspace: Split Content Grid (Left Data List + Right Interactive Floor Matrix) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter items-start">
                {/* Primary Column: Reservation Data Cards (8 Cols) */}
                <section className="xl:col-span-8 space-y-space-md">
                  {filteredReservations.length > 0 ? (
                    filteredReservations.map((res) => (
                      <ReservationCard
                        key={res.id}
                        reservation={res}
                        tables={tables}
                        onAccept={handleAcceptReservation}
                        onReject={(id) => setRejectingResId(id)}
                        onSeat={handleSeatReservation}
                        onComplete={handleCompleteReservation}
                        onCancel={handleCancelReservation}
                        onOpenMessage={(reservation) => setMessagingReservation(reservation)}
                      />
                    ))
                  ) : (
                    /* Empty State */
                    <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/40 space-y-3">
                      <div className="w-14 h-14 rounded-full bg-surface-container mx-auto flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-2xl">event_busy</span>
                      </div>
                      <h3 className="font-headline-sm text-lg font-bold text-primary">
                        No Reservations Found
                      </h3>
                      <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                        No bookings match the currently active filters for{" "}
                        <strong className="capitalize">{activeTab.replace("_", " ")}</strong>.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold cursor-pointer"
                        type="button"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}

                  {/* Dev / Demo Helper Bar */}
                  <div className="pt-4 flex items-center justify-between text-xs text-on-surface-variant border-t border-outline-variant/30">
                    <span>
                      Showing {filteredReservations.length} of {reservations.length} total demo bookings
                    </span>
                    <button
                      onClick={handleResetData}
                      type="button"
                      className="text-primary hover:underline font-medium cursor-pointer"
                    >
                      ↻ Reset Demo Data
                    </button>
                  </div>
                </section>

                {/* Secondary Column: Floor Plan Quick Glance & Live Matrix (4 Cols) */}
                <aside className="xl:col-span-4 space-y-space-md">
                  <FloorPlanMatrix
                    tables={tables}
                    onOpenFloorManager={() => setIsFloorManagerOpen(true)}
                  />
                  <HeadHostLogCard onPageHost={handlePageHost} />
                </aside>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating AI Floor Assistant */}
      <TableMateAiButton />

      {/* Modals & Dialogs */}
      <ManualWalkInModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        tables={tables}
        onSubmit={handleWalkInSubmit}
      />

      <InteractiveFloorManagerModal
        isOpen={isFloorManagerOpen}
        onClose={() => setIsFloorManagerOpen(false)}
        tables={tables}
      />

      <RejectReservationDialog
        isOpen={!!rejectingResId}
        reservationId={rejectingResId || ""}
        onClose={() => setRejectingResId(null)}
        onConfirm={handleConfirmReject}
      />

      <MessageGuestModal
        isOpen={!!messagingReservation}
        reservation={messagingReservation}
        onClose={() => setMessagingReservation(null)}
        onSend={handleSendMessage}
      />

      {/* Floating Toast Notification Stacks */}
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
