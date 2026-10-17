"use client";

import { MenuItem } from "@/types/menu";

interface MenuItemsTableProps {
  items: MenuItem[];
  totalItemsCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onToggleAvailability: (id: string) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onResetFilters?: () => void;
  onAddNewDish?: () => void;
}

export default function MenuItemsTable({
  items,
  totalItemsCount,
  currentPage,
  pageSize,
  onPageChange,
  onToggleAvailability,
  onEdit,
  onDelete,
  onResetFilters,
  onAddNewDish,
}: MenuItemsTableProps) {
  const totalPages = Math.ceil(totalItemsCount / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  const displayedCount = Math.min(startIndex + pageSize, totalItemsCount);
  const startDisplay = totalItemsCount === 0 ? 0 : startIndex + 1;

  if (items.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/40 p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined text-3xl">restaurant</span>
        </div>
        <div>
          <h3 className="font-headline-sm text-lg font-bold text-primary">
            No Menu Items Found
          </h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
            No dishes match your active search or category filters. Try resetting filters or adding a new culinary item.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              type="button"
              className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-primary transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          )}
          {onAddNewDish && (
            <button
              onClick={onAddNewDish}
              type="button"
              className="px-4 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-colors cursor-pointer"
            >
              Add New Dish
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-2xs border border-outline-variant overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container text-on-surface-variant font-label-sm uppercase tracking-wider text-xs border-b border-outline-variant">
            <tr>
              <th className="py-3.5 px-space-md font-semibold" scope="col">
                Dish Details
              </th>
              <th className="py-3.5 px-space-md font-semibold" scope="col">
                Category
              </th>
              <th className="py-3.5 px-space-md font-semibold" scope="col">
                Price (BDT)
              </th>
              <th className="py-3.5 px-space-md font-semibold" scope="col">
                Daily Sales
              </th>
              <th className="py-3.5 px-space-md font-semibold" scope="col">
                Live Availability
              </th>
              <th className="py-3.5 px-space-md font-semibold text-right" scope="col">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 font-body-sm text-body-sm text-on-surface">
            {paginatedItems.map((item) => {
              const isOut = !item.isAvailable;

              return (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    isOut
                      ? "bg-surface-container/30 hover:bg-surface-container/60 opacity-80"
                      : "hover:bg-surface-container-low"
                  }`}
                >
                  {/* Dish Details */}
                  <td className="py-3.5 px-space-md">
                    <div className="flex items-center gap-space-md">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-2xs bg-surface-container border border-outline-variant">
                        <img
                          className={`w-full h-full object-cover transition-all ${
                            isOut ? "grayscale-[40%]" : ""
                          }`}
                          src={item.image}
                          alt={item.imageAlt || item.name}
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/images/food-placeholder.svg";
                          }}
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-headline-sm text-headline-sm text-on-surface font-medium ${
                              isOut ? "line-through opacity-85" : ""
                            }`}
                          >
                            {item.name}
                          </span>

                          {item.badge && !isOut && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-xs font-semibold">
                              {item.badge}
                            </span>
                          )}

                          {isOut && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary-fixed text-secondary font-label-sm text-xs font-semibold">
                              Sold Out
                            </span>
                          )}
                        </div>

                        <p className="text-on-surface-variant font-body-sm text-xs line-clamp-1 max-w-md">
                          {item.description}
                        </p>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-[11px] text-on-surface-variant"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-space-md whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-md bg-surface-container font-label-sm font-semibold text-on-surface text-xs">
                      {item.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-space-md whitespace-nowrap">
                    <span
                      className={`font-headline-sm text-headline-sm font-semibold ${
                        isOut ? "text-on-surface-variant" : "text-primary"
                      }`}
                    >
                      ৳{item.price.toLocaleString()}
                    </span>
                  </td>

                  {/* Daily Sales */}
                  <td className="py-3.5 px-space-md text-on-surface-variant whitespace-nowrap text-xs">
                    <span className="font-label-md font-semibold text-on-surface">
                      {item.dailySales}
                    </span>{" "}
                    sold today
                  </td>

                  {/* Live Availability Switch */}
                  <td className="py-3.5 px-space-md whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isAvailable}
                          onChange={() => onToggleAvailability(item.id)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface peer-checked:bg-primary-container after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                      <span
                        className={`font-label-sm text-xs font-semibold ${
                          item.isAvailable ? "text-emerald-700" : "text-secondary"
                        }`}
                      >
                        {item.isAvailable ? "In Stock" : "Sold Out"}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-space-md text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                        title="Edit Item"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-secondary-fixed/30 transition-colors cursor-pointer"
                        title="Remove Item"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-space-md py-3 bg-surface-container flex items-center justify-between text-on-surface-variant font-label-sm border-t border-outline-variant/30 text-xs">
        <span>
          Showing {startDisplay} to {displayedCount} of {totalItemsCount} menu items
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded hover:bg-surface-container-high transition-colors disabled:opacity-40 cursor-pointer"
            type="button"
          >
            ‹ Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => onPageChange(pg)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                currentPage === pg
                  ? "bg-surface-container-lowest text-on-surface shadow-xs"
                  : "hover:bg-surface-container-high text-on-surface-variant"
              }`}
              type="button"
            >
              {pg}
            </button>
          ))}
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded hover:bg-surface-container-high transition-colors disabled:opacity-40 cursor-pointer"
            type="button"
          >
            Next ›
          </button>
        </div>
      </div>
    </div>
  );
}
