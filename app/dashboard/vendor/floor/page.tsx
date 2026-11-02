// app/dashboard/vendor/floor/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info";
}

interface DynamicFloorTable {
  id: string;
  tableNumber: string;
  label: string;
  shortName: string;
  section: string;
  capacity: number;
  shape: string;
  status: "available" | "occupied" | "reserved";
  currentGuest: string | null;
  currentReservationId: string | null;
  partySize: number;
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://dine-desk-backend.vercel.app"
)
  .replace(/\/api\/v1\/?$/, "")
  .replace(/\/+$/, "") + "/api/v1";

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  const match = document.cookie.match(
    /(?:^|;\s*)(?:token|dinedesk_auth_token|better-auth\.session_token|auth_token|accessToken)=([^;]+)/
  );
  return match && match[1] ? match[1].trim() : "";
};

const getRequestHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["x-session-token"] = token;
    headers["better-auth-session-token"] = token;
  }
  return headers;
};

// Section Icon and Radial Accents mapping
const SECTION_ICONS: Record<string, string> = {
  "Main Dining Hall": "table_bar",
  "Courtyard Terrace": "deck",
  "Private Heritage Dining": "meeting_room",
  "Family Hall": "family_restroom",
  "Party Hall": "celebration",
  "Big Occasion Hall": "festival",
  "General Hall": "storefront",
};

export default function DiningRoomFloorPage() {
  const [tables, setTables] = useState<DynamicFloorTable[]>([]);
  const [restaurantName, setRestaurantName] = useState<string>("DineDesk Flagship Central Kitchen");
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & State
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [vipHighlightOnly, setVipHighlightOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Quick Seating Dialog
  const [activeTableForModal, setActiveTableForModal] = useState<DynamicFloorTable | null>(null);
  const [guestNameInput, setGuestNameInput] = useState("");
  const [partySizeInput, setPartySizeInput] = useState("2");

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message: string, type: "success" | "error" | "info" = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // 1. Fetch 100% real database table objects and statuses directly from PostgreSQL
  const fetchFloorTelemetry = useCallback(async () => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch(`${API_BASE_URL}/reservations/vendor/floor-tables`, {
        credentials: "include",
        headers,
      });

      if (res.ok) {
        const json = await res.json();
        setTables(json.tables || []);
        if (json.restaurantName) {
          setRestaurantName(json.restaurantName);
        }
      }
    } catch (err) {
      console.error("Failed to load floor tables:", err);
      addToast("Network Error", "Unable to pull live dining floor state.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFloorTelemetry();
    const interval = setInterval(fetchFloorTelemetry, 15000);
    return () => clearInterval(interval);
  }, [fetchFloorTelemetry]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Dynamically derive all sections directly from the tables returned by the database
  const dynamicSections = useMemo(() => {
    const unique = Array.from(new Set(tables.map((t) => t.section))).filter(Boolean);
    return unique.map((sec) => ({
      name: sec,
      count: tables.filter((t) => t.section === sec).length,
      icon: SECTION_ICONS[sec] || "table_restaurant",
    }));
  }, [tables]);

  // Dynamic 4x2 Grid: Line 1 (4 buttons) and Line 2 (4 buttons)
  const firstRowSections = useMemo(() => [
    { name: "all", label: "All Sections", icon: "grid_view", count: tables.length },
    ...dynamicSections.slice(0, 3).map((s) => ({
      name: s.name,
      label: s.name,
      icon: s.icon,
      count: s.count,
    })),
  ], [dynamicSections, tables.length]);

  const secondRowSections = useMemo(() => [
    ...dynamicSections.slice(3).map((s) => ({
      name: s.name,
      label: s.name,
      icon: s.icon,
      count: s.count,
    })),
  ], [dynamicSections]);

  // Direct PostgreSQL status modification with coordinated reservation update
  const handleSetStatus = async (
    table: DynamicFloorTable,
    newStatus: "available" | "occupied" | "reserved",
    guest?: string
  ) => {
    // 1. If linked to an active booking, update that reservation record directly
    if (table.currentReservationId) {
      try {
        const headers = getRequestHeaders();
        const serverStatus =
          newStatus === "occupied" ? "SEATED" : newStatus === "available" ? "COMPLETED" : "CONFIRMED";

        await fetch(`${API_BASE_URL}/reservations/vendor/${table.currentReservationId}/status`, {
          method: "PATCH",
          headers,
          credentials: "include",
          body: JSON.stringify({
            status: serverStatus,
            statusDisplay:
              serverStatus === "SEATED"
                ? "Seated"
                : serverStatus === "COMPLETED"
                  ? "Completed"
                  : "Confirmed",
          }),
        });
      } catch (e) {
        console.error("Failed to update reservation record:", e);
      }
    }

    // 2. Update table directly in PostgreSQL & pass reservationId so release cleans the link completely
    try {
      const headers = getRequestHeaders();
      const res = await fetch(
        `${API_BASE_URL}/reservations/vendor/floor-tables/${encodeURIComponent(table.tableNumber)}/status`,
        {
          method: "PATCH",
          headers,
          credentials: "include",
          body: JSON.stringify({
            status: newStatus.toUpperCase(),
            reservationId: table.currentReservationId || undefined,
            guestName: guest,
          }),
        }
      );

      if (res.ok) {
        addToast("Table Updated", `${table.tableNumber} marked as ${newStatus}.`, "success");
        await fetchFloorTelemetry();
      }
    } catch (err) {
      addToast("Error", "Could not commit status update to database.", "error");
    }
  };

  const handleTurnaroundAllTables = async () => {
    const occupied = tables.filter((t) => t.status === "occupied");
    if (occupied.length === 0) {
      addToast("Shift Clear", "All tables are already sanitized and available.", "info");
      return;
    }

    if (!window.confirm(`Sanitize and release all ${occupied.length} currently occupied tables?`)) return;

    try {
      const headers = getRequestHeaders();
      await Promise.all(
        occupied.map(async (t) => {
          if (t.currentReservationId) {
            await fetch(`${API_BASE_URL}/reservations/vendor/${t.currentReservationId}/status`, {
              method: "PATCH",
              headers,
              credentials: "include",
              body: JSON.stringify({ status: "COMPLETED", statusDisplay: "Completed" }),
            });
          }
          await fetch(`${API_BASE_URL}/reservations/vendor/floor-tables/${encodeURIComponent(t.tableNumber)}/status`, {
            method: "PATCH",
            headers,
            credentials: "include",
            body: JSON.stringify({ status: "AVAILABLE", reservationId: t.currentReservationId || undefined }),
          });
        })
      );
      addToast("Shift Cleared", "All occupied tables turned around for new diners.", "success");
      await fetchFloorTelemetry();
    } catch {
      addToast("Error", "Could not complete full turnaround.", "error");
    }
  };

  const handleConfirmSeating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTableForModal) return;

    await handleSetStatus(activeTableForModal, "occupied", guestNameInput.trim() || "Seated Diner");
    setActiveTableForModal(null);
  };

  // Pure dynamic metrics strictly reflecting backend database counts
  const totalTables = tables.length;
  const occupiedTables = tables.filter((t) => t.status === "occupied").length;
  const reservedTables = tables.filter((t) => t.status === "reserved").length;
  const availableTables = tables.filter((t) => t.status === "available").length;

  const totalSeats = tables.reduce((acc, t) => acc + t.capacity, 0);
  const occupiedSeats = tables
    .filter((t) => t.status === "occupied")
    .reduce((acc, t) => acc + t.capacity, 0);

  const occupancyRate = totalTables > 0 ? Math.round(((occupiedTables + reservedTables) / totalTables) * 100) : 0;

  // Filtered dataset
  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      if (selectedZone !== "all" && table.section !== selectedZone) return false;
      if (selectedStatus !== "all" && table.status !== selectedStatus) return false;
      if (vipHighlightOnly && table.capacity < 6) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesLabel = table.tableNumber.toLowerCase().includes(query);
        const matchesGuest = table.currentGuest?.toLowerCase().includes(query) || false;
        if (!matchesLabel && !matchesGuest) return false;
      }
      return true;
    });
  }, [tables, selectedZone, selectedStatus, vipHighlightOnly, searchQuery]);

  return (
    <div className="w-full min-h-screen bg-[#FBFBFA] font-sans text-[#1b3b2b] antialiased selection:bg-[#1b3b2b] selection:text-white pb-20 overflow-x-hidden">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* 1. Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1b3b2b]/10"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 rounded-lg bg-[#1b3b2b]/5 text-[#1b3b2b]">
                <span className="material-symbols-outlined text-xl">grid_view</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1b3b2b] tracking-tight">
                Dining Room Floor Plan
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Live Database Telemetry ({totalTables} Tables)
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              100% Real PostgreSQL table layout and seat occupancy for <strong>{restaurantName}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setLoading(true);
                fetchFloorTelemetry().then(() => addToast("Synchronized", "Fetched live database tables.", "info"));
              }}
              disabled={loading}
              className="px-3.5 py-2 bg-white hover:bg-[#1b3b2b]/5 rounded-xl text-xs font-bold text-[#1b3b2b] border border-[#1b3b2b]/15 shadow-2xs cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-base ${loading ? "animate-spin" : ""}`}>refresh</span>
              <span>{loading ? "Syncing..." : "Sync Floor"}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleTurnaroundAllTables}
              className="px-4 py-2 bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              title="Sanitize and release all occupied tables for the next service"
            >
              <span className="material-symbols-outlined text-base text-[#E2B774]">cleaning_services</span>
              <span>Shift Turnaround</span>
            </motion.button>
          </div>
        </motion.div>

        {/* 2. KPI Metric Cards Strip */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="p-4 rounded-2xl bg-white border border-[#1b3b2b]/10 shadow-xs space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider">Floor Occupancy</span>
              <span className="material-symbols-outlined text-[#1b3b2b] text-lg">pie_chart</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#1b3b2b]">{occupancyRate}%</span>
              <span className="text-xs text-neutral-500 font-medium">({occupiedTables + reservedTables} / {totalTables})</span>
            </div>
            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${occupancyRate}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-[#1b3b2b] h-full rounded-full"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#1b3b2b]/10 shadow-xs space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider">Seated Diners</span>
              <span className="material-symbols-outlined text-[#C05621] text-lg">groups</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#C05621]">{occupiedSeats}</span>
              <span className="text-xs text-neutral-500 font-medium">of {totalSeats} capacity</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">
              Across {dynamicSections.length} sections
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#1b3b2b]/10 shadow-xs space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider">Available Tables</span>
              <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-700">{availableTables}</span>
              <span className="text-xs text-emerald-600 font-bold">Ready</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">Sanitized for walk-ins</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#1b3b2b]/10 shadow-xs space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider">Reserved Tables</span>
              <span className="material-symbols-outlined text-amber-600 text-lg">event_seat</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-700">{reservedTables}</span>
              <span className="text-xs text-neutral-500 font-medium">Booked</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">In database</p>
          </div>
        </motion.div>

        {/* 3. Filter Toolbar with Dynamic Sections Derived from DB */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-5 sm:p-6 rounded-3xl bg-white border border-[#1b3b2b]/10 shadow-sm space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-4 flex-wrap text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                <span className="font-bold text-emerald-800">Available ({availableTables})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
                <span className="font-bold text-rose-800">Occupied ({occupiedTables})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
                <span className="font-bold text-amber-800">Reserved ({reservedTables})</span>
              </div>
              <span className="text-neutral-300 hidden sm:inline">•</span>
              <span className="text-[11px] font-mono text-neutral-400">
                {filteredTables.length} of {totalTables} tables displayed
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setVipHighlightOnly((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${vipHighlightOnly
                    ? "bg-[#C05621] text-white border-[#C05621] shadow-xs"
                    : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                  }`}
                title="Filter high-capacity VIP & Party tables (6+ seats)"
              >
                <span className="material-symbols-outlined text-sm">stars</span>
                <span>VIP &amp; Large Tables</span>
              </motion.button>

              <div className="relative flex items-center">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 190, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden mr-2"
                    >
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search table/guest..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs text-[#1b3b2b] font-medium focus:outline-none focus:ring-1 focus:ring-[#1b3b2b]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={() => {
                    setIsSearchOpen((prev) => !prev);
                    if (isSearchOpen && searchQuery) setSearchQuery("");
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all ${isSearchOpen || searchQuery
                      ? "bg-[#1b3b2b] text-white border-[#1b3b2b] shadow-xs"
                      : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                    }`}
                  title={isSearchOpen ? "Close Search" : "Search Tables & Guests"}
                >
                  <span className="material-symbols-outlined text-lg">
                    {isSearchOpen ? "close" : "search"}
                  </span>
                </motion.button>
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-bold text-[#1b3b2b] focus:outline-none focus:ring-1 focus:ring-[#1b3b2b] cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available (Free)</option>
                <option value="occupied">Occupied (Seated)</option>
                <option value="reserved">Reserved / Assigned</option>
              </select>
            </div>
          </div>

          {/* Dynamic 4x2 Grid Derived From Real Tables */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {firstRowSections.map((item) => {
                const isActive = selectedZone === item.name;
                return (
                  <motion.button
                    key={item.name}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    type="button"
                    onClick={() => setSelectedZone(item.name)}
                    className={`relative p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 overflow-hidden ${isActive
                        ? "bg-[#1b3b2b] text-white border-[#1b3b2b] shadow-md shadow-[#1b3b2b]/15"
                        : "bg-gradient-to-b from-white to-neutral-50/70 text-[#1b3b2b] border-neutral-200 hover:border-[#1b3b2b]/40 hover:bg-white shadow-2xs"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`material-symbols-outlined text-lg ${isActive ? "text-[#E2B774]" : "text-[#1b3b2b]/70"}`}>
                        {item.icon}
                      </span>
                      <span className="text-xs font-bold truncate block">{item.label}</span>
                    </div>
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 ${isActive ? "bg-white/15 text-white border border-white/20" : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                        }`}
                    >
                      {item.count}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {secondRowSections.map((item) => {
                const isActive = selectedZone === item.name;
                return (
                  <motion.button
                    key={item.name}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    type="button"
                    onClick={() => setSelectedZone(item.name)}
                    className={`relative p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 overflow-hidden ${isActive
                        ? "bg-[#1b3b2b] text-white border-[#1b3b2b] shadow-md shadow-[#1b3b2b]/15"
                        : "bg-gradient-to-b from-white to-neutral-50/70 text-[#1b3b2b] border-neutral-200 hover:border-[#1b3b2b]/40 hover:bg-white shadow-2xs"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`material-symbols-outlined text-lg ${isActive ? "text-[#E2B774]" : "text-[#1b3b2b]/70"}`}>
                        {item.icon}
                      </span>
                      <span className="text-xs font-bold truncate block">{item.label}</span>
                    </div>
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 ${isActive ? "bg-white/15 text-white border border-white/20" : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                        }`}
                    >
                      {item.count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* 4. Dynamic Section Grids Generated From Database */}
        <div className="space-y-6">
          <AnimatePresence>
            {(selectedZone === "all" ? dynamicSections.map((s) => s.name) : [selectedZone]).map((secName) => {
              // Sort numerically so Table 1 -> Table 2 -> ... -> Table 12
              const secTables = filteredTables
                .filter((t) => t.section === secName)
                .sort((a, b) => {
                  const numA = parseInt(a.tableNumber.replace(/\D+/g, "") || "0", 10);
                  const numB = parseInt(b.tableNumber.replace(/\D+/g, "") || "0", 10);
                  return numA - numB;
                });

              if (secTables.length === 0) return null;

              return (
                <motion.div
                  key={secName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-[#1b3b2b]/10 shadow-xs hover:shadow-md transition-shadow space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 relative z-10">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#1b3b2b] text-xl">
                        {SECTION_ICONS[secName] || "table_restaurant"}
                      </span>
                      <h2 className="text-lg font-bold text-[#1b3b2b] tracking-tight">{secName}</h2>
                    </div>
                    <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-xl">
                      {secTables.length} Tables Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10">
                    {secTables.map((table) => {
                      const isOccupied = table.status === "occupied";
                      const isReserved = table.status === "reserved";
                      const isHighCap = table.capacity >= 6;

                      return (
                        <motion.div
                          key={table.id}
                          layout
                          whileHover={{ y: -4, transition: { duration: 0.2 } }}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden group shadow-2xs hover:shadow-md ${isOccupied
                              ? "bg-rose-50/50 border-rose-200/90"
                              : isReserved
                                ? "bg-amber-50/50 border-amber-200/90"
                                : "bg-white border-neutral-200/90 hover:border-[#1b3b2b]/40"
                            } ${isHighCap ? "ring-1 ring-amber-500/20" : ""}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-base text-[#1b3b2b]">{table.tableNumber}</span>
                                <span className="text-[11px] font-bold text-neutral-400">• {table.capacity}-Top</span>
                                {isHighCap && (
                                  <span className="material-symbols-outlined text-xs text-amber-600" title="High Capacity Table">
                                    stars
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-neutral-400 font-medium block mt-0.5">{table.section}</span>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${isOccupied
                                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                                  : isReserved
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                }`}
                            >
                              {table.status}
                            </span>
                          </div>

                          <div className="min-h-[44px] flex flex-col justify-center">
                            {table.currentGuest ? (
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-[#1b3b2b] block truncate flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm text-neutral-400">person</span>
                                  <span>{table.currentGuest}</span>
                                </span>
                                {table.currentReservationId && (
                                  <span className="text-[10px] text-neutral-400 font-mono block">
                                    Ref: #{table.currentReservationId.slice(-8)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-semibold italic flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Ready for walk-in guests
                              </span>
                            )}
                          </div>

                          <div className="pt-2 border-t border-neutral-100 flex items-center gap-1.5">
                            {table.status === "available" ? (
                              <>
                                <motion.button
                                  whileTap={{ scale: 0.96 }}
                                  type="button"
                                  onClick={() => {
                                    setActiveTableForModal(table);
                                    setGuestNameInput(table.currentGuest || "");
                                    setPartySizeInput(String(table.capacity));
                                  }}
                                  className="flex-1 py-1.5 px-2 bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white rounded-xl text-xs font-bold cursor-pointer text-center transition-colors shadow-2xs"
                                >
                                  Seat Table
                                </motion.button>
                                <motion.button
                                  whileTap={{ scale: 0.96 }}
                                  type="button"
                                  onClick={() => handleSetStatus(table, "reserved", "Reserved Guest")}
                                  className="py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-[#1b3b2b] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                                >
                                  Hold
                                </motion.button>
                              </>
                            ) : isOccupied ? (
                              <>
                                <motion.button
                                  whileTap={{ scale: 0.96 }}
                                  type="button"
                                  onClick={() => handleSetStatus(table, "available")}
                                  className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer text-center transition-colors shadow-2xs"
                                >
                                  Clear Table
                                </motion.button>
                                <motion.button
                                  whileTap={{ scale: 0.96 }}
                                  type="button"
                                  onClick={() => {
                                    setActiveTableForModal(table);
                                    setGuestNameInput(table.currentGuest || "");
                                    setPartySizeInput(String(table.capacity));
                                  }}
                                  className="py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-[#1b3b2b] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                                >
                                  Edit
                                </motion.button>
                              </>
                            ) : (
                              <>
                                <motion.button
                                  whileTap={{ scale: 0.96 }}
                                  type="button"
                                  onClick={() => {
                                    setActiveTableForModal(table);
                                    setGuestNameInput(table.currentGuest || "");
                                    setPartySizeInput(String(table.capacity));
                                  }}
                                  className="flex-1 py-1.5 px-2 bg-[#C05621] hover:bg-[#C05621]/90 text-white rounded-xl text-xs font-bold cursor-pointer text-center transition-colors shadow-2xs"
                                >
                                  Seat Now
                                </motion.button>
                                <motion.button
                                  whileTap={{ scale: 0.96 }}
                                  type="button"
                                  onClick={() => handleSetStatus(table, "available")}
                                  className="py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-[#1b3b2b] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                                >
                                  Release
                                </motion.button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* Quick Table Seating Dialog */}
      <AnimatePresence>
        {activeTableForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-[#1b3b2b]/5 text-[#1b3b2b]">
                    <span className="material-symbols-outlined text-lg">event_seat</span>
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[#1b3b2b]">Seat {activeTableForModal.tableNumber}</h3>
                    <span className="text-xs text-neutral-400 font-medium">
                      {activeTableForModal.section} • Capacity: {activeTableForModal.capacity} guests
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTableForModal(null)}
                  className="p-1 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <form onSubmit={handleConfirmSeating} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#1b3b2b] block mb-1">Guest Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anaiya Meherjabin"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    className="w-full bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-[#1b3b2b] focus:outline-none focus:ring-1 focus:ring-[#1b3b2b]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1b3b2b] block mb-1">Party Size *</label>
                  <input
                    type="number"
                    min="1"
                    max={activeTableForModal.capacity + 4}
                    value={partySizeInput}
                    onChange={(e) => setPartySizeInput(e.target.value)}
                    className="w-full bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-[#1b3b2b] focus:outline-none focus:ring-1 focus:ring-[#1b3b2b]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTableForModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Confirm Seating
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Animated Toasts */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto p-3.5 rounded-2xl border shadow-lg flex items-start gap-3 bg-white ${toast.type === "error"
                  ? "border-red-300 text-red-700"
                  : toast.type === "info"
                    ? "border-blue-300 text-blue-700"
                    : "border-emerald-300 text-emerald-800"
                }`}
            >
              <span className="material-symbols-outlined text-lg mt-0.5">
                {toast.type === "error" ? "error" : toast.type === "info" ? "info" : "check_circle"}
              </span>
              <div className="flex-1">
                <span className="font-semibold text-xs block">{toast.title}</span>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}