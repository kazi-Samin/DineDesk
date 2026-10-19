"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";

export default function AdminTransactionsPage() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_admin_sidebar");

  const transactions = [
    { id: "TXN-84920", restaurant: "The Maple & Vine", amount: "$99.00", method: "Visa •••• 4242", type: "Food Delivery", date: "Today, 18:24", status: "Settled" },
    { id: "TXN-84919", restaurant: "Midtown Bistro & Grill", amount: "$180.00", method: "Visa •••• 4092", type: "VIP Table Booking", date: "Today, 17:50", status: "Settled" },
    { id: "TXN-84918", restaurant: "The Brass Spoon", amount: "$75.50", method: "Mastercard •••• 1088", type: "Food Delivery", date: "Today, 17:15", status: "In Transit" },
    { id: "TXN-84917", restaurant: "SmashCraft Burger Studio", amount: "$44.00", method: "Apple Pay", type: "Express Pickup", date: "Today, 16:40", status: "Settled" },
  ];

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md antialiased flex flex-col">
      <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} onToggle={toggleSidebar} />
      <AdminHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

      <div className={`flex-1 flex flex-col pt-16 transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>
        <main className="relative flex-1 bg-background">
          <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
            <div className="pb-2 border-b border-outline-variant/40">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-bold">
                Financial Ledger
              </span>
              <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                All Transactions &amp; Payouts
              </h1>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                Live transactional volume, merchant commission splits, and settlement logs.
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low font-label-sm text-[11px] uppercase text-on-surface-variant tracking-wider border-b border-outline-variant/50">
                      <th className="py-3 px-5">Transaction ID</th>
                      <th className="py-3 px-5">Restaurant</th>
                      <th className="py-3 px-5">Channel</th>
                      <th className="py-3 px-5">Gross Amount</th>
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5 text-right">Settlement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 text-xs">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3 px-5 font-mono font-bold text-primary">{t.id}</td>
                        <td className="py-3 px-5 font-medium text-on-surface">{t.restaurant}</td>
                        <td className="py-3 px-5 text-on-surface-variant">{t.type} • {t.method}</td>
                        <td className="py-3 px-5 font-mono font-bold text-on-surface">{t.amount}</td>
                        <td className="py-3 px-5 text-on-surface-variant">{t.date}</td>
                        <td className="py-3 px-5 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            t.status === 'Settled' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container text-on-surface'
                          }`}>
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
    </div>
  );
}
