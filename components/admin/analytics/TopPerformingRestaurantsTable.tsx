"use client";

import { useState } from "react";
import Image from "next/image";
import { VendorPerformance } from "@/types/admin";

interface TopPerformingRestaurantsTableProps {
  vendors: VendorPerformance[];
  onInspectVendor?: (vendor: VendorPerformance) => void;
}

export default function TopPerformingRestaurantsTable({
  vendors,
  onInspectVendor,
}: TopPerformingRestaurantsTableProps) {
  const [sortBy, setSortBy] = useState<"gmv" | "rating" | "volume">("gmv");
  const [selectedVendorModal, setSelectedVendorModal] = useState<VendorPerformance | null>(null);

  // Sort vendors dynamically
  const sortedVendors = [...vendors].sort((a, b) => {
    if (sortBy === "gmv") return b.revenue - a.revenue;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "volume") return b.orders - a.orders;
    return 0;
  });

  const getAuditBadgeStyle = (audit?: string) => {
    switch (audit) {
      case "Exemplary":
        return "bg-primary-fixed text-on-primary-fixed border border-primary-fixed-dim";
      case "Audited":
        return "bg-secondary-fixed text-on-secondary-fixed border border-secondary-fixed-dim";
      default:
        return "bg-surface-container-high text-on-surface border border-outline-variant";
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xs overflow-hidden">
      {/* Table Header Section */}
      <div className="p-5 sm:p-6 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-headline-sm text-base sm:text-lg font-bold text-primary">
              Top Performing Culinary Hubs
            </h3>
            <span className="text-[11px] font-semibold text-secondary bg-secondary-fixed px-2 py-0.5 rounded-full">
              Tier 1 Merchants
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Merchant-level GMV contribution, operational fidelity, and guest review sentiment.
          </p>
        </div>

        {/* Sort Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-on-surface-variant hidden sm:inline">Order by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "gmv" | "rating" | "volume")}
            className="bg-surface-container-low border border-outline-variant text-on-surface text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-primary cursor-pointer"
          >
            <option value="gmv">Highest GMV Yield</option>
            <option value="rating">Top Customer Rating</option>
            <option value="volume">Highest Order Volume</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/60 bg-surface-container-low/50 text-[11px] uppercase font-bold text-on-surface-variant tracking-wider">
              <th className="py-3 px-4 sm:px-6">Merchant & Hub</th>
              <th className="py-3 px-4">Service Profile</th>
              <th className="py-3 px-4 text-right">Volume</th>
              <th className="py-3 px-4 text-right">GMV Contribution</th>
              <th className="py-3 px-4 text-center">Guest Rating</th>
              <th className="py-3 px-4">Fulfillment</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 sm:px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50 text-xs">
            {sortedVendors.map((vendor, idx) => (
              <tr
                key={vendor.id}
                className="hover:bg-surface-container-low/60 transition-colors group"
              >
                {/* 1. Merchant & Hub */}
                <td className="py-3.5 px-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-on-surface-variant w-4">
                      #{idx + 1}
                    </span>
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-surface-container shrink-0 border border-outline-variant/60">
                      {vendor.image ? (
                        <Image
                          src={vendor.image}
                          alt={vendor.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="40px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary text-on-primary font-bold text-xs">
                          {vendor.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-on-surface group-hover:text-primary transition-colors text-xs sm:text-sm">
                        {vendor.name}
                      </p>
                      <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-secondary">
                          location_on
                        </span>
                        <span>{vendor.area}</span>
                      </p>
                    </div>
                  </div>
                </td>

                {/* 2. Service Profile */}
                <td className="py-3.5 px-4 text-on-surface-variant text-[11px] font-medium">
                  {vendor.coversLabel || vendor.badge}
                </td>

                {/* 3. Order Volume */}
                <td className="py-3.5 px-4 text-right">
                  <span className="font-bold text-on-surface block">
                    {vendor.orders.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-on-surface-variant block">
                    {vendor.reviewCount ? `${vendor.reviewCount} reviews` : "orders"}
                  </span>
                </td>

                {/* 4. GMV Contribution */}
                <td className="py-3.5 px-4 text-right">
                  <span className="font-bold text-primary font-headline-sm text-sm block">
                    ৳{vendor.revenue.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold text-secondary block">
                    {vendor.targetComparison || "+14.2% vs target"}
                  </span>
                </td>

                {/* 5. Rating */}
                <td className="py-3.5 px-4 text-center">
                  <div className="inline-flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-lg">
                    <span className="material-symbols-outlined text-[13px] text-amber-600 fill-amber-600">
                      star
                    </span>
                    <span className="font-bold text-on-surface text-xs">
                      {vendor.rating.toFixed(2)}
                    </span>
                  </div>
                </td>

                {/* 6. Fulfillment Rate */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col gap-1 min-w-[90px]">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-on-surface">{vendor.fulfillmentRate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(vendor.fulfillmentRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* 7. Audit Status */}
                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight ${getAuditBadgeStyle(
                      vendor.auditBadge
                    )}`}
                  >
                    {vendor.auditBadge || "Standard"}
                  </span>
                </td>

                {/* 8. Action */}
                <td className="py-3.5 px-4 sm:px-6 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      if (onInspectVendor) {
                        onInspectVendor(vendor);
                      } else {
                        setSelectedVendorModal(vendor);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-secondary bg-surface-container-low hover:bg-surface-container px-2.5 py-1 rounded-lg border border-outline-variant transition-colors cursor-pointer"
                  >
                    <span>View Ledger</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info Bar */}
      <div className="p-4 bg-surface-container-low/40 border-t border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-on-surface-variant">
        <span>Showing top 5 Tier-1 high-density commercial partners</span>
        <span className="font-medium text-on-surface">Total Group Yield: ৳12,200,000 (82.1% of sector total)</span>
      </div>

      {/* Quick Vendor Detail Modal */}
      {selectedVendorModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedVendorModal(null)}
        >
          <div
            className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-outline-variant shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/50">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-surface-container shrink-0 border border-outline-variant/60">
                  {selectedVendorModal.image ? (
                    <Image
                      src={selectedVendorModal.image}
                      alt={selectedVendorModal.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-on-primary font-bold">
                      {selectedVendorModal.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary font-headline-sm">
                    {selectedVendorModal.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant">{selectedVendorModal.area}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVendorModal(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-surface-container-low p-3 rounded-xl">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">
                  Total GMV
                </span>
                <span className="text-base font-bold text-primary font-headline-sm mt-0.5 block">
                  ৳{selectedVendorModal.revenue.toLocaleString()}
                </span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-xl">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">
                  Orders Fulfilled
                </span>
                <span className="text-base font-bold text-primary font-headline-sm mt-0.5 block">
                  {selectedVendorModal.orders.toLocaleString()}
                </span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-xl">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">
                  Customer Score
                </span>
                <span className="text-base font-bold text-secondary font-headline-sm mt-0.5 block">
                  ★ {selectedVendorModal.rating.toFixed(2)} / 5.0
                </span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-xl">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase block">
                  Compliance Audit
                </span>
                <span className="text-xs font-bold text-primary mt-1 block">
                  {selectedVendorModal.auditBadge || "Standard"} Verified
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedVendorModal(null)}
                className="px-4 py-1.5 rounded-xl bg-primary-container text-on-primary text-xs font-semibold hover:opacity-95 cursor-pointer"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
