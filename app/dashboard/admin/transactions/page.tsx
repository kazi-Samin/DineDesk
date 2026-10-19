"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { downloadAdminCsv } from "@/services/mockAdminService";

interface TransactionRecord {
  id: string;
  tableOrChannel: string;
  station: string;
  guestName: string;
  grossAmount: number;
  tipAmount: number;
  method: string;
  type: "Dine-in Floor" | "VIP Tasting" | "Chef Counter" | "Curbside Takeaway";
  timestamp: string;
  status: "Settled" | "Processing" | "Refunded";
}

const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: "TXN-84924",
    tableOrChannel: "Table 12 (4 Guests)",
    station: "Wine Cellar Private Reserve",
    guestName: "Arthur Pendelton",
    grossAmount: 385.0,
    tipAmount: 69.3,
    method: "Amex Centurion •••• 1004",
    type: "VIP Tasting",
    timestamp: "Today, 19:42 EST",
    status: "Settled",
  },
  {
    id: "TXN-84923",
    tableOrChannel: "Table 04 (2 Guests)",
    station: "Main Hearth Dining Room",
    guestName: "Sarah Lin",
    grossAmount: 192.5,
    tipAmount: 38.5,
    method: "Visa •••• 4242",
    type: "Dine-in Floor",
    timestamp: "Today, 19:15 EST",
    status: "Settled",
  },
  {
    id: "TXN-84922",
    tableOrChannel: "Table 20 (2 Guests)",
    station: "Chef's Tasting Counter",
    guestName: "Marcus Vance",
    grossAmount: 270.0,
    tipAmount: 54.0,
    method: "Mastercard •••• 1088",
    type: "Chef Counter",
    timestamp: "Today, 18:50 EST",
    status: "Settled",
  },
  {
    id: "TXN-84921",
    tableOrChannel: "Table 16 (3 Guests)",
    station: "Garden Patio & Pergola",
    guestName: "Emily Watson",
    grossAmount: 145.0,
    tipAmount: 26.1,
    method: "Apple Pay",
    type: "Dine-in Floor",
    timestamp: "Today, 18:24 EST",
    status: "Settled",
  },
  {
    id: "TXN-84920",
    tableOrChannel: "Curbside Order #602",
    station: "Express Dispatch",
    guestName: "David Miller",
    grossAmount: 68.5,
    tipAmount: 10.0,
    method: "Visa •••• 9012",
    type: "Curbside Takeaway",
    timestamp: "Today, 17:55 EST",
    status: "Settled",
  },
  {
    id: "TXN-84919",
    tableOrChannel: "Table 08 (4 Guests)",
    station: "Main Hearth Dining Room",
    guestName: "Jordan Miller",
    grossAmount: 215.0,
    tipAmount: 43.0,
    method: "Visa •••• 3341",
    type: "Dine-in Floor",
    timestamp: "Today, 17:30 EST",
    status: "Settled",
  },
  {
    id: "TXN-84918",
    tableOrChannel: "Table 14 (6 Guests)",
    station: "Wine Cellar Private Reserve",
    guestName: "Kazi Rezwan",
    grossAmount: 540.0,
    tipAmount: 108.0,
    method: "Amex •••• 2911",
    type: "VIP Tasting",
    timestamp: "Today, 16:45 EST",
    status: "Settled",
  },
  {
    id: "TXN-84917",
    tableOrChannel: "Table 19 (1 Guest)",
    station: "Chef's Tasting Counter",
    guestName: "Thomas Hayes",
    grossAmount: 135.0,
    tipAmount: 27.0,
    method: "Discover •••• 8820",
    type: "Chef Counter",
    timestamp: "Today, 16:10 EST",
    status: "Settled",
  },
];

export default function AdminTransactionsPage() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_admin_sidebar");
  const [transactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [filter, setFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportCsv = () => {
    const headers = ["Check ID", "Table / Channel", "Station", "Guest", "Gross ($)", "Gratuity ($)", "Method", "Type", "Timestamp", "Status"];
    const rows = transactions.map((t) => [
      t.id,
      t.tableOrChannel,
      t.station,
      t.guestName,
      `$${t.grossAmount.toFixed(2)}`,
      `$${t.tipAmount.toFixed(2)}`,
      t.method,
      t.type,
      t.timestamp,
      t.status,
    ]);
    downloadAdminCsv("maple-vine-transactions.csv", [headers, ...rows]);
    showToast("Transaction ledger exported as CSV.");
  };

  const filtered = transactions.filter((t) => {
    if (filter === "floor") return t.type === "Dine-in Floor";
    if (filter === "vip") return t.type === "VIP Tasting";
    if (filter === "chef") return t.type === "Chef Counter";
    if (filter === "curbside") return t.type === "Curbside Takeaway";
    return true;
  });

  const totalGross = transactions.reduce((acc, t) => acc + t.grossAmount, 0);
  const totalTips = transactions.reduce((acc, t) => acc + t.tipAmount, 0);
  const avgCheck = (totalGross / transactions.length).toFixed(2);

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md antialiased flex flex-col">
      <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} onToggle={toggleSidebar} />
      <AdminHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

      <div className={`flex-1 flex flex-col pt-16 transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>
        <main className="relative flex-1 bg-background">
          <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
            {/* Header with Title & Action */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-outline-variant/40">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-bold">
                    Financial Ledger &amp; Cashier Reconciliation
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
                    The Maple &amp; Vine (Detroit, MI)
                  </span>
                </div>
                <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                  Guest Checks &amp; Settlements
                </h1>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5">
                  Real-time guest checks, dining station revenues, gratuity distribution, and merchant ACH disbursements.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface px-3.5 py-2 rounded-xl text-xs font-semibold border border-outline-variant/70 shadow-2xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">file_download</span>
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Financial Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-2xs flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Total Shift Gross
                </span>
                <span className="text-2xl font-bold text-primary mt-1">${totalGross.toFixed(2)}</span>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1">Across {transactions.length} Guest Checks</span>
              </div>

              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-2xs flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Average Table Check
                </span>
                <span className="text-2xl font-bold text-primary mt-1">${avgCheck}</span>
                <span className="text-[11px] text-primary font-semibold mt-1">+14.2% vs target benchmark</span>
              </div>

              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-2xs flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Staff Gratuities (FOH)
                </span>
                <span className="text-2xl font-bold text-secondary mt-1">${totalTips.toFixed(2)}</span>
                <span className="text-[11px] text-on-surface-variant mt-1">Pooled distribution tonight</span>
              </div>

              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-2xs flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Bank Settlement (ACH)
                </span>
                <span className="text-2xl font-bold text-emerald-700 mt-1">Fifth Third</span>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1">Next payout: Midnight EST</span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant text-xs self-start">
              {[
                { key: "all", label: "All Checks" },
                { key: "floor", label: "Main Floor" },
                { key: "vip", label: "Wine Cellar" },
                { key: "chef", label: "Chef Counter" },
                { key: "curbside", label: "Takeaway" },
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

            {/* Transactions Ledger Table */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low font-label-sm text-[11px] uppercase text-on-surface-variant tracking-wider border-b border-outline-variant/50">
                      <th className="py-3 px-5">Check ID</th>
                      <th className="py-3 px-5">Table &amp; Station</th>
                      <th className="py-3 px-5">Guest Name</th>
                      <th className="py-3 px-5">Payment Method</th>
                      <th className="py-3 px-5">Gross Amount</th>
                      <th className="py-3 px-5">Gratuity</th>
                      <th className="py-3 px-5">Time</th>
                      <th className="py-3 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 text-xs">
                    {filtered.map((t) => (
                      <tr key={t.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-primary">{t.id}</td>
                        <td className="py-3.5 px-5">
                          <div>
                            <span className="font-bold text-on-surface block">{t.tableOrChannel}</span>
                            <span className="text-[11px] text-on-surface-variant">{t.station}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-medium text-on-surface">{t.guestName}</td>
                        <td className="py-3.5 px-5 text-on-surface-variant">{t.method}</td>
                        <td className="py-3.5 px-5 font-mono font-bold text-on-surface">${t.grossAmount.toFixed(2)}</td>
                        <td className="py-3.5 px-5 font-mono text-secondary font-semibold">${t.tipAmount.toFixed(2)}</td>
                        <td className="py-3.5 px-5 text-on-surface-variant">{t.timestamp}</td>
                        <td className="py-3.5 px-5 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
                            <span className="material-symbols-outlined text-xs">check</span>
                            {t.status}
                          </span>
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

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-lg border border-outline-variant/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
