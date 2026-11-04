// app/dashboard/admin/restaurants/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

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
    <div className="w-full flex-1 bg-[#FBFBFA] text-[#1b3b2b] font-body-md antialiased">
      <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-7 max-w-7xl mx-auto w-full">
        {/* Top Navigation & Status Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1b3b2b]/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-amber-800 font-bold">
                Venue Infrastructure &amp; Floor Plan
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2B774]" />
              <span className="text-[11px] text-neutral-500 font-medium">
                Corktown, Detroit
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1b3b2b] tracking-tight">
              Venue &amp; Floor Stations
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Administrative oversight for The Maple &amp; Vine. Manage dining room allocations, station leads, seating capacity, and kitchen pacing overrides.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleTogglePacingHold}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${kitchenPacingHold
                  ? "bg-amber-600 text-white border-amber-700 animate-pulse"
                  : "bg-white hover:bg-neutral-50 text-[#1b3b2b] border-[#1b3b2b]/15"
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
              className="flex items-center gap-1.5 bg-white hover:bg-neutral-50 text-[#1b3b2b] px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#1b3b2b]/15 shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>Seating Run Sheet</span>
            </button>

            <Link
              href="/dashboard/vendor"
              className="flex items-center gap-1.5 bg-[#1b3b2b] text-white hover:bg-[#152e22] px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#E2B774]">room_service</span>
              <span>Open GM Floor Console</span>
            </Link>
          </div>
        </div>

        {/* Master Venue Profile Card */}
        <div className="bg-white rounded-2xl border border-[#1b3b2b]/10 shadow-xs p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left 7 cols: Venue Branding & Credentials */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1b3b2b] text-[#E2B774] text-[11px] font-bold">
                  <span className="material-symbols-outlined text-xs text-[#E2B774]">verified</span> Flagship Venue
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 text-[11px] font-bold">
                  <span className="material-symbols-outlined text-xs">license</span> MI Liquor Lic #MI-LL-84092
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-[11px] font-bold">
                  <span className="material-symbols-outlined text-xs text-emerald-600">health_and_safety</span> Health Grade A (98/100)
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1b3b2b] tracking-tight">
                  The Maple &amp; Vine
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 flex items-center gap-1.5 mt-0.5">
                  <span className="material-symbols-outlined text-sm text-[#E2B774]">location_on</span>
                  2414 Michigan Ave, Corktown, Detroit, MI 48216 • Est. 2021
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[#1b3b2b]/10 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                    General Manager
                  </span>
                  <span className="font-semibold text-[#1b3b2b] block mt-0.5">Marcus Vance</span>
                  <span className="text-[11px] text-neutral-500 font-mono">(313) 555-0142</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                    Executive Floor Lead
                  </span>
                  <span className="font-semibold text-[#1b3b2b] block mt-0.5">Sarah Jenkins</span>
                  <span className="text-[11px] text-neutral-500">Front of House Lead</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                    Dining Service Hours
                  </span>
                  <span className="font-semibold text-[#1b3b2b] block mt-0.5">Tue – Sun: 5:00 PM – 11:00 PM</span>
                  <span className="text-[11px] text-emerald-700 font-semibold">Active Service Tonight</span>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Live Occupancy & Station Capacity Telemetry */}
            <div className="lg:col-span-5 bg-[#f4f7f5] rounded-xl p-4 sm:p-5 border border-[#1b3b2b]/10 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1b3b2b]/10">
                <span className="text-xs font-bold text-[#1b3b2b] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#E2B774]">analytics</span>
                  Live Seating Utilization
                </span>
                <span className="font-mono text-xs font-bold text-[#1b3b2b]">
                  {totalOccupied} / {totalCapacity} Covers
                </span>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-2xl font-bold text-[#1b3b2b]">{occupancyPct}%</span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    Pacing Balanced
                  </span>
                </div>
                <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#1b3b2b] h-full rounded-full transition-all duration-700"
                    style={{ width: `${occupancyPct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="bg-white p-2 rounded-lg border border-[#1b3b2b]/10 shadow-2xs">
                  <span className="font-bold text-[#1b3b2b] block text-sm">4</span>
                  <span className="text-[10px] text-neutral-500">Dining Zones</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#1b3b2b]/10 shadow-2xs">
                  <span className="font-bold text-[#1b3b2b] block text-sm">22</span>
                  <span className="text-[10px] text-neutral-500">Total Tables</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#1b3b2b]/10 shadow-2xs">
                  <span className="font-bold text-[#1b3b2b] block text-sm">76m</span>
                  <span className="text-[10px] text-neutral-500">Avg Turn Time</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stations Filter & Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#1b3b2b] tracking-tight">
              Dining Room Zones &amp; Station Leads
            </h3>
            <p className="text-xs text-neutral-500">
              Configure real-time station availability, floor supervisors, and table allocations.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#f4f7f5] p-1 rounded-xl border border-[#1b3b2b]/10 text-xs self-start sm:self-auto">
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
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all cursor-pointer ${filter === t.key
                    ? "bg-[#1b3b2b] text-white shadow-2xs font-bold"
                    : "text-neutral-600 hover:text-[#1b3b2b]"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stations Interactive Table */}
        <div className="bg-white rounded-xl border border-[#1b3b2b]/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f4f7f5] text-[11px] uppercase text-neutral-500 font-bold tracking-wider border-b border-[#1b3b2b]/10">
                  <th className="py-3 px-5">Station Name &amp; Zone</th>
                  <th className="py-3 px-5">Table Range &amp; Capacity</th>
                  <th className="py-3 px-5">Station Lead</th>
                  <th className="py-3 px-5">Kitchen Pass</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Station Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b3b2b]/10 text-xs">
                {filtered.map((station) => (
                  <tr key={station.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#1b3b2b]/5 flex items-center justify-center text-[#1b3b2b] font-bold">
                          <span className="material-symbols-outlined text-lg">table_restaurant</span>
                        </div>
                        <div>
                          <span className="font-bold text-[#1b3b2b] block text-sm">{station.name}</span>
                          <span className="text-[11px] text-neutral-500">{station.area}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#1b3b2b]">{station.tables}</span>
                        <span className="text-[11px] text-neutral-500">
                          {station.capacity} Seats ({station.tableCount} Tables) • {station.currentCovers} Seated
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#1b3b2b]">{station.lead}</span>
                        <span className="text-[11px] text-neutral-500">{station.leadRole}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#1b3b2b]">{station.kitchenLine}</span>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          Avg Turn: {station.turnTimeMinutes}m
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      {station.status === "active" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Floor Open
                        </span>
                      ) : station.status === "vip_hold" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] font-bold">
                          <span className="material-symbols-outlined text-xs text-[#E2B774]">star</span> VIP Reserve
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 border border-rose-200/80 text-rose-900 text-[11px] font-bold">
                          <span className="material-symbols-outlined text-xs">pause</span> Paused
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleStationStatus(station.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[#1b3b2b] text-xs font-semibold transition-colors cursor-pointer"
                          title="Toggle station status"
                        >
                          {station.status === "active" ? "Pause Zone" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveStationModal(station)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#1b3b2b] text-white hover:bg-[#152e22] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
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

      {/* Station Details Modal */}
      {activeStationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1b3b2b]/40 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl border border-[#1b3b2b]/15 shadow-xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-[#1b3b2b]/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1b3b2b] text-[#E2B774] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">table_restaurant</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1b3b2b]">{activeStationModal.name}</h3>
                  <span className="text-[11px] font-mono text-neutral-500">{activeStationModal.code}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveStationModal(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="bg-[#f4f7f5] p-3 rounded-xl border border-[#1b3b2b]/10 flex justify-between">
                <span className="text-neutral-500">Allocated Tables</span>
                <span className="font-bold text-[#1b3b2b]">{activeStationModal.tables} ({activeStationModal.tableCount} tables)</span>
              </div>
              <div className="bg-[#f4f7f5] p-3 rounded-xl border border-[#1b3b2b]/10 flex justify-between">
                <span className="text-neutral-500">Max Seating Capacity</span>
                <span className="font-bold text-[#1b3b2b]">{activeStationModal.capacity} Seats</span>
              </div>
              <div className="bg-[#f4f7f5] p-3 rounded-xl border border-[#1b3b2b]/10 flex justify-between">
                <span className="text-neutral-500">Station Supervisor</span>
                <span className="font-bold text-[#1b3b2b]">{activeStationModal.lead} ({activeStationModal.leadRole})</span>
              </div>
              <div className="bg-[#f4f7f5] p-3 rounded-xl border border-[#1b3b2b]/10 flex justify-between">
                <span className="text-neutral-500">Designated Kitchen Line</span>
                <span className="font-bold text-[#1b3b2b]">{activeStationModal.kitchenLine}</span>
              </div>
              <div className="bg-[#f4f7f5] p-3 rounded-xl border border-[#1b3b2b]/10 flex justify-between">
                <span className="text-neutral-500">Average Turn Duration</span>
                <span className="font-bold text-[#1b3b2b]">{activeStationModal.turnTimeMinutes} Minutes</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1b3b2b]/10">
              <button
                type="button"
                onClick={() => setActiveStationModal(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-[#1b3b2b] cursor-pointer"
              >
                Close
              </button>
              <Link
                href="/dashboard/vendor"
                className="px-4 py-2 rounded-xl bg-[#1b3b2b] text-white hover:bg-[#152e22] text-xs font-semibold shadow-2xs cursor-pointer"
              >
                Launch GM Floor Plan
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1b3b2b] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#E2B774]/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[#E2B774] text-base">check_circle</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}