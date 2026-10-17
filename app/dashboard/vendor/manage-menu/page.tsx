"use client";

import { useState, useEffect, useMemo } from "react";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import MenuSummaryCards from "@/components/vendor/menu/MenuSummaryCards";
import MenuToolbar from "@/components/vendor/menu/MenuToolbar";
import MenuItemsTable from "@/components/vendor/menu/MenuItemsTable";
import AddEditDishModal from "@/components/vendor/menu/AddEditDishModal";
import DeleteDishDialog from "@/components/vendor/menu/DeleteDishDialog";
import BulkAvailabilityDialog from "@/components/vendor/menu/BulkAvailabilityDialog";
import {
  MenuItem,
  MenuItemFormInput,
} from "@/types/menu";
import {
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleItemAvailability,
  bulkUpdateAvailability,
  resetMenuData,
  getMenuSummaryStats,
} from "@/services/mockMenuService";

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "error";
}

const PAGE_SIZE = 8;

export default function ManageMenuPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Dialogs
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

  // Floating Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    title: string,
    message: string,
    type: "success" | "info" | "error" = "success"
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Initial load
  useEffect(() => {
    setMenuItems(getMenuItems());
    setIsClientLoaded(true);
  }, []);

  const handleRefresh = () => {
    setMenuItems(getMenuItems());
    addToast("Menu Refreshed", "Loaded latest culinary items and availability states.", "info");
  };

  const handleResetData = () => {
    const reset = resetMenuData();
    setMenuItems(reset);
    setCurrentPage(1);
    setSelectedCategory("all");
    setSearchQuery("");
    addToast("Menu Reset", "Restored the original 24 curated heritage dishes.", "info");
  };

  // Dynamic Statistics
  const stats = useMemo(() => {
    return getMenuSummaryStats(menuItems);
  }, [menuItems]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      total: menuItems.length,
    };
    menuItems.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [menuItems]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // 1. Category Filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // 2. Search query (name, description, tags, category)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesTags = item.tags.some((tag) => tag.toLowerCase().includes(q));

        if (!matchesName && !matchesDesc && !matchesCategory && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Reset pagination when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // CRUD Handlers
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setIsAddEditModalOpen(true);
  };

  const handleSaveDish = (data: MenuItemFormInput, id?: string) => {
    if (id) {
      const updated = updateMenuItem(id, data);
      setMenuItems(updated);
      addToast("Dish Updated", `"${data.name}" changes saved successfully.`, "success");
    } else {
      const updated = addMenuItem(data);
      setMenuItems(updated);
      addToast("Dish Published", `"${data.name}" added to menu catalog.`, "success");
    }
  };

  const handleToggleAvailability = (id: string) => {
    const updated = toggleItemAvailability(id);
    setMenuItems(updated);
    const item = updated.find((i) => i.id === id);
    if (item) {
      addToast(
        item.isAvailable ? "Item In Stock" : "Item Sold Out",
        `"${item.name}" availability set to ${item.isAvailable ? "In Stock" : "Sold Out"}.`,
        item.isAvailable ? "success" : "info"
      );
    }
  };

  const handleDeleteConfirm = (id: string) => {
    const target = menuItems.find((i) => i.id === id);
    const updated = deleteMenuItem(id);
    setMenuItems(updated);
    addToast(
      "Dish Removed",
      `"${target?.name || "Dish"}" has been deleted from the menu.`,
      "info"
    );
  };

  const handleBulkAvailabilityConfirm = (isAvailable: boolean) => {
    const updated = bulkUpdateAvailability(isAvailable);
    setMenuItems(updated);
    addToast(
      "Bulk Availability Updated",
      isAvailable
        ? "All menu dishes marked as In Stock."
        : "All menu dishes marked as Sold Out.",
      "success"
    );
  };

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased">
      {/* Vendor Shared Sidebar */}
      <VendorSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="pl-0 lg:pl-72 transition-all duration-300">
        {/* Vendor Top Header */}
        <VendorHeader
          restaurantName="Sultan's Heritage Kitchen"
          onRefresh={handleRefresh}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="relative pt-16 bg-background min-h-screen">
          <div className="flex flex-col w-full">
            <div className="p-space-lg max-w-7xl mx-auto w-full space-y-space-lg">
              {/* Heading & Bulk Actions Bar */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-space-xs text-primary font-label-sm uppercase tracking-wider font-semibold">
                    <span className="material-symbols-outlined text-base">restaurant_menu</span>
                    <span>Menu Catalog</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
                    Menu Management
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                    Update dishes, prices, categories, and item availability for your restaurant.
                  </p>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-space-sm flex-wrap">
                  <button
                    onClick={() => setIsBulkDialogOpen(true)}
                    className="px-space-md py-2.5 rounded-lg bg-surface-container-high text-on-surface font-label-md flex items-center gap-1.5 shadow-sm hover:bg-surface-variant transition-colors cursor-pointer text-xs font-semibold"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-lg">sync_alt</span>
                    <span>Bulk In Stock / Out</span>
                  </button>

                  <button
                    onClick={handleOpenAddModal}
                    className="px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary font-label-md flex items-center gap-1.5 shadow-sm hover:bg-primary transition-all cursor-pointer text-xs font-semibold"
                    id="open-dish-modal-btn"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span>Add New Dish</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Summary Cards */}
              <MenuSummaryCards stats={stats} />

              {/* Search & Category Filter Toolbar */}
              <MenuToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                categoryCounts={categoryCounts}
              />

              {/* Menu Items Table & Pagination */}
              <MenuItemsTable
                items={filteredItems}
                totalItemsCount={filteredItems.length}
                currentPage={currentPage}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
                onToggleAvailability={handleToggleAvailability}
                onEdit={handleOpenEditModal}
                onDelete={(item) => setDeletingItem(item)}
                onResetFilters={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                onAddNewDish={handleOpenAddModal}
              />

              {/* Demo Helper Reset Action */}
              <div className="pt-2 flex items-center justify-between text-xs text-on-surface-variant border-t border-outline-variant/30">
                <span>
                  Showing {filteredItems.length} of {menuItems.length} dishes in Sultan&apos;s Heritage catalog
                </span>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="text-primary hover:underline font-medium cursor-pointer"
                >
                  ↻ Reset Default Dishes
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add / Edit Dish Modal */}
      <AddEditDishModal
        isOpen={isAddEditModalOpen}
        editingItem={editingItem}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveDish}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDishDialog
        isOpen={!!deletingItem}
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Bulk Availability Dialog */}
      <BulkAvailabilityDialog
        isOpen={isBulkDialogOpen}
        totalDishesCount={menuItems.length}
        onClose={() => setIsBulkDialogOpen(false)}
        onConfirm={handleBulkAvailabilityConfirm}
      />

      {/* Floating Toast Notification Stack */}
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
              {toast.type === "error"
                ? "error"
                : toast.type === "info"
                ? "info"
                : "check_circle"}
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
