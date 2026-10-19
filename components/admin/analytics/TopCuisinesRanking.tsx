"use client";

import { CuisinePerformance, VendorPerformance } from "@/types/admin";

interface TopCuisinesRankingProps {
  cuisines: CuisinePerformance[];
  vendors: VendorPerformance[];
}

export default function TopCuisinesRanking({
  cuisines,
  vendors,
}: TopCuisinesRankingProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left (5 cols): Cuisines Breakdown */}
      <div className="lg:col-span-5 bg-surface-container-lowest p-5 sm:p-6 rounded-xl border border-outline-variant shadow-2xs flex flex-col justify-between">
        <div className="pb-3 border-b border-outline-variant/40">
          <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-primary tracking-tight">
            Leading Culinary Genres
          </h2>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Share of platform order volume and year-over-year category growth
          </p>
        </div>

        <div className="divide-y divide-outline-variant/40 mt-3 space-y-3">
          {cuisines.map((c) => (
            <div key={c.name} className="pt-3 first:pt-0 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-on-surface truncate">{c.name}</span>
                <span className="font-mono font-semibold text-primary">
                  ${(c.revenue / 1000000).toFixed(2)}M ({c.orderSharePct}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${c.orderSharePct * 2}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                <span>Top Item: <strong className="font-medium text-on-surface">{c.topDish}</strong></span>
                <span className="text-primary font-bold">+{c.growthPct}% YoY</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right (7 cols): Top Merchant Establishments */}
      <div className="lg:col-span-7 bg-surface-container-lowest p-5 sm:p-6 rounded-xl border border-outline-variant shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
          <div>
            <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-primary tracking-tight">
              Top Commercial Establishments
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
              Ranked by fulfilled gross revenue and patron satisfaction rating
            </p>
          </div>
          <span className="text-xs text-primary font-semibold hover:underline cursor-pointer">
            View All Merchants →
          </span>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/50 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                <th className="py-2.5 px-3">Merchant</th>
                <th className="py-2.5 px-3">Gross Sales</th>
                <th className="py-2.5 px-3">Rating</th>
                <th className="py-2.5 px-3 text-right">SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-xs">
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface">{v.name}</span>
                      <span className="text-[11px] text-on-surface-variant">
                        {v.area} • {v.badge}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-primary">
                        ${(v.revenue / 1000000).toFixed(2)}M
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        {v.orders.toLocaleString()} orders
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 text-amber-700 font-bold">
                      <span className="material-symbols-outlined text-sm">star</span>
                      <span>{v.rating}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
                      {v.fulfillmentRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
