"use client";

import { useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";

interface DiningStation {
  id: string;
  name: string;
  code: string;
  area: string;
  tables: string;
  tableCount: number;
  capacity: number;
  lead: string;
  leadRole: string;
  status: "active" | "vip_hold" | "paused" | "turnover";
  turnTimeMinutes: number;
  currentCovers: number;
  kitchenLine: string;
}

const INITIAL_STATIONS: DiningStation[] = [
  {
    id: "zone-1",
    name: "Main Hearth Dining Room",
    code: "ZONE-HEARTH",
    area: "Ground Floor Center Hearth",
    tables: "Tables 1 – 10",
    tableCount: 10,
    capacity: 42,
    lead: "Sarah Jenkins",
    leadRole: "Dining Room Lead",
    status: "active",
    turnTimeMinutes: 78,
    currentCovers: 36,
    kitchenLine: "Wood-Fired Grill & Primary Line",
  },
  {
    id: "zone-2",
    name: "Wine Cellar Private Reserve",
    code: "ZONE-CELLAR",
    area: "Sub-Level Historic Vault",
    tables: "Tables 11 – 14",
    tableCount: 4,
    capacity: 18,
    lead: "Thomas Hayes",
    leadRole: "Head Sommelier",
    status: "vip_hold",
    turnTimeMinutes: 115,
    currentCovers: 14,
    kitchenLine: "Chef's Tasting & Sommelier Pairing Pass",
  },
  {
    id: "zone-3",
    name: "Garden Patio & Pergola",
    code: "ZONE-PATIO",
    area: "Terrace Hearth & Heated Pergola",
    tables: "Tables 15 – 18",
    tableCount: 4,
    capacity: 16,
    lead: "Arthur Pendelton",
    leadRole: "Operations Lead",
    status: "active",
    turnTimeMinutes: 65,
    currentCovers: 12,
    kitchenLine: "Outdoor Hearth & Small Plates",
  },
  {
    id: "zone-4",
    name: "Chef's Tasting Counter & Bar",
    code: "ZONE-CHEF",
    area: "Exhibition Hearth Frontage",
    tables: "Tables 19 – 22",
    tableCount: 4,
    capacity: 8,
    lead: "David Miller",
    leadRole: "Floor Expediter",
    status: "active",
    turnTimeMinutes: 90,
    currentCovers: 8,
    kitchenLine: "Direct Chef Pass (Exhibition)",
  },
];

export default function AdminRestaurantsPage() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_admin_sidebar");
  const [stations, setStations] = useState<DiningStation[]>(INITIAL_STATIONS);
  const [filter, setFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [kitchenPacingHold, setKitchenPacingHold] = useState<boolean>(false);
  const [activeStationModal, setActiveStationModal] = useState<DiningStation | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleStationStatus = (id: string) => {
    setStations((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextStatus: DiningStation["status"] =
          s.status === "active" ? "paused" : s.status === "paused" ? "vip_hold" : "active";
        return { ...s, status: nextStatus };
      })
    );
    const station = stations.find((s) => s.id === id);
    showToast(`Updated status for "${station?.name}"`);
  };

  const handleTogglePacingHold = () => {
    const nextState = !kitchenPacingHold;
    setKitchenPacingHold(nextState);
    if (nextState) {
      showToast("Kitchen Pacing Hold ENFORCED: New walk-ins paused across all stations.");
    } else {
      showToast("Kitchen Pacing Hold RELEASED: Standard floor seating resumed.");
    }
  };

  const handlePrintRunSheet = () => {
    showToast("Generating Floor Seating Run Sheet for Evening Service...");
    setTimeout(() => {
      window.print();
    }, 600);
  };

  const totalCapacity = stations.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupied = stations.reduce((acc, s) => acc + s.currentCovers, 0);
  const occupancyPct = Math.round((totalOccupied / totalCapacity) * 100);

  const filtered = stations.filter((s) => {
    if (filter === "active") return s.status === "active";
    if (filter === "vip") return s.status === "vip_hold";
    if (filter === "paused") return s.status === "paused";
    return true;
  });

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md antialiased flex flex-col">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
        pendingApprovalsCount={0}
      />
      <AdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <div className={`flex-1 flex flex-col pt-16 transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>
        <main className="relative flex-1 bg-background">
          <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-7 max-w-7xl mx-auto w-full">
            {/* Top Navigation & Status Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-outline-variant/40">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-bold">
                    Venue Infrastructure &amp; Floor Plan
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
                    Corktown, Detroit
                  </span>
                </div>
                <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                  Venue &amp; Floor Stations
                </h1>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5">
                  Administrative oversight for The Maple &amp; Vine. Manage dining room allocations, station leads, seating capacity, and kitchen pacing overrides.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleTogglePacingHold}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                    kitchenPacingHold
                      ? "bg-amber-600 text-white border-amber-700 animate-pulse"
                      : "bg-surface-container-low hover:bg-surface-container text-on-surface border-outline-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {kitchenPacingHold ? "pause_circle" : "speed"}
                  </span>
                  <span>{kitchenPacingHold ? "Pacing Hold Active" : "Kitchen Pacing Hold"}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintRunSheet}
                  className="flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface px-3 py-2 rounded-xl text-xs font-semibold border border-outline-variant/70 shadow-2xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  <span>Seating Run Sheet</span>
                </button>

                <Link
                  href="/dashboard/vendor"
                  className="flex items-center gap-1.5 bg-primary-container text-on-primary hover:bg-primary px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">room_service</span>
                  <span>Open GM Floor Console</span>
                </Link>
              </div>
            </div>

            {/* Master Venue Profile Card */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xs p-5 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left 7 cols: Venue Branding & Credentials */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
                      <span className="material-symbols-outlined text-xs">verified</span> Flagship Venue
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold">
                      <span className="material-symbols-outlined text-xs">license</span> MI Liquor Lic #MI-LL-84092
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                      <span className="material-symbols-outlined text-xs">health_and_safety</span> Health Grade A (98/100)
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                      The Maple &amp; Vine
                    </h2>
                    <p className="text-xs sm:text-sm text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                      <span className="material-symbols-outlined text-sm text-secondary">location_on</span>
                      2414 Michigan Ave, Corktown, Detroit, MI 48216 • Est. 2021
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-outline-variant/40 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">
                        General Manager
                      </span>
                      <span className="font-semibold text-on-surface block mt-0.5">Marcus Vance</span>
                      <span className="text-[11px] text-on-surface-variant font-mono">(313) 555-0142</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">
                        Executive Floor Lead
                      </span>
                      <span className="font-semibold text-on-surface block mt-0.5">Sarah Jenkins</span>
                      <span className="text-[11px] text-on-surface-variant">Front of House Lead</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">
                        Dining Service Hours
                      </span>
                      <span className="font-semibold text-on-surface block mt-0.5">Tue – Sun: 5:00 PM – 11:00 PM</span>
                      <span className="text-[11px] text-emerald-600 font-semibold">Active Service Tonight</span>
                    </div>
                  </div>
                </div>

                {/* Right 5 cols: Live Occupancy & Station Capacity Telemetry */}
                <div className="lg:col-span-5 bg-surface-container-low rounded-xl p-4 sm:p-5 border border-outline-variant/60 flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-secondary">analytics</span>
                      Live Seating Utilization
                    </span>
                    <span className="font-mono text-xs font-bold text-primary">
                      {totalOccupied} / {totalCapacity} Covers
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-2xl font-bold text-primary">{occupancyPct}%</span>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Pacing Balanced
                      </span>
                    </div>
                    <div className="w-full bg-surface-dim h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-700"
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/40">
                      <span className="font-bold text-primary block text-sm">4</span>
                      <span className="text-[10px] text-on-surface-variant">Dining Zones</span>
                    </div>
                    <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/40">
                      <span className="font-bold text-primary block text-sm">22</span>
                      <span className="text-[10px] text-on-surface-variant">Total Tables</span>
                    </div>
                    <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/40">
                      <span className="font-bold text-primary block text-sm">76m</span>
                      <span className="text-[10px] text-on-surface-variant">Avg Turn Time</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stations Filter & Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-headline-sm text-lg font-bold text-primary tracking-tight">
                  Dining Room Zones &amp; Station Leads
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Configure real-time station availability, floor supervisors, and table allocations.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant text-xs self-start sm:self-auto">
                {[
                  { key: "all", label: "All Stations" },
                  { key: "active", label: "Floor Open" },
                  { key: "vip", label: "VIP Hold" },
                  { key: "paused", label: "Paused" },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setFilter(t.key)}
                    className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all cursor-pointer ${
                      filter === t.key
                        ? "bg-primary-container text-on-primary font-bold shadow-2xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stations Interactive Table */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low font-label-sm text-[11px] uppercase text-on-surface-variant tracking-wider border-b border-outline-variant/50">
                      <th className="py-3 px-5">Station Name &amp; Zone</th>
                      <th className="py-3 px-5">Table Range &amp; Capacity</th>
                      <th className="py-3 px-5">Station Lead</th>
                      <th className="py-3 px-5">Kitchen Pass</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Station Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 text-xs">
                    {filtered.map((station) => (
                      <tr key={station.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold">
                              <span className="material-symbols-outlined text-lg">table_restaurant</span>
                            </div>
                            <div>
                              <span className="font-bold text-on-surface block text-sm">{station.name}</span>
                              <span className="text-[11px] text-on-surface-variant">{station.area}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-on-surface">{station.tables}</span>
                            <span className="text-[11px] text-on-surface-variant">
                              {station.capacity} Seats ({station.tableCount} Tables) • {station.currentCovers} Seated
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-on-surface">{station.lead}</span>
                            <span className="text-[11px] text-on-surface-variant">{station.leadRole}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="flex flex-col">
                            <span className="font-medium text-on-surface">{station.kitchenLine}</span>
                            <span className="text-[11px] text-on-surface-variant font-mono">
                              Avg Turn: {station.turnTimeMinutes}m
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          {station.status === "active" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              Floor Open
                            </span>
                          ) : station.status === "vip_hold" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold">
                              <span className="material-symbols-outlined text-xs">star</span> VIP Reserve
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-[11px] font-bold">
                              <span className="material-symbols-outlined text-xs">pause</span> Paused
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleStationStatus(station.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors cursor-pointer"
                              title="Toggle station status"
                            >
                              {station.status === "active" ? "Pause Zone" : "Activate"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveStationModal(station)}
                              className="px-2.5 py-1.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                            >
                              Floor Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Station Details Modal */}
      {activeStationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-outline-variant shadow-xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-outline-variant/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                  <span className="material-symbols-outlined text-lg">table_restaurant</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-primary">{activeStationModal.name}</h3>
                  <span className="text-[11px] font-mono text-on-surface-variant">{activeStationModal.code}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveStationModal(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/40 flex justify-between">
                <span className="text-on-surface-variant">Allocated Tables</span>
                <span className="font-bold text-on-surface">{activeStationModal.tables} ({activeStationModal.tableCount} tables)</span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/40 flex justify-between">
                <span className="text-on-surface-variant">Max Seating Capacity</span>
                <span className="font-bold text-on-surface">{activeStationModal.capacity} Seats</span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/40 flex justify-between">
                <span className="text-on-surface-variant">Station Supervisor</span>
                <span className="font-bold text-on-surface">{activeStationModal.lead} ({activeStationModal.leadRole})</span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/40 flex justify-between">
                <span className="text-on-surface-variant">Designated Kitchen Line</span>
                <span className="font-bold text-on-surface">{activeStationModal.kitchenLine}</span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/40 flex justify-between">
                <span className="text-on-surface-variant">Average Turn Duration</span>
                <span className="font-bold text-on-surface">{activeStationModal.turnTimeMinutes} Minutes</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/40">
              <button
                type="button"
                onClick={() => setActiveStationModal(null)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface cursor-pointer"
              >
                Close
              </button>
              <Link
                href="/dashboard/vendor"
                className="px-4 py-2 rounded-xl bg-primary-container text-on-primary hover:bg-primary text-xs font-semibold shadow-2xs cursor-pointer"
              >
                Launch GM Floor Plan
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-lg border border-outline-variant/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
